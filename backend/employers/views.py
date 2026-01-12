from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Employer
from .serializers import EmployerSerializer, EmployerUpdateSerializer
from rest_framework.exceptions import NotFound
from .models import Employer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from applicant.models import JobSeeker, WorkExperience, Education, Skill, Portfolio
from applicant.serializers import (
    JobSeekerSerializer,
    WorkExperienceSerializer,
    EducationSerializer,
    SkillSerializer,
    PortfolioSerializer
)

User = get_user_model()

class EmployerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

       
        if user.role != "employer":
            raise NotFound("You are not an employer.")

        
        employer, created = Employer.objects.get_or_create(
            user=user,
            defaults={
                "company_name": "",
                "description": "",
                "industry": "",
                "employee_size": "",
                "address": "",
                "country": "",
                "state": "",
                "phone_number": "",
            }
        )

        return employer

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return EmployerUpdateSerializer
        return EmployerSerializer

class ApplicantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, applicant_id):
        print(f"\n{'='*50}")
        print(f"🔍 ApplicantProfileView CALLED")
        print(f"   Profile ID: {applicant_id}")
        print(f"   User: {request.user.email}")
        print(f"   User Role: {request.user.role}")
        print(f"{'='*50}\n")
        
        if request.user.role != 'employer':
            print("❌ User is not an employer")
            return Response(
                {"detail": "Only employers can view applicant profiles"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            print(f"Looking for JobSeeker profile with id={applicant_id}...")
            profile = JobSeeker.objects.get(id=applicant_id)
            print(f"✅ Found profile: {profile}")
            
            # Get related data - NOTE: Model uses 'jobseeker' not 'profile'!
            print("Fetching related data...")
            experiences = WorkExperience.objects.filter(jobseeker=profile)
            educations = Education.objects.filter(jobseeker=profile)
            skills = Skill.objects.filter(jobseeker=profile)
            portfolio = Portfolio.objects.filter(jobseeker=profile)
            print(f"✅ Found {experiences.count()} experiences, {educations.count()} educations")
            
            # Serialize everything
            print("Serializing data...")
            profile_data = JobSeekerSerializer(profile).data
            
            response_data = {
                **profile_data,
                'experience': WorkExperienceSerializer(experiences, many=True).data,
                'education': EducationSerializer(educations, many=True).data,
                'skills': SkillSerializer(skills, many=True).data,
                'portfolio': PortfolioSerializer(portfolio, many=True).data,
            }
            
            print(f"✅ Returning profile data")
            return Response(response_data)
            
        except JobSeeker.DoesNotExist:
            print(f"❌ JobSeeker.DoesNotExist - no profile with id={applicant_id}")
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"❌ Unexpected error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Error loading profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )