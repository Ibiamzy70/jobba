from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("application_submitted", "New Job Application"),
        ("application_reviewed", "Application Reviewed"),
        ("system", "System Notification"),
    )

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    actor = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="actor_notifications"
    )
    notification_type = models.CharField(max_length=40, choices=NOTIFICATION_TYPES)
    message = models.TextField()

    # Optional link to job / application
    job = models.ForeignKey("jobs.Job", null=True, blank=True, on_delete=models.CASCADE)
    application = models.ForeignKey("applications.Application", null=True, blank=True, on_delete=models.CASCADE)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification to {self.recipient} — {self.notification_type}"
