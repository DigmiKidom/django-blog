from django.contrib import admin

from .models import Article, Comment


class CommentInline(admin.TabularInline):
    """התגובות מוצגות בתוך דף עריכת הכתבה."""

    model = Comment
    extra = 0
    readonly_fields = ('author', 'created_at')
    fields = ('author', 'content', 'created_at')


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'tags', 'comments_count', 'published_at')
    list_filter = ('published_at', 'author')
    search_fields = ('title', 'content', 'tags', 'author__username')
    date_hierarchy = 'published_at'
    inlines = [CommentInline]

    @admin.display(description='תגובות')
    def comments_count(self, obj):
        return obj.comments.count()


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'author', 'article', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username', 'article__title')
