from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse, Http404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Job, JobApplication, Category
from .serializers import JobSerializer, JobApplicationSerializer, CategorySerializer, ApplicationReviewSerializer
from .permissions import IsOwnerOrAdminOrReadOnly, IsJobOwnerOrStaff
from .filters import JobFilter


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related("category", "owner").all()
    serializer_class = JobSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = JobFilter
    search_fields = ("title", "description", "company", "location", "skills", "qualifications")
    ordering_fields = ("created_at", "salary_min", "salary_max", "employment_level")
    ordering = ("-created_at",)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def applications(self, request, pk=None):
        job = self.get_object()
        if job.owner != request.user and not request.user.is_staff:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        qs = job.applications.all()
        page = self.paginate_queryset(qs)
        serializer = JobApplicationSerializer(page or qs, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data)


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.select_related("job", "applicant", "reviewer").all()
    serializer_class = JobApplicationSerializer
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    search_fields = ("email", "first_name", "last_name", "phone", "skills", "cover_letter")
    ordering_fields = ("created_at", "experience_level")
    ordering = ("-created_at",)

    def get_permissions(self):
        if self.action == "create":
            return []
        if self.action in ["review", "download_resume", "update", "partial_update", "list", "retrieve"]:
            return [IsAuthenticated(), IsJobOwnerOrStaff()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return super().get_queryset()
        if user.is_authenticated:
            return super().get_queryset().filter(job__owner=user)
        return JobApplication.objects.none()

    @action(detail=True, methods=["post"], url_path="review", url_name="review")
    def review(self, request, pk=None):
        instance = self.get_object()
        serializer = ApplicationReviewSerializer(instance, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        prev_reviewed = instance.reviewed
        updated = serializer.save()
        if not prev_reviewed and updated.reviewed:
            updated.reviewer = request.user
            updated.reviewed_at = timezone.now()
            updated.save()
        return Response(ApplicationReviewSerializer(updated).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="resume", url_name="resume")
    def download_resume(self, request, pk=None):
        instance = self.get_object()
        resume_field = instance.resume
        if not resume_field:
            return Response({"detail": "No resume uploaded for this application."}, status=status.HTTP_404_NOT_FOUND)
        try:
            return FileResponse(resume_field.open("rb"), as_attachment=True, filename=resume_field.name.split("/")[-1])
        except Exception:
            raise Http404
