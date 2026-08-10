"""
יצירת שלוש קבוצות ההרשאה של המערכת.

הרצה:
    python manage.py create_groups

הפקודה בטוחה להרצה חוזרת — קבוצה קיימת לא תיווצר שוב ולא תימחק.
"""

from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

GROUPS = {
    'users': 'משתמש רגיל — צפייה בכתבות, כתיבת תגובות וניהול התגובות שלו',
    'editors': 'עורך — יצירה, עריכה ומחיקה של הכתבות שהוא יצר',
    'managers': 'ניהול — שליטה מלאה בכתבות, בתגובות ובמשתמשים',
}


class Command(BaseCommand):
    help = 'יוצר את קבוצות ההרשאה: users, editors, managers'

    def handle(self, *args, **options):
        for name, description in GROUPS.items():
            group, created = Group.objects.get_or_create(name=name)

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'  נוצרה קבוצה: {name} — {description}')
                )
            else:
                self.stdout.write(f'  קיימת כבר: {name}')

        self.stdout.write(self.style.SUCCESS('\nשלוש קבוצות ההרשאה מוכנות.'))
        self.stdout.write(
            'שיוך משתמשים לקבוצות editors ו-managers נעשה דרך '
            'ממשק הניהול: /admin/accounts/user/'
        )
