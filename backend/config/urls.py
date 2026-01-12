"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, Http404
import requests

from accounts.views import RegisterView, MyTokenObtainPairView, UpdateUserRoleView, RefreshTokenView, LogoutView

def proxy_media(request, path):
    
    node_service_url = getattr(settings, 'MEDIA_SERVICE_URL', 'http://localhost:4001')
    url = f"{node_service_url.rstrip('/')}/uploads/{path}"
    
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
       
        return HttpResponse(
            response.content,
            content_type=response.headers.get('content-type', 'application/octet-stream')
        )
    except requests.RequestException as e:
        raise Http404(f"Media file not found: {path}")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/accounts/', include('accounts.urls')),
    path("api/employers/", include("employers.urls")),
    path("api/accounts/<int:user_id>/role/", UpdateUserRoleView.as_view(), name="update-user-role"),
    path("api/notifications/", include("notifications.urls")),
    path('api/applicant/', include('applicant.urls')),
    path('api/applications/', include('applications.urls')),

    path('api/', include('jobs.urls')),

    re_path(r'^uploads/(?P<path>.*)$', proxy_media, name='proxy_media'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)