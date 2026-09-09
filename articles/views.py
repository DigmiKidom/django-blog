from collections import Counter

from django.db.models import Count
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.permissions import ArticlePermission, CommentPermission

from .filters import ArticleFilter
from .models import Article, Comment
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CommentSerializer,
    RecentCommentSerializer,
)


class ArticleViewSet(viewsets.ModelViewSet):
    """
    ניהול כתבות.

    **list** — כל הכתבות, 3 בעמוד, מהחדשה לישנה.

    - חיפוש חופשי: `?search=<query>` — סורק כותרת, תוכן, תגיות ושם המחבר.
    - סינון מדויק: `?tag=טיולים`, `?author=editor1`, `?published_after=2026-01-01`
    - מיון: `?ordering=title` או `?ordering=-published_at`
    - עמוד נוסף: `?page=2`

    **retrieve** — כתבה בודדת כולל כל התגובות שלה.

    **create** — יצירת כתבה. הרשאה: עורכים ומנהלים.
    שדה `tags` הוא מחרוזת מופרדת בפסיקים, לדוגמה: `django,api`

    **update / partial_update** — עריכת כתבה. הרשאה: מחבר הכתבה או מנהל.

    **destroy** — מחיקת כתבה. הרשאה: מחבר הכתבה או מנהל.
    """

    permission_classes = [ArticlePermission]

    filter_backends = [
        DjangoFilterBackend,      # סינון מדויק לפי שדה (ראה articles/filters.py)
        filters.SearchFilter,     # חיפוש חופשי על ארבעה שדות
        filters.OrderingFilter,   # מיון
    ]
    filterset_class = ArticleFilter
    search_fields = ['title', 'content', 'tags', 'author__username']
    ordering_fields = ['published_at', 'title']
    ordering = ['-published_at']

    def get_queryset(self):
        queryset = Article.objects.select_related('author') \
                                  .prefetch_related('author__groups')

        if self.action == 'list':
            # ספירת התגובות בשאילתה אחת במקום שאילתה נפרדת לכל כתבה
            return queryset.annotate(comments_count=Count('comments'))

        # בדף הכתבה מציגים את התגובות עצמן
        return queryset.prefetch_related('comments__author',
                                         'comments__author__groups')

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleDetailSerializer

    def perform_create(self, serializer):
        # המחבר נקבע בשרת בלבד — לעולם לא מגוף הבקשה
        serializer.save(author=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def tags(self, request):
        """
        רשימת כל התגיות במערכת עם מספר הכתבות בכל אחת,
        ממוינת מהנפוצה לנדירה.

        משמשת את שורת הסינון בעמוד הראשי. כל תגית ניתנת לשילוב
        עם `/api/articles/?tag=<name>`.
        """
        counter = Counter()
        for tags in Article.objects.values_list('tags', flat=True):
            counter.update(t.strip() for t in tags.split(',') if t.strip())

        return Response([
            {'name': name, 'count': count}
            for name, count in counter.most_common()
        ])

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def stats(self, request):
        """סיכום מספרי של הבלוג — כתבות, תגובות ומספר הכותבים."""
        return Response({
            'articles': Article.objects.count(),
            'comments': Comment.objects.count(),
            'authors': Article.objects.values('author').distinct().count(),
        })


class ArticleCommentsView(generics.ListCreateAPIView):
    """
    תגובות של כתבה מסוימת.

    **GET** — כל התגובות של הכתבה, מהישנה לחדשה. פתוח לכולם.

    **POST** — הוספת תגובה. הרשאה: כל משתמש מחובר.
    השדה היחיד הנדרש הוא `content`. הכתבה נלקחת מהכתובת
    והמחבר מהמשתמש המחובר.
    """

    serializer_class = CommentSerializer
    permission_classes = [CommentPermission]
    pagination_class = None  # כל התגובות של כתבה מוצגות יחד

    def get_article(self):
        return get_object_or_404(Article, pk=self.kwargs['article_id'])

    def get_queryset(self):
        return Comment.objects.filter(article=self.get_article()) \
                              .select_related('author') \
                              .prefetch_related('author__groups')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, article=self.get_article())


class RecentCommentsView(generics.ListAPIView):
    """
    חמש התגובות האחרונות בבלוג, מכל הכתבות.

    פתוח לכולם. משמש את סרגל הצד בעמוד הראשי.
    """

    serializer_class = RecentCommentSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            Comment.objects
            .select_related('author', 'article')
            .order_by('-created_at')[:5]
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    תגובה בודדת.

    **GET** — צפייה בתגובה. פתוח לכולם.

    **PATCH** — עריכת תוכן התגובה. הרשאה: כותב התגובה בלבד.

    **DELETE** — מחיקת התגובה. הרשאה: כותב התגובה, או מנהל
    לצורך הסרת תגובות לא רצויות.
    """

    queryset = Comment.objects.select_related('author', 'article') \
                              .prefetch_related('author__groups')
    serializer_class = CommentSerializer
    permission_classes = [CommentPermission]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
