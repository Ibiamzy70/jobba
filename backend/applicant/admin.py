from django.contrib import admin
from .models import JobSeeker



@admin.register(JobSeeker)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "experience_level")
    search_fields = ("user__email", "skills")



