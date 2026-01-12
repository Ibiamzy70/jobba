import logging
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, mixins, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import status, permissions, generics, mixins, viewsets
from rest_framework.decorators import  action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .models import Application
from .serializers import ApplicationSerializer
from notifications.models import Notification
from services.ai_client import ai_parse_resume, ai_match_score, AIServiceError

logger = logging.getLogger(__name__)


# ====================== Throttling ======================
class ApplicationCreateThrottle(UserRateThrottle):
    """Strict rate limit on application creation to control AI costs and prevent spam"""
    rate = "30/hour"


class ApplicationListThrottle(UserRateThrottle):
    """Higher rate for listing (read-heavy)"""
    rate = "200/minute"


class ApplicationActionThrottle(UserRateThrottle):
    """Moderate rate for review actions"""
    rate = "100/hour"


# ====================== Pagination ======================
class ApplicationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# ====================== Main ViewSet ======================
@extend_schema(tags=["Applications"])
class ApplicationViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ApplicationPagination

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) == "employer":
            return (
                Application.objects.filter(job__owner=user)
                .select_related("job", "job__category", "applicant", "applicant__user")
                .order_by("-created_at")
            )
        elif hasattr(user, "applicant_profile"):
            return (
                Application.objects.filter(applicant=user.applicant_profile)
                .select_related("job", "job__category", "job__owner", "applicant", "applicant__user")
                .order_by("-created_at")
            )
        return Application.objects.none()

    def get_throttle_classes(self):
        if self.action == "create":
            return [ApplicationCreateThrottle]
        if self.action == "list":
            return [ApplicationListThrottle]
        if self.action == "review":
            return [ApplicationActionThrottle]
        return super().get_throttle_classes()

    # ====================== Create ======================
    @extend_schema(
        summary="Submit a new job application",
        description="""
        Creates a new application and immediately triggers AI-powered resume parsing and job matching.
        The AI processing is resilient: failures do not block application creation.
        """,
        responses={201: ApplicationSerializer},
    )
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        
        Notification.objects.create(
            recipient=application.job.owner,
            actor=request.user,
            notification_type="application_submitted",
            message=f"{request.user.full_name} applied to '{application.job.title}'",
            application=application,
        )

        request_id = request.META.get("HTTP_X_REQUEST_ID")

       
        if application.resume:
            try:
                parsed_resume = ai_parse_resume(application.resume)

                # Format data for AI matching
                resume_text = _format_resume_text(parsed_resume.get("parsed_resume", {}))
                job_description = _format_job_description(application.job)

                match_result = ai_match_score({
                    "resumeText": resume_text,
                    "job_description": job_description,
                })

                matching = match_result.get("matching", {})
                application.ai_match_score = matching.get("match_score", 0)
                application.ai_insights = {
                    "breakdown": matching.get("breakdown", {}),
                    "explanation": matching.get("explanation", "")
                }
                
                parsed_data = parsed_resume.get("parsed_resume", {})
                application.skills = parsed_data.get("skills", [])
                application.experience_level = parsed_data.get("experience_level", "")

                application.save(
                    update_fields=[
                        "ai_match_score",
                        "ai_insights",
                        "skills",
                        "experience_level",
                    ]
                )

                logger.info(
                    "AI application enrichment completed",
                    extra={
                        "application_id": application.id,
                        "job_id": application.job.id,
                        "user_id": request.user.id,
                        "score": application.ai_match_score,
                        "request_id": request_id,
                    },
                )

            except AIServiceError as e:
                logger.error(
                    "AI service error during application creation",
                    extra={
                        "application_id": application.id,
                        "user_id": request.user.id,
                        "request_id": request_id,
                        "error": str(e),
                    },
                    exc_info=True,
                )
            except Exception as e:
                logger.error(
                    "Unexpected error in AI enrichment",
                    extra={
                        "application_id": application.id,
                        "user_id": request.user.id,
                        "request_id": request_id,
                        "error": str(e),
                    },
                    exc_info=True,
                )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# Helper functions 
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

    text = "\n\n".join(parts) if parts else "Candidate with uploaded resume (details not extracted)."
    
    return text.strip()

def _format_job_description(job) -> str:
    
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
    
    return "\n".join(parts)

    # ====================== List ======================
    @extend_schema(
        summary="List applications",
        description="""
        - Employers: See all applications to their jobs
        - Job seekers: See only their own applications
        Supports pagination.
        """,
        parameters=[
            OpenApiParameter(name="page", description="Page number", type=int, location="query"),
            OpenApiParameter(name="page_size", description="Items per page (max 100)", type=int, location="query"),
        ],
        responses={200: inline_serializer(
            name="PaginatedApplicationList",
            fields={
                "count": OpenApiTypes.INT,
                "next": OpenApiTypes.STR,
                "previous": OpenApiTypes.STR,
                "results": ApplicationSerializer(many=True),
            }
        )},
    )
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset.exists():
            return Response(
                {"detail": "You are not allowed to view applications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({"count": queryset.count(), "results": serializer.data})

    # ====================== Retrieve ======================
    @extend_schema(summary="Retrieve a single application", responses={200: ApplicationSerializer})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    # ====================== Partial Update (Status only) ======================
    @extend_schema(
        summary="Update application status (employer only)",
        description="Allowed fields: status, reviewed",
        responses={200: ApplicationSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.job.owner != request.user:
            return Response(
                {"error": "Only the employer can update application status"},
                status=status.HTTP_403_FORBIDDEN,
            )

        allowed_fields = ["status", "reviewed"]
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        if "status" in filtered_data:
            filtered_data["reviewed"] = True

        serializer = self.get_serializer(instance, data=filtered_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    # ====================== Review Action ======================
    @extend_schema(
        summary="Review application (employer only)",
        description="Update status and automatically send notification to applicant on change.",
        request=inline_serializer(
            name="ReviewRequest",
            fields={"status": OpenApiTypes.STR},
        ),
        responses={
            200: inline_serializer(
                name="ReviewResponse",
                fields={
                    "status": OpenApiTypes.STR,
                    "application_status": OpenApiTypes.STR,
                    "message": OpenApiTypes.STR,
                }
            )
        },
    )
    @action(detail=True, methods=["post"], url_path="review")
    @transaction.atomic
    def review(self, request, pk=None):
        application = self.get_object()

        if application.job.owner != request.user:
            return Response(
                {"error": "Only the employer can review this application"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        old_status = application.status
        updated_application = serializer.save()

        # Auto-mark as reviewed
        if not updated_application.reviewed:
            updated_application.reviewed = True
            updated_application.reviewed_at = timezone.now()
            updated_application.reviewer = request.user
            updated_application.save(update_fields=["reviewed", "reviewed_at", "reviewer"])

        # Notify on status change
        if "status" in serializer.validated_data and old_status != updated_application.status:
            Notification.objects.create(
                recipient=updated_application.applicant.user,
                actor=request.user,
                notification_type="application_status_update",
                message=f"Your application for '{updated_application.job.title}' has been updated to {updated_application.get_status_display().lower()}.",
                related_application=updated_application,
            )

        logger.info(
            "Application reviewed and status updated",
            extra={
                "application_id": application.id,
                "old_status": old_status,
                "new_status": updated_application.status,
                "employer_id": request.user.id,
                "request_id": request.META.get("HTTP_X_REQUEST_ID"),
            },
        )

        return Response(
            {
                "status": "reviewed",
                "application_status": updated_application.status,
                "message": "Application reviewed successfully.",
            },
            status=status.HTTP_200_OK,
        )
    

