from django.db import models
from applicant.models import JobSeeker
from jobs.models import Job
from django.utils import timezone


class Application(models.Model):
    STATUS_CHOICES = (
        ("applied", "Applied"),
        ("under_review", "Under Review"),
        ("shortlisted", "Shortlisted"),
        ("interview", "Interview Scheduled"),
        ("offer", "Offer Extended"),
        ("rejected", "Rejected"),
        ("withdrawn", "Withdrawn"),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name="applications")

    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to="applications/resumes/", blank=True, null=True)
    skills = models.JSONField(default=list, blank=True) 
    experience_level = models.CharField(max_length=50, blank=True)

    
    ai_match_score = models.FloatField(null=True, blank=True, help_text="0–100 match score from AI")
    ai_insights = models.JSONField(null=True, blank=True)  
    reviewed = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["job", "applicant"]  

    def __str__(self):
        return f"{self.applicant} → {self.job.title}"

    def save(self, *args, **kwargs):
        if self.reviewed and not self.reviewed_at:
            self.reviewed_at = timezone.now()
        super().save(*args, **kwargs)