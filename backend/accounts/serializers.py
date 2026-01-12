from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from accounts.models import User
from employers.models import Employer
from applicant.models import JobSeeker

User = get_user_model()


# --------------------------- REGISTER SERIALIZER ---------------------------

class RegisterSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ["email", "full_name", "role", "password", "password2"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        role = validated_data.pop("role")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        
        if role == "employer":
            Employer.objects.create(user=user)

        elif role == "job_seeker":  
            JobSeeker.objects.create(user=user)

        
        user.role = role
        user.save()

        return user


# --------------------------- LOGIN SERIALIZER (MODIFIED FOR FRONTEND) ---------------------------

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")
        
        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        # Get tokens from parent class
        refresh = self.get_token(user)
        
        # Return structure matching frontend expectations
        return {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),  # This will be set as httpOnly cookie in view
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": getattr(user, "full_name", ""),
                "phone_number": getattr(user, "phone_number", ""),
                "role": getattr(user, "role", ""),
                "created_at": user.created_at.isoformat() if hasattr(user, "created_at") else None,
            }
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = getattr(user, "role", "")
        return token


# --------------------------- PROFILE / ME SERIALIZER ---------------------------

class UserSerializer(serializers.ModelSerializer):
    
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone_number",
            "role",
            "created_at",
        )
        read_only_fields = ("id", "email", "role", "created_at")

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if hasattr(instance, attr):
                setattr(instance, attr, value)
        instance.save()
        return instance
    

class JobSeekerSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeeker
        fields = [
            "id", "first_name", "last_name", "phone", "location",
            "bio", "avatar", "created_at", "updated_at"
        ]