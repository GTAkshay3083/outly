from django.contrib import admin
from .models import Profile, Plan, PlanRequest, PlanMessage

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'username', 'city', 'outings_attended', 'outings_flaked', 'strike_count', 'phone')
    search_fields = ('full_name', 'username', 'phone', 'city')
    list_filter = ('city', 'strike_count')

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'host', 'category', 'venue', 'area_neighborhood', 'scheduled_time', 'slots_claimed', 'slots_total', 'status')
    search_fields = ('title', 'venue', 'area_neighborhood', 'host__full_name')
    list_filter = ('category', 'status', 'scheduled_time')

@admin.register(PlanRequest)
class PlanRequestAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'plan', 'status', 'pitch_message', 'created_at')
    search_fields = ('applicant__full_name', 'plan__title', 'pitch_message')
    list_filter = ('status', 'created_at')

@admin.register(PlanMessage)
class PlanMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'plan', 'content', 'created_at')
    search_fields = ('sender__full_name', 'plan__title', 'content')
    list_filter = ('created_at',)
