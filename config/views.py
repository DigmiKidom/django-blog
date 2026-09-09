"""שורש ה-API — דף התיעוד הראשי של נקודות הקצה."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    שורש ה-API של "בקטנה" — מערכת בלוג מבוססת Django REST Framework.

    מכאן ניתן לנווט לכל נקודות הקצה ולבדוק אותן ישירות מהדפדפן.

    **התחברות לבדיקה מהדפדפן:** השתמש בכפתור Log in בפינה הימנית העליונה.

    **התחברות מצד הלקוח:** שלח POST ל-`/api/token/` וצרף לכל בקשה
    את הכותרת `Authorization: Bearer <access>`.
    """
    return Response({
        'הרשמה': {
            'url': reverse('register', request=request, format=format),
            'method': 'POST',
            'description': 'יצירת משתמש חדש. פתוח לכולם.',
        },
        'התחברות': {
            'url': reverse('token_obtain_pair', request=request, format=format),
            'method': 'POST',
            'description': 'קבלת access ו-refresh token.',
        },
        'חידוש טוקן': {
            'url': reverse('token_refresh', request=request, format=format),
            'method': 'POST',
            'description': 'קבלת access חדש באמצעות refresh token.',
        },
        'הפרופיל שלי': {
            'url': reverse('me', request=request, format=format),
            'methods': 'GET, PATCH',
            'description': 'פרטי המשתמש המחובר ועדכון האימייל והתיאור.',
        },
        'כתבות': {
            'url': reverse('article-list', request=request, format=format),
            'methods': 'GET, POST',
            'description': 'רשימת כתבות (3 בעמוד) ויצירת כתבה חדשה.',
            'חיפוש': '?search=<query> — סורק כותרת, תוכן, תגיות ושם המחבר.',
            'סינון': '?tag=טיולים | ?author=editor1 | ?published_after=2026-01-01',
            'מיון': '?ordering=title | ?ordering=-published_at',
            'עימוד': '?page=2 — טעינת כתבות ישנות יותר.',
        },
        'כתבה בודדת': {
            'url': request.build_absolute_uri('/api/articles/<id>/'),
            'methods': 'GET, PUT, PATCH, DELETE',
            'description': 'כתבה מלאה כולל תגובותיה. עריכה ומחיקה למחבר או למנהל.',
        },
        'תגובות של כתבה': {
            'url': request.build_absolute_uri('/api/articles/<id>/comments/'),
            'methods': 'GET, POST',
            'description': 'צפייה בתגובות והוספת תגובה חדשה למשתמש מחובר.',
        },
        'תגובה בודדת': {
            'url': request.build_absolute_uri('/api/comments/<id>/'),
            'methods': 'GET, PATCH, DELETE',
            'description': 'עריכה לכותב התגובה בלבד; מחיקה לכותב או למנהל.',
        },
        'תגיות': {
            'url': reverse('article-tags', request=request, format=format),
            'methods': 'GET',
            'description': 'כל התגיות עם מספר הכתבות בכל אחת.',
        },
        'סיכום מספרי': {
            'url': reverse('article-stats', request=request, format=format),
            'methods': 'GET',
            'description': 'מספר הכתבות, התגובות והכותבים בבלוג.',
        },
        'תגובות אחרונות': {
            'url': reverse('recent-comments', request=request, format=format),
            'methods': 'GET',
            'description': 'חמש התגובות האחרונות מכל הכתבות.',
        },
    })
