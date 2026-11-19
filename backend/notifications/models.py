import uuid
from django.db import models

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=30, blank=True, null=True)
    full_name = models.CharField(max_length=150)
    username = models.CharField(max_length=100, unique=True)
    avatar_url = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, default='Tamil Nadu')
    city = models.CharField(max_length=100, default='Chennai')
    email = models.EmailField(blank=True, null=True, unique=True)
    interests = models.JSONField(default=list, blank=True)
    onboarded = models.BooleanField(default=False)
    safety_contact_name = models.CharField(max_length=150, blank=True, null=True)
    safety_contact_phone = models.CharField(max_length=50, blank=True, null=True)
    outings_attended = models.IntegerField(default=0)
    outings_flaked = models.IntegerField(default=0)
    strike_count = models.IntegerField(default=0)
    suspended_until = models.DateTimeField(blank=True, null=True)
    fcm_token = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} (@{self.username})"

class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='hosted_plans')
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50)
    venue = models.CharField(max_length=255)
    area_neighborhood = models.CharField(max_length=150)
    city = models.CharField(max_length=100, default='Chennai')
    state = models.CharField(max_length=100, default='Tamil Nadu')
    scheduled_time = models.DateTimeField()
    slots_total = models.IntegerField(default=3)
    slots_claimed = models.IntegerField(default=1)
    split_vibe = models.CharField(max_length=50, default='Split equally')
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='open')
    is_beacon = models.BooleanField(default=False)
    expires_at = models.DateTimeField(blank=True, null=True)
    squad_type = models.CharField(max_length=20, default='all')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.host.full_name}"

class PlanRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='requests')
    applicant = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='plan_requests')
    pitch_message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('plan', 'applicant')

    def __str__(self):
        return f"{self.applicant.full_name} -> {self.plan.title} ({self.status})"

class PlanMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:30]}"
