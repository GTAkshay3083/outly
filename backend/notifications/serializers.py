from rest_framework import serializers
from .models import Profile, Plan, PlanRequest, PlanMessage

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class ProfileMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'username', 'avatar_url', 'bio', 'city', 'state', 'interests', 'outings_attended', 'outings_flaked', 'strike_count']

class PlanSerializer(serializers.ModelSerializer):
    host = ProfileMiniSerializer(read_only=True)
    host_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), source='host', write_only=True
    )

    class Meta:
        model = Plan
        fields = [
            'id',
            'host',
            'host_id',
            'title',
            'category',
            'venue',
            'area_neighborhood',
            'city',
            'state',
            'scheduled_time',
            'slots_total',
            'slots_claimed',
            'split_vibe',
            'notes',
            'status',
            'is_beacon',
            'expires_at',
            'squad_type',
            'created_at',
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['host_id'] = str(instance.host_id)
        return ret

class PlanRequestSerializer(serializers.ModelSerializer):
    applicant = ProfileMiniSerializer(read_only=True)
    applicant_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), source='applicant', write_only=True
    )
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=Plan.objects.all(), source='plan', write_only=True
    )

    class Meta:
        model = PlanRequest
        fields = [
            'id',
            'plan_id',
            'applicant',
            'applicant_id',
            'pitch_message',
            'status',
            'checked_in',
            'checked_in_at',
            'created_at',
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['plan_id'] = str(instance.plan_id)
        ret['applicant_id'] = str(instance.applicant_id)
        return ret

class PlanMessageSerializer(serializers.ModelSerializer):
    sender = ProfileMiniSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), source='sender', write_only=True
    )
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=Plan.objects.all(), source='plan', write_only=True
    )

    class Meta:
        model = PlanMessage
        fields = [
            'id',
            'plan_id',
            'sender',
            'sender_id',
            'content',
            'created_at',
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['plan_id'] = str(instance.plan_id)
        ret['sender_id'] = str(instance.sender_id)
        return ret
