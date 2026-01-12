from django.urls import path
from .views import (
    RegisterView,
    MyTokenObtainPairView,
    RefreshTokenView,
    LogoutView,
    MeView,
    UpdateUserRoleView, ApplicantPersonalInfoView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", MyTokenObtainPairView.as_view(), name="login"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    path("me/", MeView.as_view(), name="auth-me"),
    path("accounts/<int:user_id>/role/", UpdateUserRoleView.as_view(), name="update-user-role"),
    
]
