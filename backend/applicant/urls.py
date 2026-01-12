from django.urls import path
from .views import (
    JobSeekerProfileView, 
    WorkExperienceListView,
    WorkExperienceDetailView, 
    EducationListView,
    EducationDetailView, 
    SkillsListView,
    SkillDetailView, 
    PortfolioListView, 
    PortfolioDetailView, job_suggestions )

urlpatterns = [
    
    path("profile/", JobSeekerProfileView.as_view(), name="jobseeker-profile"),
    path('skills/', SkillsListView.as_view(), name='skills-list'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),
    path('experiences/', WorkExperienceListView.as_view(), name='work-experience-list'),
    path('experiences/<int:pk>/', WorkExperienceDetailView.as_view(), name='work-experience-detail'),
    path('educations/', EducationListView.as_view(), name='education-list'),
    path('educations/<int:pk>/', EducationDetailView.as_view(), name='education-detail'),
    path('portfolio/', PortfolioListView.as_view(), name='portfolio-list'),
    path('portfolio/<int:pk>/', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('job-suggestions/', job_suggestions, name='job-suggestions'),
]
