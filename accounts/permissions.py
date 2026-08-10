"""
מחלקות ההרשאה של המערכת.

ההרשאות נגזרות משיוך המשתמש לקבוצות:
    users    — צפייה בכתבות, כתיבת תגובות וניהול התגובות שלו
    editors  — בנוסף: יצירה, עריכה ומחיקה של הכתבות שהוא יצר
    managers — שליטה מלאה בכל התוכן
"""

from rest_framework import permissions


def in_group(user, name):
    """בודק אם המשתמש מחובר ומשויך לקבוצה מסוימת."""
    return (
        user
        and user.is_authenticated
        and user.groups.filter(name=name).exists()
    )


def is_manager(user):
    """מנהל = חבר בקבוצת managers, או superuser."""
    return bool(user and user.is_authenticated
                and (user.is_superuser or in_group(user, 'managers')))


def is_editor(user):
    """עורך = חבר בקבוצת editors."""
    return in_group(user, 'editors')


class IsManager(permissions.BasePermission):
    """גישה לחברי קבוצת managers בלבד."""

    message = 'הפעולה מותרת למנהלים בלבד.'

    def has_permission(self, request, view):
        return is_manager(request.user)


class ArticlePermission(permissions.BasePermission):
    """
    הרשאות כתבות:

    קריאה   — פתוחה לכולם, גם ללא התחברות.
    יצירה   — עורכים ומנהלים בלבד.
    עריכה   — מחבר הכתבה (אם הוא עורך) או מנהל.
    מחיקה   — מחבר הכתבה (אם הוא עורך) או מנהל.
    """

    message = 'יצירה ועריכה של כתבות מותרות לעורכים ולמנהלים בלבד.'

    def has_permission(self, request, view):
        # has_object_permission אינו נקרא ביצירה,
        # ולכן בדיקת ההרשאה ליצירה חייבת להתבצע כאן.
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_editor(request.user) or is_manager(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if is_manager(request.user):
            return True
        return obj.author_id == request.user.id


class CommentPermission(permissions.BasePermission):
    """
    הרשאות תגובות:

    קריאה   — פתוחה לכולם.
    יצירה   — כל משתמש מחובר.
    עריכה   — כותב התגובה בלבד. גם מנהל אינו עורך תגובות של אחרים,
              כדי שלא ישימו בפיו של משתמש מילים שלא כתב.
    מחיקה   — כותב התגובה או מנהל (הסרת תגובות לא רצויות).
    """

    message = 'אין לך הרשאה לבצע פעולה זו על התגובה.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'DELETE' and is_manager(request.user):
            return True
        return obj.author_id == request.user.id
