from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    הרשמת משתמש חדש.

    פתוח לכולם. המשתמש נוצר ומשויך אוטומטית לקבוצת `users`,
    שמאפשרת צפייה בכתבות וכתיבת תגובות.

    **שדות נדרשים:** username, email, password, password2

    לאחר ההרשמה יש לפנות ל-`/api/token/` כדי לקבל טוקן התחברות.
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # מחזירים את המשתמש שנוצר כולל הקבוצות שאליהן שויך
        user = User.objects.get(pk=response.data['id'])
        response.data = UserSerializer(user).data
        return response


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    התחברות וקבלת טוקן JWT.

    **שדות נדרשים:** username, password

    מחזיר `access` (תקף 30 דקות), `refresh` (תקף 7 ימים),
    ואת פרטי המשתמש המחובר.

    בכל בקשה מוגנת יש לצרף כותרת:
    `Authorization: Bearer <access>`
    """

    serializer_class = CustomTokenObtainPairSerializer
