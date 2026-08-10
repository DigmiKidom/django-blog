"""נקודות קצה של כתבות ותגובות."""

from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import ArticleCommentsView, ArticleViewSet, CommentDetailView

router = SimpleRouter()
router.register('articles', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),

    # תגובות של כתבה מסוימת
    path(
        'articles/<int:article_id>/comments/',
        ArticleCommentsView.as_view(),
        name='article-comments',
    ),

    # תגובה בודדת — עריכה ומחיקה
    path(
        'comments/<int:pk>/',
        CommentDetailView.as_view(),
        name='comment-detail',
    ),
]
