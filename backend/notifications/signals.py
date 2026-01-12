from django.dispatch import receiver
from django.db.models.signals import post_save
from jobs.models import JobApplication
from .models import Notification

# 1. When an application is submitted -> notify employer
@receiver(post_save, sender=JobApplication)
def notify_employer_on_new_application(sender, instance, created, **kwargs):
    if created:
        job = instance.job
        employer = job.owner  

        Notification.objects.create(
            recipient=employer,
            actor=instance.applicant,
            notification_type="application_submitted",
            message=f"{instance.first_name} {instance.last_name} applied for {job.title}",
            job=job,
            application=instance,
        )


# 2. When employer reviews an application → notify applicant
@receiver(post_save, sender=JobApplication)
def notify_applicant_on_review(sender, instance, created, **kwargs):
    if not created and instance.reviewed:
        applicant = instance.applicant
        if applicant:
            Notification.objects.create(
                recipient=applicant,
                actor=instance.reviewer,
                notification_type="application_reviewed",
                message=f"Your application for {instance.job.title} has been reviewed.",
                job=instance.job,
                application=instance,
            )
