from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User

# כותרות ממשק הניהול
admin.site.site_header = 'ניהול הבלוג'
admin.site.site_title = 'ניהול הבלוג'
admin.site.index_title = 'ברוך הבא לממשק הניהול'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """ניהול משתמשים ושיוכם לקבוצות דרך ממשק הניהול."""

    list_display = ('username', 'email', 'get_groups', 'is_staff', 'date_joined')
    list_filter = ('groups', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)

    @admin.display(description='קבוצות')
    def get_groups(self, obj):
        return ', '.join(g.name for g in obj.groups.all()) or '—'
