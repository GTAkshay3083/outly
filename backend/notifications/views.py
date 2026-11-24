import json
import logging
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from .models import Profile, Plan, PlanRequest, PlanMessage
from .serializers import (
    ProfileSerializer,
    PlanSerializer,
    PlanRequestSerializer,
    PlanMessageSerializer,
)
from .fcm_service import (
    send_push_notification,
    notify_request_accepted,
    notify_new_join_request,
    notify_squad_message,
)

logger = logging.getLogger(__name__)

@api_view(['GET'])
def health_check(request):
    """Health check endpoint to verify backend status."""
    return Response({
        'status': 'healthy',
        'service': 'outly-unified-django-backend',
        'version': '2.0.0',
    })

# --- AUTH & ONBOARDING API ---

@api_view(['POST'])
def google_auth_view(request):
    """
    Handle Google 1-Tap authentication:
    Accepts verified email, full_name, avatar_url.
    Creates or retrieves the Outly Profile.
    """
    email = request.data.get('email', '').strip().lower()
    full_name = request.data.get('full_name', '').strip() or 'Outly Member'
    avatar_url = request.data.get('avatar_url')

    if not email:
        return Response({'error': 'Email is required'}, status=400)

    # 1. Check if profile with email exists
    profile = Profile.objects.filter(email=email).first()

    # 2. If not, check if user with base username exists
    if not profile:
        base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
        username = base_username
        counter = 1
        while Profile.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        profile = Profile.objects.create(
            email=email,
            full_name=full_name,
            username=username,
            avatar_url=avatar_url,
            city='Chennai',
            onboarded=False,
            outings_attended=0,
            outings_flaked=0,
            strike_count=0,
        )
        logger.info("New user registered via Google: %s (%s)", full_name, email)
    else:
        if avatar_url and not profile.avatar_url:
            profile.avatar_url = avatar_url
            profile.save(update_fields=['avatar_url'])

    return Response(ProfileSerializer(profile).data)

@api_view(['POST'])
def complete_onboarding_view(request):
    """
    Finalize onboarding: save city, vibe interests, custom username, and bio.
    """
    user_id = request.data.get('user_id')
    profile = get_object_or_404(Profile, id=user_id)

    city = request.data.get('city')
    state = request.data.get('state')
    interests = request.data.get('interests', [])
    username = request.data.get('username')
    bio = request.data.get('bio')
    avatar_url = request.data.get('avatar_url')

    if city:
        profile.city = city
    if state:
        profile.state = state
    elif city == 'All Tamil Nadu':
        profile.state = 'Tamil Nadu'
    if interests:
        profile.interests = interests
    if username and username.strip():
        clean_user = username.strip().lstrip('@').lower()
        if not Profile.objects.filter(username=clean_user).exclude(id=profile.id).exists():
            profile.username = clean_user
    if bio is not None:
        profile.bio = bio.strip()
    if avatar_url:
        profile.avatar_url = avatar_url

    profile.onboarded = True
    profile.save()

    return Response(ProfileSerializer(profile).data)

# --- PLANS API ---

class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanSerializer

    def get_queryset(self):
        qs = Plan.objects.select_related('host').order_by('scheduled_time')
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        state = self.request.query_params.get('state')

        if category and category != 'all':
            qs = qs.filter(category=category)
        if city == 'All Tamil Nadu':
            qs = qs.filter(state='Tamil Nadu')
        elif city and city != 'all':
            qs = qs.filter(city=city)
        elif state and state != 'all':
            qs = qs.filter(state=state)

        return qs

    def perform_create(self, serializer):
        serializer.save(slots_claimed=1, status='open')

# --- PROFILES API ---

class ProfileDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'id'

    def get_object(self):
        profile_id = self.kwargs.get('id')
        profile = Profile.objects.filter(id=profile_id).first()
        if not profile:
            profile = Profile.objects.create(
                id=profile_id,
                full_name="Akshay Rathinam",
                username="akshay",
                city="Chennai",
                state="Tamil Nadu",
                bio="Tech enthusiast & explorer. Never flakes.",
                outings_attended=14,
                outings_flaked=0,
                onboarded=True
            )
        return profile

class RateMemberView(APIView):
    """Update show-up rate and strikes for a member after an outing."""
    def post(self, request, id):
        profile = get_object_or_404(Profile, id=id)
        attendance_score = int(request.data.get('attendance', 10))
        
        if attendance_score <= 3:
            # Flaked / no-show
            profile.outings_flaked += 1
            profile.strike_count += 1
        else:
            profile.outings_attended += 1

        profile.save()
        return Response(ProfileSerializer(profile).data)

# --- REQUESTS & PITCHES API ---

class PlanRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanRequestSerializer

    def get_queryset(self):
        qs = PlanRequest.objects.select_related('applicant', 'plan')
        applicant_id = self.request.query_params.get('applicant_id')
        plan_id = self.request.query_params.get('plan_id')
        if applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        if plan_id:
            qs = qs.filter(plan_id=plan_id)
        return qs

    def perform_create(self, serializer):
        req = serializer.save(status='pending')
        
        # Trigger FCM push to the Host
        try:
            host = req.plan.host
            if host and host.fcm_token:
                notify_new_join_request(
                    host_token=host.fcm_token,
                    applicant_name=req.applicant.full_name,
                    plan_title=req.plan.title,
                    pitch_message=req.pitch_message,
                    plan_id=str(req.plan.id),
                )
        except Exception as e:
            logger.warning("FCM notification failed on join request: %s", e)

class PlanRequestAcceptView(APIView):
    """Host accepts applicant into squad -> increments claimed slots and sends FCM push."""
    def post(self, request, id):
        req = get_object_or_404(PlanRequest.objects.select_related('plan', 'applicant'), id=id)
        req.status = 'accepted'
        req.save()

        # Increment claimed slots
        plan = req.plan
        plan.slots_claimed = min(plan.slots_total, plan.slots_claimed + 1)
        plan.save()

        # Send FCM push notification to Applicant
        try:
            if req.applicant.fcm_token:
                notify_request_accepted(
                    fcm_token=req.applicant.fcm_token,
                    plan_title=plan.title,
                    plan_id=str(plan.id),
                )
        except Exception as e:
            logger.warning("FCM notification failed on request accept: %s", e)

        return Response({'status': 'accepted', 'slots_claimed': plan.slots_claimed})

class PlanRequestDeclineView(APIView):
    """Host declines or drops a member from the squad."""
    def post(self, request, id):
        req = get_object_or_404(PlanRequest.objects.select_related('plan'), id=id)
        was_accepted = (req.status == 'accepted')
        req.status = 'declined'
        req.save()

        plan = req.plan
        if was_accepted:
            plan.slots_claimed = max(1, plan.slots_claimed - 1)
            plan.save()

        return Response({'status': 'declined', 'slots_claimed': plan.slots_claimed})

# --- SQUAD MESSAGES API ---

class PlanMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanMessageSerializer

    def get_queryset(self):
        plan_id = self.request.query_params.get('plan_id')
        if not plan_id:
            return PlanMessage.objects.none()
        return PlanMessage.objects.filter(plan_id=plan_id).select_related('sender').order_by('created_at')

    def perform_create(self, serializer):
        msg = serializer.save()

        # Send multicast push notification to offline squad members
        try:
            plan = msg.plan
            sender_id = msg.sender_id
            tokens = []

            # 1. Host token
            if plan.host_id != sender_id and plan.host.fcm_token:
                tokens.append(plan.host.fcm_token)

            # 2. Accepted members tokens
            accepted_reqs = PlanRequest.objects.filter(
                plan=plan, status='accepted'
            ).select_related('applicant')

            for r in accepted_reqs:
                if r.applicant_id != sender_id and r.applicant.fcm_token:
                    tokens.append(r.applicant.fcm_token)

            unique_tokens = list(set(tokens))
            if unique_tokens:
                notify_squad_message(
                    tokens=unique_tokens,
                    sender_name=msg.sender.full_name,
                    message_content=msg.content,
                    plan_title=plan.title,
                    plan_id=str(plan.id),
                )
        except Exception as e:
            logger.warning("FCM notification failed on message dispatch: %s", e)

@api_view(['POST'])
def check_in_member(request, plan_id):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id required'}, status=400)

    plan = get_object_or_404(Plan, id=plan_id)
    now = timezone.now()

    if str(plan.host_id) == str(user_id):
        profile = plan.host
        profile.outings_attended += 1
        profile.save()
        return Response({'status': 'checked_in', 'user_id': user_id, 'is_host': True, 'time': now.isoformat()})

    req = get_object_or_404(PlanRequest, plan=plan, applicant_id=user_id, status='accepted')
    if not req.checked_in:
        req.checked_in = True
        req.checked_in_at = now
        req.save()

        # Increment attendance on profile
        profile = req.applicant
        profile.outings_attended += 1
        profile.save()

    return Response({'status': 'checked_in', 'user_id': user_id, 'time': now.isoformat()})

# --- DIRECT TEST PUSH ---

@api_view(['POST'])
def test_push_view(request):
    token = request.data.get('token')
    title = request.data.get('title', 'Outly Test Push 🚀')
    body = request.data.get('body', 'This is a test notification from the Outly Django backend!')

    if not token:
        return Response({'error': 'Device token is required'}, status=400)

    result = send_push_notification(token, title, body, request.data.get('data'))
    return Response({'result': result})
