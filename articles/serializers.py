from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Article, Comment


class CommentSerializer(serializers.ModelSerializer):
    """
    תגובה על כתבה.

    המחבר נקבע בשרת לפי המשתמש המחובר ואינו מתקבל מהלקוח,
    כדי שלא ניתן יהיה לפרסם תגובה בשם מישהו אחר.
    """

    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'article', 'author', 'content',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'article', 'author',
                            'created_at', 'updated_at')


class ArticleListSerializer(serializers.ModelSerializer):
    """
    כתבה בתצוגת רשימה.

    מציג תקציר במקום הגוף המלא ואת מספר התגובות,
    כדי לשמור על תגובה קלה בעמוד הראשי.
    """

    author = UserSerializer(read_only=True)
    tag_list = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()

    # מגיע מ-annotate בשאילתה של ה-ViewSet, ולא מספירה נפרדת לכל כתבה.
    comments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Article
        fields = ('id', 'title', 'excerpt', 'tags', 'tag_list',
                  'author', 'comments_count', 'published_at')

    def get_tag_list(self, obj):
        return obj.tag_list

    def get_excerpt(self, obj):
        """200 התווים הראשונים של הכתבה."""
        if len(obj.content) <= 200:
            return obj.content
        return obj.content[:200].rstrip() + '…'


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    כתבה מלאה כולל התגובות שלה.

    **שדות לכתיבה:** title, content, tags
    שדה tags הוא מחרוזת אחת מופרדת בפסיקים, לדוגמה: `django,api`
    """

    author = UserSerializer(read_only=True)
    tag_list = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = ('id', 'title', 'content', 'tags', 'tag_list',
                  'author', 'comments', 'published_at', 'updated_at')
        read_only_fields = ('id', 'author', 'published_at', 'updated_at')

    def get_tag_list(self, obj):
        return obj.tag_list

    def validate_tags(self, value):
        """מנרמל את התגיות: הסרת רווחים, אותיות קטנות, ללא כפילויות."""
        if not value:
            return ''
        seen = []
        for tag in value.split(','):
            tag = tag.strip().lower()
            if tag and tag not in seen:
                seen.append(tag)
        return ','.join(seen)
