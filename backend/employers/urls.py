from django.urls import path
from .views import EmployerProfileView, ApplicantProfileView

urlpatterns = [
    path("me/", EmployerProfileView.as_view(), name="employer-profile"),
    path("applicants/<int:applicant_id>/profile/", ApplicantProfileView.as_view(), name="view-applicant-profile"),
]
