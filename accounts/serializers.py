from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    תצוגת משתמש לקריאה בלבד.

    משמש להצגת מחבר של כתבה או תגובה, ובתגובה להרשמה מוצלחת.
    """

    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'groups', 'date_joined')
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    הרשמת משתמש חדש.

    - הסיסמה נבדקת מול כללי האבטחה של Django (אורך, מורכבות, סיסמאות נפוצות).
    - נדרש אישור סיסמה בשדה password2.
    - המשתמש משויך אוטומטית לקבוצת users.
    - הסיסמה נשמרת מוצפנת בלבד ולעולם לא מוחזרת בתגובה.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password],
        help_text='לפחות 8 תווים, לא סיסמה נפוצה ולא מספרים בלבד.',
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='אימות סיסמה',
        help_text='חזרה על הסיסמה לצורך אימות.',
    )
    email = serializers.EmailField(
        required=True,
        help_text='כתובת אימייל ייחודית במערכת.',
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2')

    def validate_email(self, value):
        """בדיקת ייחודיות אימייל, ללא תלות באותיות גדולות/קטנות."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('כתובת אימייל זו כבר רשומה במערכת.')
        return value.lower()

    def validate(self, attrs):
        """וידוא ששתי הסיסמאות זהות."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password2': 'הסיסמאות אינן תואמות.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')

        # create_user מצפין את הסיסמה. שימוש ב-User(...) היה שומר אותה כטקסט גלוי.
        user = User.objects.create_user(**validated_data)

        # כל נרשם חדש מצטרף לקבוצת users.
        # get_or_create מונע קריסה אם create_groups עדיין לא הורץ.
        users_group, _ = Group.objects.get_or_create(name='users')
        user.groups.add(users_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    מרחיב את תגובת ההתחברות בפרטי המשתמש.

    בנוסף ל-access ול-refresh מוחזרים גם id, username והקבוצות —
    כדי שצד הלקוח ב-React יוכל להחליט אילו כפתורים להציג
    (למשל עריכת תגובה רק ליוצר שלה) בלי בקשה נוספת לשרת.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
