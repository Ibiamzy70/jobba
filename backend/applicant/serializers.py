from rest_framework import serializers
from .models import JobSeeker, WorkExperience, Education, Skill, Portfolio

import json



class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeeker
        fields = "__all__"
        read_only_fields = ("user", "created_at")

class JobSeekerSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = JobSeeker
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'location',
            'bio', 'linkedin', 'github', 'portfolio',
            'availability', 'expected_salary', 
            'cv', 'cv_url',  
            'avatar', 'avatar_url',
            'onboarding_completed'
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'bio': {'required': False},
            'location': {'required': False},
            'availability': {'required': False},
            'avatar': {'required': False},
            'cv': {'required': False, 'write_only': True},  
        }

    def get_avatar_url(self, obj):
        return obj.avatar if obj.avatar else None

    def get_cv_url(self, obj):
        
        if obj.cv:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv.url)
            return obj.cv.url
        return None

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = [
            'id',
            'name',
            'category',
            'proficiency',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SkillsSerializer(serializers.ModelSerializer):
    skills_list = serializers.SerializerMethodField()
    
    class Meta:
        model = JobSeeker
        fields = ['skills', 'skills_list']
    
    def get_skills_list(self, obj):
        if not obj.skills:
            return []
        try:
            return json.loads(obj.skills)
        except (json.JSONDecodeError, ValueError):
            return [skill.strip() for skill in obj.skills.split(',') if skill.strip()]
    
    def validate_skills(self, value):
        if value:
            try:
                skills_list = json.loads(value)
                if not isinstance(skills_list, list):
                    raise serializers.ValidationError("Skills must be a list")
                
                if not all(isinstance(skill, str) for skill in skills_list):
                    raise serializers.ValidationError("All skills must be strings")
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format")
        return value



class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            'id',
            'job_title',
            'company',
            'location',
            'start_date',
            'end_date',
            'is_current',
            'description',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        
        if not is_current and not end_date:
            raise serializers.ValidationError({
                "end_date": "End date is required for past positions"
            })
        
        
        if is_current and end_date:
            raise serializers.ValidationError({
                "end_date": "End date should not be set for current positions"
            })
        
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date must be after start date"
            })
        
        return data

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id',
            'institution',
            'degree',
            'field_of_study',
            'start_date',
            'end_date',
            'description',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date must be after start date"
            })
        
        return data


class PortfolioSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    technologies = serializers.JSONField(required=False, default=list)

    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'description', 'image', 'image_url',
            'project_url', 'technologies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': False},
            'image': {'required': False, 'write_only': True},
            'project_url': {'required': False},
        }

    def get_image_url(self, obj):
       
        if not obj.image:
            return None
        
        
        
        return obj.image
        

    def to_representation(self, instance):
       
        ret = super().to_representation(instance)
        
        tech = ret.get('technologies')
        if isinstance(tech, str):
            try:
                ret['technologies'] = json.loads(tech)
            except (json.JSONDecodeError, TypeError):
                ret['technologies'] = []
        elif not tech:
            ret['technologies'] = []
        
        return ret
    
    def validate_technologies(self, value):
        
        if isinstance(value, list):
            return value
        
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
        
        return []

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id',
            'institution',
            'degree',
            'field_of_study',
            'start_date',
            'end_date',
            'description',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date must be after start date"
            })
        
        return data