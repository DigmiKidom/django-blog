from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    מודל המשתמש של המערכת.

    מרחיב את AbstractUser של Django ומוסיף אילוץ ייחודיות על האימייל.
    ההרשאות מנוהלות דרך קבוצות (groups) של Django:
      - users    : משתמש רגיל — צפייה בכתבות וכתיבת תגובות
      - editors  : עורך — יצירה וניהול של הכתבות שלו
      - managers : ניהול — שליטה מלאה בתוכן ובמשתמשים
    """

    email = models.EmailField(
        unique=True,
        help_text='כתובת אימייל ייחודית במערכת.',
    )

    class Meta:
        verbose_name = 'משתמש'
        verbose_name_plural = 'משתמשים'

    def __str__(self):
        return self.username
