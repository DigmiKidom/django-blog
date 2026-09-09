from django.conf import settings
from django.db import models


class Article(models.Model):
    """
    כתבה בבלוג.

    התגיות נשמרות כמחרוזת אחת מופרדת בפסיקים (למשל: "django,python,api").
    המאפיין tag_list מחזיר אותן כרשימה נקייה לשימוש בסריאלייזר.
    """

    title = models.CharField(
        max_length=200,
        help_text='כותרת הכתבה.',
    )
    content = models.TextField(
        help_text='גוף הכתבה.',
    )
    tags = models.CharField(
        max_length=200,
        blank=True,
        help_text='תגיות מופרדות בפסיקים, לדוגמה: django,python,api',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='articles',
        help_text='מחבר הכתבה. נקבע אוטומטית לפי המשתמש המחובר.',
    )
    published_at = models.DateTimeField(
        auto_now_add=True,
        help_text='תאריך הפרסום.',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']
        verbose_name = 'כתבה'
        verbose_name_plural = 'כתבות'

    def __str__(self):
        return self.title

    @property
    def tag_list(self):
        """מחזיר את התגיות כרשימה, ללא רווחים מיותרים וללא ערכים ריקים."""
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    @property
    def reading_time(self):
        """
        זמן קריאה משוער בדקות.

        מבוסס על קצב של כ-200 מילים לדקה, עם מינימום של דקה אחת
        כדי שכתבה קצרה לא תוצג כ"0 דקות קריאה".
        """
        words = len(self.content.split())
        return max(1, round(words / 200))


class Comment(models.Model):
    """תגובה של משתמש רשום על כתבה."""

    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text='הכתבה שאליה שייכת התגובה.',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text='כותב התגובה. נקבע אוטומטית לפי המשתמש המחובר.',
    )
    content = models.TextField(
        help_text='תוכן התגובה.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'תגובה'
        verbose_name_plural = 'תגובות'

    def __str__(self):
        return f'תגובה של {self.author} על "{self.article}"'
