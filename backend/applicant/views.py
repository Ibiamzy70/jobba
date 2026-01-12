import logging
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, permissions, generics, mixins, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from jobs.serializers import JobSerializer
from django.utils import timezone
from django.db.models import Q
from services.ai_client import ai_parse_resume, ai_match_score, AIServiceError
from services.media_service import optimize_image, MediaServiceError
from .models import JobSeeker, WorkExperience, Education, Skill, Portfolio
from .serializers import (
    JobSeekerSerializer,
    WorkExperienceSerializer,
    EducationSerializer,
    SkillSerializer,
    PortfolioSerializer,
)

logger = logging.getLogger(__name__)


# ====================== Throttling ======================
class HeavyAIThrottle(UserRateThrottle):
    """Limit expensive AI operations (suggestions, parsing fallback)"""
    rate = "10/hour"


class ModerateThrottle(UserRateThrottle):
    rate = "60/minute"


# ====================== Base Mixin ======================
class ApplicantOwnedMixin:
    """Ensures objects belong to the authenticated user's profile"""
    
    def get_profile(self):
        try:
            return self.request.user.applicant_profile
        except ObjectDoesNotExist:
            raise ObjectDoesNotExist("Applicant profile not found")

    def get_queryset(self):
        profile = self.get_profile()
        return self.model.objects.filter(jobseeker=profile)


# ====================== JobSeeker Profile ======================
class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = JobSeekerSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_classes = [ModerateThrottle]

    def get_object(self):
        profile, created = JobSeeker.objects.get_or_create(
            user=self.request.user,
            defaults={
                "first_name": "",
                "last_name": "",
                "phone": self.request.user.phone_number or "",
            },
        )

        if created:
            self._sync_from_user(profile)
        else:
            self._sync_from_user(profile)

        return profile

    def _sync_from_user(self, profile):
        updated_fields = []

        if self.request.user.full_name:
            parts = self.request.user.full_name.strip().split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

            if not profile.first_name:
                profile.first_name = first_name
                updated_fields.append("first_name")
            if not profile.last_name:
                profile.last_name = last_name
                updated_fields.append("last_name")

        if not profile.phone and self.request.user.phone_number:
            profile.phone = self.request.user.phone_number
            updated_fields.append("phone")

        if updated_fields:
            profile.save(update_fields=updated_fields)

    def patch(self, request, *args, **kwargs):
        """Handle avatar clearing"""
        if "avatar" in request.data and request.data["avatar"] in ("", None):
            self.get_object().avatar = None
            self.get_object().save(update_fields=["avatar"])
        return super().patch(request, *args, **kwargs)


# ====================== Generic CRUD ViewSet for Related Models ======================
class BaseApplicantRelatedViewSet(
    ApplicantOwnedMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    throttle_classes = [ModerateThrottle]
    pagination_class = None

    def get_queryset(self):
        return super().get_queryset().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data,
        })


class SkillViewSet(BaseApplicantRelatedViewSet):
    serializer_class = SkillSerializer
    model = Skill


class WorkExperienceViewSet(BaseApplicantRelatedViewSet):
    serializer_class = WorkExperienceSerializer
    model = WorkExperience


class EducationViewSet(BaseApplicantRelatedViewSet):
    serializer_class = EducationSerializer
    model = Education


# ====================== Portfolio (Special Handling for Images) ======================
class PortfolioViewSet(BaseApplicantRelatedViewSet):
    serializer_class = PortfolioSerializer
    model = Portfolio
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        profile = self.get_profile()
        image_file = request.FILES.get("image")
        data = request.data.copy()
        if "image" in data:
            del data["image"]

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if image_file:
            try:
                optimized_url = optimize_image(
                    image_file,
                    request_id=request.META.get("HTTP_X_REQUEST_ID"),
                )
                serializer.save(jobseeker=profile, image=optimized_url)
            except MediaServiceError as e:
                logger.error(
                    "Portfolio image optimization failed",
                    extra={
                        "user_id": request.user.id,
                        "request_id": request.META.get("HTTP_X_REQUEST_ID"),
                        "error": str(e),
                    },
                )
                return Response(
                    {"error": "Image processing temporarily unavailable"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
        else:
            serializer.save(jobseeker=profile)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        portfolio = self.get_object()
        image_file = request.FILES.get("image")
        data = request.data.copy()
        if "image" in data:
            del data["image"]

        serializer = self.get_serializer(portfolio, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if image_file:
            try:
                optimized_url = optimize_image(
                    image_file,
                    request_id=request.META.get("HTTP_X_REQUEST_ID"),
                )
                serializer.save(image=optimized_url)
            except MediaServiceError as e:
                logger.error(
                    "Portfolio image update failed",
                    extra={
                        "portfolio_id": portfolio.id,
                        "user_id": request.user.id,
                        "request_id": request.META.get("HTTP_X_REQUEST_ID"),
                        "error": str(e),
                    },
                )
                return Response(
                    {"error": "Image processing temporarily unavailable"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
        else:
            if "image" in request.data and request.data["image"] in ("", None):
                serializer.save(image=None)
            else:
                serializer.save()

        return Response(serializer.data)


# ====================== Legacy List/Detail Views ======================
class SkillsListView(generics.ListCreateAPIView):
    """Legacy view for skills list"""
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(jobseeker__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.applicant_profile
        serializer.save(jobseeker=profile)


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Legacy view for skill detail"""
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(jobseeker__user=self.request.user)


class WorkExperienceListView(generics.ListCreateAPIView):
    """Legacy view for work experience list"""
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(jobseeker__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.applicant_profile
        serializer.save(jobseeker=profile)


class WorkExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Legacy view for work experience detail"""
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(jobseeker__user=self.request.user)


class EducationListView(generics.ListCreateAPIView):
    """Legacy view for education list"""
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(jobseeker__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.applicant_profile
        serializer.save(jobseeker=profile)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Legacy view for education detail"""
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(jobseeker__user=self.request.user)


class PortfolioListView(generics.ListCreateAPIView):
    """Legacy view for portfolio list"""
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Portfolio.objects.filter(jobseeker__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.applicant_profile
        serializer.save(jobseeker=profile)


class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Legacy view for portfolio detail"""
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Portfolio.objects.filter(jobseeker__user=self.request.user)



# ====================== Job Suggestions ======================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def job_suggestions(request):
    throttle = HeavyAIThrottle()
    if not throttle.allow_request(request, None):
        return Response(
            {"error": "Rate limit exceeded for job suggestions"},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    try:
        profile = request.user.applicant_profile
    except ObjectDoesNotExist:
        return Response(
            {"error": "Applicant profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not profile.cv:
        return Response({"count": 0, "suggestions": [], "source": "no_resume"})

    request_id = request.META.get("HTTP_X_REQUEST_ID")

    
    resume_text = build_resume_text_from_profile(profile)

    
    if len(resume_text) < 50:
        resume_file = profile.cv if profile.cv else None
        if not resume_file:
            latest_app = profile.applications.filter(resume__isnull=False).order_by("-created_at").first()
            if latest_app:
                resume_file = latest_app.resume

        if resume_file:
            try:
                with transaction.atomic():
                    parsed_data = ai_parse_resume(resume_file)
                    parsed_resume = parsed_data.get("parsed_resume", {})
                resume_text = _format_resume_text(parsed_resume)[:10000]
                source = "fresh_parse"
            except AIServiceError as e:
                logger.error(
                    "AI resume parse failed for suggestions",
                    extra={"user_id": request.user.id, "request_id": request_id, "error": str(e)},
                )
                resume_text = "Candidate with uploaded resume. Skills: Various technical and soft skills. Experience: Entry to mid level in relevant fields. Summary: Motivated professional seeking opportunities. Please match based on potential."
                source = "parse_fallback"
        else:
            source = "no_resume_data"
    else:
        source = "profile_data"

    
    resume_text = resume_text.strip()
    if len(resume_text) < 50:
        resume_text = "Candidate with uploaded resume. Skills: Various technical and soft skills. Experience: Entry to mid level in relevant fields. Summary: Motivated professional seeking opportunities. Please match based on potential."

    resume_text = resume_text[:10000]

    
    logger.info(
        "Generated resume_text for AI match",
        extra={
            "user_id": request.user.id,
            "length": len(resume_text),
            "preview": resume_text[:100] + "..." if len(resume_text) > 100 else resume_text,
            "source": source,
        }
    )

   
    if len(resume_text) < 50:
        logger.warning("Resume text invalid after all processing — skipping AI")
        return Response({"count": 0, "suggestions": [], "source": "invalid_resume_data"})

    open_jobs = Job.objects.filter(
        Q(expires_at__gt=timezone.now()) | Q(expires_at__isnull=True),
        is_published=True
    ).select_related("owner", "category").order_by('-created_at')[:10]

    suggestions = []
    failure_count = 0
    for job in open_jobs:
        try:
            job_description = _format_job_description(job)[:10000]

            match_payload = {
                "resume_text": resume_text,
                "job_description": job_description,
            }

            match_data = ai_match_score(match_payload)
            matching = match_data.get("matching", match_data)  
            score = matching.get("match_score", 0)
            breakdown = matching.get("breakdown", {})
            explanation = matching.get("explanation", "")

            if score >= 50:
                job_data = JobSerializer(job, context={"request": request}).data
                job_data["match_score"] = score
                job_data["match_insights"] = {
                    "breakdown": breakdown,
                    "explanation": explanation
                }
                suggestions.append(job_data)
        except AIServiceError as e:
            logger.warning(
                "AI match failed for job in suggestions",
                extra={
                    "job_id": job.id,
                    "user_id": request.user.id,
                    "request_id": request_id,
                    "error": str(e),
                },
            )
            failure_count += 1
            if failure_count >= 3:
                logger.info("Too many AI failures — stopping suggestions early")
                break
            continue

    suggestions.sort(key=lambda x: x["match_score"], reverse=True)
    limit = int(request.query_params.get("limit", 10))
    top_suggestions = suggestions[:limit]

    logger.info(
        "Job suggestions generated",
        extra={
            "user_id": request.user.id,
            "request_id": request_id,
            "count": len(top_suggestions),
            "source": source,
            "total_scored": len(suggestions),
        },
    )

    return Response({
        "count": len(top_suggestions),
        "suggestions": top_suggestions,
        "source": source,
    })



def build_resume_text_from_profile(profile: JobSeeker) -> str:
    parts = []

    if profile.bio:
        parts.append(profile.bio.strip())

    for exp in profile.work_experiences.all().order_by('-start_date'):
        line = f"{exp.job_title} at {exp.company}"
        if exp.location:
            line += f", {exp.location}"
        if exp.description:
            line += f". {exp.description.strip()}"
        parts.append(line)

    for edu in profile.educations.all().order_by('-start_date'):
        line = f"{edu.degree} in {edu.field_of_study} from {edu.institution}"
        if edu.description:
            line += f". {edu.description.strip()}"
        parts.append(line)

    skills = [skill.name for skill in profile.skill_items.all()]
    if skills:
        parts.append(f"Skills: {', '.join(skills)}")

    if not parts:
        return "Candidate with professional experience. Skills: Various. Experience: Entry to mid level."

    text = "\n\n".join(parts).strip()

    logger.debug(f"Raw profile text: '{text}' (length: {len(text)})")

    if len(text) < 50:
        text = "Candidate with professional experience. Skills: Various. Experience: Entry to mid level. " + text  

    return text

def _format_resume_text(parsed_resume: dict) -> str:
    parts = []
    
    skills = parsed_resume.get("skills", [])
    if skills:
        if isinstance(skills, list):
            parts.append(f"Skills: {', '.join(str(s) for s in skills)}")
        else:
            parts.append(f"Skills: {skills}")
    
    exp_level = parsed_resume.get("experience_level", "")
    if exp_level:
        parts.append(f"Experience Level: {exp_level}")
    
    summary = parsed_resume.get("summary")
    if summary:
        parts.append(f"Summary: {summary}")
    
    experience = parsed_resume.get("experience")
    if experience:
        parts.append(f"Experience: {experience}")
    
    education = parsed_resume.get("education")
    if education:
        parts.append(f"Education: {education}")

    text = "\n\n".join(parts)
    
    logger.debug(f"Raw resume text before fallback: '{text}' (length: {len(text)})")
    
    stripped_text = text.strip()
    
    if not stripped_text or len(stripped_text) < 50:
        fallback = "Candidate with uploaded resume. Skills: Various technical and soft skills. Experience: Entry to mid level in relevant fields. Summary: Motivated professional seeking opportunities. Please match based on potential."
        text = fallback
        logger.debug(f"Applied fallback resume text (length: {len(text)})")
    else:
        logger.debug(f"No fallback needed (length: {len(stripped_text)})")

    return text[:10000]


def _format_job_description(job: Job) -> str:
    parts = [
        f"Job Title: {job.title}",
        f"Company: {job.company or 'Not specified'}",
        f"Description: {job.description}",
    ]
    
    if job.employment_level:
        parts.append(f"Employment Level: {job.get_employment_level_display()}")
    
    if job.job_type:
        parts.append(f"Job Type: {job.get_job_type_display()}")
    
    if job.location:
        parts.append(f"Location: {job.location}")
    
    if job.skills:
        parts.append(f"Required Skills: {job.skills}")
    
    if job.qualifications:
        parts.append(f"Qualifications: {job.qualifications}")
    
    if job.experience_required:
        parts.append(f"Experience Required: {job.experience_required} years")
    
    return "\n".join(parts)[:10000]