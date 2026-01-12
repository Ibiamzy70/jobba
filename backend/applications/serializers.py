from rest_framework import serializers
from django.db import transaction, IntegrityError
from jobs.models import Job 
from .models import Application
from applicant.serializers import JobSeekerSerializer
from jobs.serializers import JobListSerializer


def validate_resume_file(value):
   
    if not value:
        return value

   
    allowed_extensions = ['.pdf', '.doc', '.docx']
    ext = '.' + value.name.split('.')[-1].lower() if '.' in value.name else ''
    if ext not in allowed_extensions:
        raise serializers.ValidationError(
            "Only PDF, DOC, or DOCX files are allowed for resumes."
        )

    
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise serializers.ValidationError(
            "Resume file size cannot exceed 5MB."
        )

    return value


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = JobSeekerSerializer(read_only=True)
    job = JobListSerializer(read_only=True)

    # Write-only: job to apply for
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(is_published=True),
        source="job",
        write_only=True,
    )

    
    applicant_name = serializers.CharField(source="applicant.user.full_name", read_only=True)
    applicant_email = serializers.EmailField(source="applicant.user.email", read_only=True)
    applicant_avatar = serializers.SerializerMethodField(read_only=True)

    company_name = serializers.CharField(source="job.company", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)

    resume = serializers.FileField(
        required=False,
        allow_null=True,
        validators=[validate_resume_file],
        help_text="Upload your resume (PDF, DOC, DOCX). Max 5MB."
    )
    status = serializers.ChoiceField(
        choices=Application.STATUS_CHOICES,
        required=False,
        help_text="Employer can update application status"
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_id",
            "job_title",
            "company_name",
            "applicant",
            "applicant_name",
            "applicant_email",
            "applicant_avatar",
            "cover_letter",
            "resume",
            "skills",
            "experience_level",
            "ai_match_score",
            "ai_insights",
            "status",
            "reviewed",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "applicant",
            "applicant_name",
            "applicant_email",
            "applicant_avatar",
            "company_name",
            "job_title",
            "ai_match_score",
            "ai_insights",
            "status",
            "reviewed",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]

    def get_applicant_avatar(self, obj):
        
        if not obj.applicant:
            return None
        
        avatar = obj.applicant.avatar
        
       
        if not avatar:
            return None
        
        
        if avatar.startswith('http://') or avatar.startswith('https://'):
            return avatar
        
        
        request = self.context.get("request")
        if request:
            # Ensure proper path format
            if not avatar.startswith('/'):
                avatar = f'/{avatar}'
            return request.build_absolute_uri(avatar)
        
        return avatar

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required to apply.")

        job = attrs.get("job")
        if job:
            existing = Application.objects.filter(
                job=job,
                applicant__user=request.user
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    "You have already applied for this job."
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required to apply.")

        try:
            job_seeker = request.user.applicant_profile
        except AttributeError:
            raise serializers.ValidationError("Complete your applicant profile before applying.")

        validated_data["applicant"] = job_seeker
        return super().create(validated_data)