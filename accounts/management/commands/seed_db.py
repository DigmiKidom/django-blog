"""
זריעה ראשונית של מסד הנתונים בנתוני דמו.

הרצה:
    python manage.py seed_db

הפקודה מוחקת את נתוני הדמו הקיימים לפני היצירה מחדש,
ולכן היא מיועדת לסביבת פיתוח בלבד. משתמשי superuser אינם נמחקים.

נוצרים:
    6 משתמשים  — מנהל אחד, שני עורכים ושלושה משתמשים רגילים
    8 כתבות    — מחולקות בין שני העורכים, עם תגיות ותאריכים מדורגים
    2-3 תגובות — לכל כתבה, ממשתמשים שונים
"""

import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from articles.models import Article, Comment

User = get_user_model()

DEMO_PASSWORD = 'Demo!Pass2026'

USERS = [
    ('boss', 'boss@blog.local', 'managers',
     'מנהל האתר. אחראי על התוכן ועל הקהילה.'),
    ('editor1', 'editor1@blog.local', 'editors',
     'כותב על כסף, הרגלים וכל מה שקורה במטבח ובמרפסת.'),
    ('editor2', 'editor2@blog.local', 'editors',
     'מטייל, מצלם ואוסף משחקי קופסה. כותב כאן בעיקר על סופי שבוע.'),
    ('dana', 'dana@blog.local', 'users',
     'קוראת קבועה. אוהבת טיולים קצרים בלי תכנון.'),
    ('yossi', 'yossi@blog.local', 'users',
     'מנסה כל טיפ שמופיע כאן, בערך חצי מהם עובדים.'),
    ('maya', 'maya@blog.local', 'users',
     ''),
]

ARTICLES = [
    (
        'שיטת המעטפות — לדעת כמה נשאר עד סוף החודש',
        'הרעיון פשוט: בתחילת החודש מחלקים את הכסף לקטגוריות קבועות — סופר, '
        'דלק, יציאות — וכל קטגוריה מקבלת סכום משלה. פעם עשו את זה עם מעטפות '
        'אמיתיות, היום מספיקה טבלה בטלפון. מה שעובד כאן הוא לא המשמעת אלא '
        'הנראות: כשרואים שנשארו שמונים שקל בקטגוריית היציאות, ההחלטה מה '
        'לעשות בערב שישי מתקבלת מעצמה. אני עושה את זה שנה וחצי, והחלק הכי '
        'מפתיע הוא כמה מהר מפסיקים לספור.',
        'תקציב,כסף,הרגלים',
        'editor1',
    ),
    (
        'שלושה דברים שהפסקתי לקנות בסופר',
        'לא מדובר בקמצנות אלא בהרגלים שנשארו מאליהם. ירקות חתוכים באריזה — '
        'עולים פי שלושה ומתקלקלים מהר יותר. תבלינים בצנצנות קטנות במקום '
        'בשקיות מהשוק. ומשקאות קלים, שפשוט תפסו מקום במקרר בלי שאף אחד '
        'באמת רצה אותם. הסכום החודשי שהתפנה לא דרמטי, אבל העגלה נעשתה '
        'קלה יותר וגם הקנייה עצמה מהירה יותר.',
        'קניות,סופר,חיסכון',
        'editor1',
    ),
    (
        'טיול יום בגליל בלי לתכנן יותר מדי',
        'יצאנו בשבע בבוקר בלי מסלול סגור, רק עם כיוון כללי וקפה בתרמוס. '
        'עצרנו במעיין שראינו מהכביש, אכלנו במאפייה בכפר שלא תכננו להיכנס '
        'אליו, וחזרנו לפני שהחשיך. אין כאן שום המלצה על אתר מסוים, כי זה '
        'בדיוק העניין — הטיולים שאני זוכר הכי טוב הם אלה שלא היה בהם לוח '
        'זמנים. מה שכן שווה להכין מראש: מים, כובע ומצב רוח סבלני לפקקים '
        'בדרך חזרה.',
        'טיולים,גליל,סופשבוע',
        'editor2',
    ),
    (
        'מה באמת נכנס לתיק לסוף שבוע',
        'אחרי כמה נסיעות שבהן גררתי מזוודה מלאה בגדים שלא נגעתי בהם, '
        'התכנסתי לרשימה קבועה: שתי חולצות, מכנס אחד נוסף, נעליים שאפשר '
        'ללכת בהן הרבה, מטען וחולצה חמה — גם בקיץ, כי בערב ליד המים תמיד '
        'קר יותר ממה שנדמה. הכל נכנס לתיק גב אחד. היתרון האמיתי הוא לא '
        'המשקל אלא שלא צריך לחשוב מה ללבוש.',
        'טיולים,אריזה,טיפים',
        'editor2',
    ),
    (
        'קפה בבית — הדבר היחיד ששינה את הטעם',
        'ניסיתי מכונות, פילטרים ושיטות חליטה, ובסוף הדבר היחיד שעשה הבדל '
        'ברור היה לטחון את הפולים רגע לפני. קפה טחון מאבד את רוב הארומה '
        'תוך ימים ספורים, ולכן שקית שנפתחה לפני שבועיים כבר לא באמת '
        'משנה איך מכינים אותה. מטחנה ידנית פשוטה עושה את העבודה, וזה '
        'גם טקס בוקר נחמד בפני עצמו.',
        'קפה,תחביבים,בית',
        'editor1',
    ),
    (
        'לצלם בנייד בלי להסתבך',
        'רוב התמונות משתפרות משני שינויים קטנים. הראשון הוא לזוז — במקום '
        'לזום, לעשות שלושה צעדים קדימה. השני הוא לשים לב מאיפה מגיע האור, '
        'ולהעמיד את מי שמצלמים כך שהאור יהיה מולם ולא מאחוריהם. שני אלה '
        'לא דורשים שום אפליקציה ולא שום הגדרה, והם עושים יותר מכל פילטר.',
        'צילום,תחביבים,נייד',
        'editor2',
    ),
    (
        'גינת תבלינים במרפסת — מה שרד ומה לא',
        'התחלתי עם שמונה עציצים ונשארתי עם ארבעה. נענע, רוזמרין, לואיזה '
        'ובצל ירוק שורדים כמעט כל הזנחה. בזיליקום דורש הרבה יותר מים ממה '
        'שחשבתי, וכוסברה פשוט לא הסתדרה עם השמש הישירה של אחר הצהריים. '
        'המסקנה שלי אחרי עונה: עדיף להתחיל עם שלושה עציצים שמצליחים מאשר '
        'עם שמונה שמעיקים.',
        'גינון,בית,תחביבים',
        'editor1',
    ),
    (
        'ערב משחקי קופסה — איך לא לאבד את הקהל',
        'הטעות הנפוצה היא לפתוח את הערב במשחק עם חוברת חוקים של עשרים '
        'עמודים. עד שמסיימים להסביר, חצי מהחבורה כבר בטלפון. מה שעובד '
        'אצלנו זה להתחיל במשחק קצר שכולם מכירים, ורק אחרי שהאווירה '
        'מתחממת לעבור למשהו כבד יותר. וכלל אחד נוסף: מי שמסביר את החוקים '
        'לא מנצח בסיבוב הראשון, אחרת אף אחד לא רוצה לשחק שוב.',
        'משחקים,חברים,תחביבים',
        'editor2',
    ),
]

COMMENTS = [
    'ניסיתי את זה החודש והופתעתי לטובה. תודה.',
    'מסכים לגמרי, בדיוק ככה זה עובד גם אצלי.',
    'יש לך המלצה איפה לקנות את זה בזול?',
    'הנקודה האחרונה היא בדיוק מה שהיה חסר לי.',
    'שלחתי את זה לאישה שלי, היא צחקה כי זה בדיוק אנחנו.',
    'אצלי דווקא זה לא הסתדר, אבל אולי לא הייתי מספיק סבלני.',
    'כתוב בכיף ובלי יומרות. בדיוק מה שאני אוהב לקרוא.',
    'אפשר להרחיב קצת על החלק הראשון?',
    'עשיתי משהו דומה בשנה שעברה וזה באמת עבד.',
    'מחכה לכתבת המשך בנושא.',
]


class Command(BaseCommand):
    help = 'זורע את מסד הנתונים בנתוני דמו: 6 משתמשים, 8 כתבות ותגובות'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep',
            action='store_true',
            help='לא למחוק נתונים קיימים לפני הזריעה',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        random.seed(2026)  # תוצאות זהות בכל הרצה

        if not options['keep']:
            self.stdout.write('מוחק נתוני דמו קיימים...')
            Comment.objects.all().delete()
            Article.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        # --- קבוצות ---
        groups = {}
        for name in ('users', 'editors', 'managers'):
            groups[name], _ = Group.objects.get_or_create(name=name)

        # --- משתמשים ---
        users = {}
        for username, email, group_name, bio in USERS:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=DEMO_PASSWORD,
                bio=bio,
            )
            user.groups.add(groups[group_name])

            # מנהלים מקבלים גישה לממשק הניהול
            if group_name == 'managers':
                user.is_staff = True
                user.save(update_fields=['is_staff'])

            users[username] = user

        self.stdout.write(self.style.SUCCESS(f'נוצרו {len(users)} משתמשים'))

        # --- כתבות ---
        now = timezone.now()
        articles = []

        for index, (title, content, tags, author_name) in enumerate(ARTICLES):
            article = Article.objects.create(
                title=title,
                content=content,
                tags=tags,
                author=users[author_name],
            )

            # published_at מוגדר auto_now_add, ולכן כל הכתבות היו מקבלות
            # את אותו תאריך. update עוקף את השדה האוטומטי ומדרג את התאריכים,
            # כדי ש"3 הכתבות האחרונות" בעמוד הראשי יהיה בעל משמעות.
            published = now - timedelta(days=(len(ARTICLES) - index) * 3)
            Article.objects.filter(pk=article.pk).update(
                published_at=published,
                updated_at=published,
            )
            article.published_at = published
            articles.append(article)

        self.stdout.write(self.style.SUCCESS(f'נוצרו {len(articles)} כתבות'))

        # --- תגובות ---
        commenters = [users[name] for name in ('dana', 'yossi', 'maya', 'editor1')]
        total_comments = 0

        for article in articles:
            for offset, text in enumerate(
                random.sample(COMMENTS, random.choice([2, 2, 3]))
            ):
                comment = Comment.objects.create(
                    article=article,
                    author=random.choice(commenters),
                    content=text,
                )
                created = article.published_at + timedelta(hours=(offset + 1) * 7)
                Comment.objects.filter(pk=comment.pk).update(
                    created_at=created,
                    updated_at=created,
                )
                total_comments += 1

        self.stdout.write(self.style.SUCCESS(f'נוצרו {total_comments} תגובות'))

        # --- סיכום ---
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('הזריעה הושלמה בהצלחה.'))
        self.stdout.write('')
        self.stdout.write('משתמשי הדמו (סיסמה זהה לכולם):')
        self.stdout.write(f'  סיסמה: {DEMO_PASSWORD}')
        self.stdout.write('')
        for username, _, group_name, _bio in USERS:
            self.stdout.write(f'  {username:<10} {group_name}')
