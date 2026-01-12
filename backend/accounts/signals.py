from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from accounts.models import User
from employers.models import Employer

@receiver(post_save, sender=User)
def create_or_update_employer_profile(sender, instance, created, **kwargs):
    # If user is employer, ensure Employer profile exists
    if instance.role == "employer":
        Employer.objects.get_or_create(user=instance)
