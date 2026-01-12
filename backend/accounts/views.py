from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    MyTokenObtainPairSerializer,
    UserSerializer
)
from accounts.models import User
from employers.models import Employer
from applicant.models import JobSeeker
from accounts.serializers import JobSeekerSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        
        
        if user.role == 'job_seeker':
            
            first_name = ''
            last_name = ''
            if user.full_name:
                name_parts = user.full_name.strip().split(' ', 1)
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            JobSeeker.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                phone=user.phone_number or '',
                onboarding_completed=False
            )


class MyTokenObtainPairView(TokenObtainPairView):
    
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        
        data = serializer.validated_data
        refresh_token = data.pop("refresh_token")
        
        # Create response with access_token and user
        response = Response(data, status=status.HTTP_200_OK)
        
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,  
            samesite="Lax",  
            max_age=60 * 60 * 24 * 7,  
        )
        
        return response


class RefreshTokenView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found in cookies"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            return Response(
                {"access_token": access_token},
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {"detail": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response(
            {"detail": "Successfully logged out"},
            status=status.HTTP_200_OK
        )
        
        # Clear the refresh_token cookie
        response.delete_cookie("refresh_token")
        
        
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass  
        
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicantPersonalInfoView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        
        try:
            profile = request.user.applicant_profile    
        except JobSeeker.DoesNotExist:
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = JobSeekerSerializer(profile)
        return Response(serializer.data)
    

class UpdateUserRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, user_id):
        role = request.data.get("role")

        if role not in ["employer", "job_seeker"]:
            return Response({"error": "Invalid role"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # update role
        user.role = role
        user.save()

        
        if role == "employer":
            Employer.objects.get_or_create(
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
                },
            )
        
        if role == "job_seeker":
            JobSeeker.objects.get_or_create(user=user)

        return Response({
            "message": "Role updated",
            "new_role": user.role
        })