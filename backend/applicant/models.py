from django.db import models
from django.conf import settings


class JobSeeker(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applicant_profile"
    )
    first_name = models.CharField(max_length=50, blank=True, default='')
    last_name = models.CharField(max_length=50, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    availability = models.CharField(max_length=20, default='immediate')
    expected_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cv = models.FileField(upload_to="cvs/", blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)
    onboarding_completed = models.BooleanField(default=False)
    skills = models.TextField(blank=True)
    experience_level = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ("intern", "Intern"),
            ("entry", "Entry Level"),
            ("mid", "Mid Level"),
            ("senior", "Senior Level"),
            ("lead", "Lead Level"),
        ]
    )
    linkedin = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    github = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"JobSeeker: {self.user.email}"
    

class WorkExperience(models.Model):
    jobseeker = models.ForeignKey(
        JobSeeker,
        on_delete=models.CASCADE,
        related_name='work_experiences'
    )
    job_title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.job_title} at {self.company}"
    

class Education(models.Model):
    jobseeker = models.ForeignKey(
        JobSeeker,
        on_delete=models.CASCADE,
        related_name='educations'
    )
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=100)
    field_of_study = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-end_date']
    
    def __str__(self):
        return f"{self.degree} - {self.institution}"
    

class Skill(models.Model):
    jobseeker = models.ForeignKey(
        JobSeeker,
        on_delete=models.CASCADE,
        related_name='skill_items'
    )
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=50,
        default='technical',
        choices=[
            ('technical', 'Technical'),
            ('soft', 'Soft Skills'),
            ('language', 'Languages'),
            ('tools', 'Tools & Software'),
            ('other', 'Other'),
        ]
    )
    proficiency = models.CharField(
        max_length=50,
        default='intermediate',
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['jobseeker', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Portfolio(models.Model):
    
    
    jobseeker = models.ForeignKey(
        JobSeeker,
        on_delete=models.CASCADE,
        related_name='portfolios'
    )
    profile = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)  
    image = models.CharField(max_length=500, blank=True, null=True) 
    project_url = models.URLField(max_length=200, blank=True, null=True) 
    technologies = models.JSONField(default=list)  
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']  
        verbose_name = 'Portfolio Item'
        verbose_name_plural = 'Portfolio Items'
    
    def __str__(self):
        return f"{self.title}"
    
    