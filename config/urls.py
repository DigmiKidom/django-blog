"""
מפת הכתובות הראשית של הפרויקט.

/admin/      — ממשק הניהול של Django
/api/        — שורש ה-API
/api-auth/   — התחברות לתוך ה-Browsable API מהדפדפן
"""

from django.contrib import admin
from django.urls import include, path

from .views import api_root

urlpatterns = [
    path('admin/', admin.site.urls),

    # שורש ה-API — דף התיעוד הראשי
    path('api/', api_root, name='api-root'),

    # הרשמה ואימות
    path('api/', include('accounts.urls')),

    # כתבות ותגובות
    path('api/', include('articles.urls')),

    # מאפשר כפתור Log in / Log out בממשק ה-Browsable API
    path('api-auth/', include('rest_framework.urls')),
]
