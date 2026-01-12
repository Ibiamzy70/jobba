import uuid
import requests
import logging
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

# ==================== Configuration & Fail-Fast Validation ====================
AI_SERVICE_URL = getattr(settings, "AI_SERVICE_URL", None)
MICROSERVICE_SECRET = getattr(settings, "MICROSERVICE_SECRET", None)

if not AI_SERVICE_URL:
    raise ImproperlyConfigured("AI_SERVICE_URL is required for AI service integration")
if not MICROSERVICE_SECRET:
    raise ImproperlyConfigured("MICROSERVICE_SECRET is required for AI authentication")

# ==================== Module-Level Reusable Session ====================
def _get_session():
    if not hasattr(_get_session, "session"):
        session = requests.Session()

        retry_strategy = Retry(
            total=3,
            status_forcelist=[502, 503, 504],
            allowed_methods=["POST"],
            backoff_factor=1,
            raise_on_status=False,
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        _get_session.session = session

    return _get_session.session


# ==================== Constants ====================
BASE_HEADERS = {
    "X-Internal-Key": MICROSERVICE_SECRET,
    "Content-Type": "application/json",
}

REQUEST_TIMEOUT = 60
MODERATE_TIMEOUT = 20
PARSE_TIMEOUT = 60

class AIServiceError(Exception):
    """Custom error for AI service failures"""
    def __init__(self, message: str, *, retry_after: str | None = None, request_id: str | None = None):
        self.retry_after = retry_after
        self.request_id = request_id
        super().__init__(message)


# ==================== Core Request Helper ====================
def _generate_request_id() -> str:
    return str(uuid.uuid4())


def _make_request(method: str, endpoint: str, *, json=None, files=None, timeout=None):
    url = f"{AI_SERVICE_URL.rstrip('/')}{endpoint}"
    request_id = _generate_request_id()

    headers = {
        **BASE_HEADERS,
        "X-Request-ID": request_id,
    }

    
    if files:
        headers.pop("Content-Type", None)

    session = _get_session()

    try:
        response = session.request(
            method=method.upper(),
            url=url,
            json=json,
            files=files,
            headers=headers,
            timeout=timeout or 5,
        )
        if not 200 <= response.status_code < 300:
            logger.error(f"AI error {response.status_code}: {response.text}")
        response.raise_for_status()

        
        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            logger.warning(
                "AI service rate limited",
                extra={
                    "request_id": request_id,
                    "retry_after": retry_after,
                    "url": url,
                }
            )
            raise AIServiceError(
                "AI service rate limit exceeded",
                retry_after=retry_after,
                request_id=request_id,
            )

        response.raise_for_status()
        return response.json()

    except requests.Timeout:
        logger.error(
            "AI service request timed out",
            extra={"request_id": request_id, "url": url, "timeout": timeout or REQUEST_TIMEOUT}
        )
        raise AIServiceError("AI service request timed out", request_id=request_id)

    except requests.HTTPError as http_err:
        status_code = http_err.response.status_code if http_err.response else None
        logger.error(
            "AI service HTTP error",
            extra={
                "request_id": request_id,
                "url": url,
                "status_code": status_code,
                "response_text": http_err.response.text if http_err.response else None,
            }
        )
        raise AIServiceError(f"AI service returned error {status_code}", request_id=request_id)

    except requests.RequestException as e:
        logger.error(
            "AI service connection failed",
            extra={"request_id": request_id, "url": url, "error": str(e)}
        )
        raise AIServiceError("AI service unavailable", request_id=request_id)

    except ValueError as e:  
        logger.error(
            "Invalid JSON response from AI service",
            extra={"request_id": request_id, "url": url, "error": str(e)}
        )
        raise AIServiceError("Invalid response from AI service", request_id=request_id)


# ==================== Response Validation ====================
def _validate_success_response(data: dict, operation: str, *, request_id: str | None = None):
    if not isinstance(data, dict):
        logger.error(
            "AI service returned non-dict response",
            extra={"request_id": request_id, "operation": operation}
        )
        raise AIServiceError("Invalid response format from AI service", request_id=request_id)

    if not data.get("success"):
        error_msg = data.get("error", "Unknown error")
        logger.error(
            f"AI {operation} failed",
            extra={"request_id": request_id, "error": error_msg}
        )
        raise AIServiceError(error_msg, request_id=request_id)

    return data


# ==================== Public API Functions ====================
def ai_verify_profile(payload: dict):
    """POST /v1/verify/profile"""
    data = _make_request("POST", "/v1/verify/profile", json=payload, timeout=30)
    return _validate_success_response(data, "profile verification")


def ai_parse_resume(file):
    """POST /v1/parse/resume"""
    data = _make_request("POST", "/v1/parse/resume", files={"file": file}, timeout=PARSE_TIMEOUT)
    return _validate_success_response(data, "resume parsing")


def ai_match_score(payload: dict):
    """POST /v1/match/score"""
    job_id = payload.get("job_id", "unknown")
    data = _make_request("POST", "/v1/match/score", json=payload)

    if not data.get("success"):
        error_msg = data.get("error", "Unknown match error")
        logger.error(
            "AI match score failed",
            extra={"job_id": job_id, "error": error_msg}
        )
        raise AIServiceError(error_msg)

    return data


def ai_moderate(payload: dict):
    """POST /v1/moderate"""
    data = _make_request("POST", "/v1/moderate", json=payload, timeout=MODERATE_TIMEOUT)
    return _validate_success_response(data, "content moderation")