"""
סינון כתבות באמצעות django-filter.

בעוד ש-SearchFilter מספק חיפוש חופשי אחד על כמה שדות,
ה-FilterSet כאן מאפשר סינון מדויק לפי שדה מסוים —
למשל הצגת כל הכתבות של תגית אחת או של מחבר אחד.
"""

import django_filters

from .models import Article


class ArticleFilter(django_filters.FilterSet):
    """
    מסננים זמינים על `/api/articles/`:

    | פרמטר | דוגמה | משמעות |
    |---|---|---|
    | `tag` | `?tag=טיולים` | כתבות הנושאות תגית מסוימת |
    | `author` | `?author=editor1` | כתבות של מחבר לפי שם משתמש |
    | `title` | `?title=קפה` | כותרת המכילה את הטקסט |
    | `published_after` | `?published_after=2026-01-01` | פורסמו החל מתאריך |
    | `published_before` | `?published_before=2026-12-31` | פורסמו עד תאריך |

    ניתן לשלב מסננים יחד עם חיפוש ועם מיון, לדוגמה:
    `?tag=תחביבים&ordering=title`
    """

    tag = django_filters.CharFilter(
        field_name='tags',
        lookup_expr='icontains',
        label='תגית',
        help_text='שם תגית, למשל: טיולים',
    )
    author = django_filters.CharFilter(
        field_name='author__username',
        lookup_expr='iexact',
        label='שם המחבר',
        help_text='שם המשתמש של המחבר, למשל: editor1',
    )
    title = django_filters.CharFilter(
        field_name='title',
        lookup_expr='icontains',
        label='כותרת',
        help_text='טקסט המופיע בכותרת.',
    )
    published_after = django_filters.DateFilter(
        field_name='published_at',
        lookup_expr='date__gte',
        label='פורסם החל מתאריך',
        help_text='בפורמט YYYY-MM-DD',
    )
    published_before = django_filters.DateFilter(
        field_name='published_at',
        lookup_expr='date__lte',
        label='פורסם עד תאריך',
        help_text='בפורמט YYYY-MM-DD',
    )

    class Meta:
        model = Article
        fields = ['tag', 'author', 'title', 'published_after', 'published_before']
