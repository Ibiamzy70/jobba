from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "notification_type",
            "message",
            "job",
            "application",
            "is_read",
            "created_at",
        ]
        read_only_fields = (
            "id",
            "recipient",
            "actor",
            "notification_type",
            "message",
            "job",
            "application",
            "created_at",
        )
