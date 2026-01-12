import requests
import uuid
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)

# -------------------------------
# Configuration & Validation
# -------------------------------
MEDIA_SERVICE_URL = getattr(settings, "MEDIA_SERVICE_URL", None)
INTERNAL_API_KEY = getattr(settings, "INTERNAL_API_KEY", None)

if not MEDIA_SERVICE_URL:
    raise ImproperlyConfigured("MEDIA_SERVICE_URL setting is required for media service integration")

if not INTERNAL_API_KEY:
    raise ImproperlyConfigured("INTERNAL_API_KEY setting is required for internal authentication")

# Request timeout (seconds)
REQUEST_TIMEOUT = 30

# -------------------------------
# Custom Exception for Service Errors
# -------------------------------
class MediaServiceError(Exception):
    pass

# -------------------------------
# Resume Text Extraction
# -------------------------------
def extract_resume_text(file_obj, request_id=None):
   
    request_id = request_id or str(uuid.uuid4())

    headers = {
        "X-Internal-Key": INTERNAL_API_KEY,
        "X-Request-ID": request_id,  
    }

    files = {
        "resume": (
            file_obj.name or "resume.pdf",
            file_obj,
            file_obj.content_type or "application/pdf",
        )
    }

    try:
        response = requests.post(
            f"{MEDIA_SERVICE_URL.rstrip('/')}/media/resume/parse",
            headers=headers,
            files=files,
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()

        data = response.json()

        if not data.get("success"):
            raise MediaServiceError(f"Media service error: {data.get('error', 'Unknown')}")

        logger.info(
            "Resume parsed successfully",
            extra={"request_id": request_id, "filename": file_obj.name},
        )

        return data["text"]

    except requests.HTTPError as e:
        error_msg = e.response.text or str(e)
        logger.error(
            "Media service HTTP error",
            extra={
                "request_id": request_id,
                "status_code": e.response.status_code,
                "response": error_msg,
                "filename": file_obj.name,
            },
        )
        raise MediaServiceError("Failed to parse resume due to service error") from e

    except requests.Timeout:
        logger.error("Media service timeout", extra={"request_id": request_id, "timeout": REQUEST_TIMEOUT})
        raise MediaServiceError("Resume parsing timed out — service unavailable")

    except requests.RequestException as e:
        logger.error("Media service connection failed", extra={"request_id": request_id, "error": str(e)})
        raise MediaServiceError("Unable to reach resume processing service") from e

    except (KeyError, ValueError) as e:
        logger.error("Invalid response from media service", extra={"request_id": request_id, "error": str(e)})
        raise MediaServiceError("Invalid response from resume processing service") from e


# -------------------------------
# Image Optimization (Bonus Elite)
# -------------------------------
def optimize_image(file_obj, request_id=None):
    
    request_id = request_id or str(uuid.uuid4())

    headers = {
        "X-Internal-Key": INTERNAL_API_KEY,
        "X-Request-ID": request_id,
    }

    files = {
        "image": (
            file_obj.name or "image.jpg",
            file_obj,
            file_obj.content_type or "image/jpeg",
        )
    }

    try:
        response = requests.post(
            f"{MEDIA_SERVICE_URL.rstrip('/')}/media/image/optimize",
            headers=headers,
            files=files,
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()

        data = response.json()

        if not data.get("success"):
            raise MediaServiceError(f"Media service error: {data.get('error', 'Unknown')}")

        logger.info(
            "Image optimized successfully",
            extra={"request_id": request_id, "original": file_obj.name, "url": data["url"]},
        )

        return data["url"]

    except requests.RequestException as e:
        logger.error("Image optimization failed", extra={"request_id": request_id, "error": str(e)})
        raise MediaServiceError("Failed to optimize image") from e