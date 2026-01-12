from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "applicant",
        "status",
        "reviewed",
        "created_at",
    )

    list_filter = (
        "status",
        "reviewed",
        "created_at",
    )

    search_fields = (
        "applicant__user__email",
        "job__title",
        "job__company",
    )

    readonly_fields = (
        "ai_match_score",
        "ai_insights",
        "reviewed_at",
        "created_at",
        "updated_at",
    )

