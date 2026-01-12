import requests
from django.conf import settings

def media_extract_pdf(file):
    response = requests.post(
        f"{settings.MEDIA_SERVICE_URL}/pdf-extract",
        headers={"X-INTERNAL-AUTH": settings.MICROSERVICE_SECRET},
        files={"file": file},
        timeout=30
    )
    response.raise_for_status()
    return response.json()

def media_optimize_image(file):
    response = requests.post(
        f"{settings.MEDIA_SERVICE_URL}/image",
        headers={"X-INTERNAL-AUTH": settings.MICROSERVICE_SECRET},
        files={"file": file},
        timeout=30
    )
    response.raise_for_status()
    return response.json()

def media_optimize_video(file):
    response = requests.post(
        f"{settings.MEDIA_SERVICE_URL}/video",
        headers={"X-INTERNAL-AUTH": settings.MICROSERVICE_SECRET},
        files={"file": file},
        timeout=60
    )
    response.raise_for_status()
    return response.json()
