from django.urls import path
from .views import NotificationListView, MarkNotificationRead, MarkAllRead

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications"),
    path("mark-read/<int:pk>/", MarkNotificationRead.as_view(), name="mark-read"),
    path("mark-all-read/", MarkAllRead.as_view(), name="mark-all-read"),
]
