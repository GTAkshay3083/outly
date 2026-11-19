from django.urls import path
from . import views

urlpatterns = [
    # Health & Diagnostics
    path('health/', views.health_check, name='notifications_health'),
    path('test-push/', views.test_push_view, name='test_push'),

    # Auth & Onboarding
    path('auth/google/', views.google_auth_view, name='auth_google'),
    path('auth/onboarding/', views.complete_onboarding_view, name='auth_onboarding'),

    # Plans
    path('plans/', views.PlanListCreateView.as_view(), name='plans_list_create'),
    path('plans/<uuid:plan_id>/check-in/', views.check_in_member, name='plan_check_in'),

    # Profiles
    path('profiles/<uuid:id>/', views.ProfileDetailUpdateView.as_view(), name='profile_detail_update'),
    path('profiles/<uuid:id>/rate/', views.RateMemberView.as_view(), name='profile_rate'),

    # Join Requests & Pitches
    path('requests/', views.PlanRequestListCreateView.as_view(), name='requests_list_create'),
    path('requests/<uuid:id>/accept/', views.PlanRequestAcceptView.as_view(), name='request_accept'),
    path('requests/<uuid:id>/decline/', views.PlanRequestDeclineView.as_view(), name='request_decline'),

    # Squad Messages
    path('messages/', views.PlanMessageListCreateView.as_view(), name='messages_list_create'),
]
