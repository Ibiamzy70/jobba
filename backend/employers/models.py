from django.db import models
from django.conf import settings
from django.utils import timezone

class Employer(models.Model):
    VERIFICATION_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employer_profile"
    )

    company_name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="employer_logos/", null=True, blank=True)
    description = models.TextField()

    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100)
    employee_size = models.CharField(max_length=100)

    address = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True, null=True)

    phone_number = models.CharField(max_length=32)
    
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name

