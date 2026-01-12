from rest_framework import serializers
from .models import Employer

class EmployerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employer
        fields = [
            "id",
            "user",
            "company_name",
            "logo",
            "description",
            "website",
            "industry",
            "employee_size",
            "address",
            "country",
            "state",
            "city",
            "phone_number",
            "verification_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "user", "verification_status", "created_at", "updated_at")


class EmployerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        exclude = ("user", "verification_status")
