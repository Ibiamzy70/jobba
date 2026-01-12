from django.core.exceptions import ValidationError

ALLOWED_RESUME_CONTENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]
MAX_RESUME_SIZE = 5 * 1024 * 1024  

def validate_resume_file(f):
   
    content_type = getattr(f, 'content_type', None)
    if content_type not in ALLOWED_RESUME_CONTENT_TYPES:
        raise ValidationError("Unsupported file type. Please upload PDF or DOC/DOCX.")
    if f.size > MAX_RESUME_SIZE:
        raise ValidationError("Resume file too large. Maximum allowed size is 5 MB.")
