# בקטנה

> דברים קטנים מהיום־יום — כסף, טיולים ותחביבים.

בלוג מגזין מלא: REST API מבוסס **Django REST Framework** וצד לקוח ב-**React**.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.18-A30000)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## מה יש בפרויקט

- **אימות JWT** — הרשמה, התחברות, חידוש טוקן אוטומטי והתנתקות
- **שלוש קבוצות הרשאה** — משתמשים, עורכים וניהול, עם אכיפה מלאה בשרת
- **ניהול כתבות** — יצירה, עריכה ומחיקה לפי בעלוּת
- **תגובות** — כתיבה, עריכה ומחיקה לכותב; מנהל מסיר תוכן לא רצוי
- **חיפוש בארבעה שדות** — כותרת, תוכן, תגיות ושם המחבר
- **סינון מדויק** — לפי תגית, מחבר וטווח תאריכים (django-filter)
- **פריסת מגזין** — כתבה ראשית, רשת כתבות וסרגל צד חי
- **פרופיל אישי** — עריכת אימייל ותיאור, מונה כתבות ותגובות
- **תיעוד אינטראקטיבי** — Browsable API של DRF

---

## דרישות מקדימות

- Python 3.10+
- PostgreSQL 14+
- Node.js 18+ (עבור צד הלקוח)

---

## התקנה והרצה

### 1. שכפול הפרויקט

```bash
git clone https://github.com/<OWNER>/django-blog.git
cd django-blog
```

### 2. יצירת סביבה וירטואלית

```bash
python3 -m venv venv
source venv/bin/activate          # Windows:  venv\Scripts\activate
```

לאחר ההפעלה תראה `(venv)` בתחילת שורת הטרמינל. **בכל פתיחה של טרמינל חדש יש להריץ שוב את פקודת ההפעלה.**

### 3. התקנת החבילות

```bash
pip install -r requirements.txt
```

### 4. יצירת מסד הנתונים ב-PostgreSQL

```bash
createdb blog_db
```

אם הפקודה אינה מוכרת, ודא ש-PostgreSQL מותקן ורץ. לדוגמה ב-macOS עם Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

### 5. הגדרת משתני סביבה

העתק את קובץ התבנית ומלא בו ערכים אמיתיים:

```bash
cp .env.example .env
```

יש להשלים ב-`.env`:

| משתנה | הסבר |
|---|---|
| `SECRET_KEY` | מפתח אקראי וייחודי לפרויקט |
| `DB_USER` | שם המשתמש שלך ב-PostgreSQL |
| `DB_PASSWORD` | הסיסמה שלו (בהתקנת Homebrew לרוב ריקה) |

ליצירת `SECRET_KEY` חדש:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

> הקובץ `.env` מוחרג ב-`.gitignore` ואינו נכנס למאגר הקוד.

### 6. הרצת מיגרציות

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. יצירת משתמש מנהל

```bash
python manage.py createsuperuser
```

### 8. הרצת השרת

```bash
python manage.py runserver
```

| כתובת | תיאור |
|---|---|
| http://127.0.0.1:8000/admin/ | ממשק הניהול |
| http://127.0.0.1:8000/api/ | שורש ה-API (Browsable API) |

---

## זריעת נתוני דמו

```bash
python manage.py create_groups
python manage.py seed_db
```

נוצרים 6 משתמשים, 8 כתבות ו-18 תגובות. סיסמת כל משתמשי הדמו: `Demo!Pass2026`

| משתמש | קבוצה |
|---|---|
| `boss` | managers |
| `editor1`, `editor2` | editors |
| `dana`, `yossi`, `maya` | users |

> נתוני דמו בלבד — אין להשתמש בהם בסביבת ייצור.

---

## הרצת צד הלקוח (React)

בטרמינל **נפרד**, בזמן שהשרת רץ:

```bash
cd frontend
npm install
npm run dev
```

הממשק ייפתח בכתובת http://localhost:5173

---

## מבנה הפרויקט

```
django-blog/
├── config/          הגדרות הפרויקט (settings, urls, שורש ה-API)
├── accounts/        משתמשים, הרשמה, קבוצות והרשאות
│   └── management/commands/
│       ├── create_groups.py
│       └── seed_db.py
├── articles/        כתבות ותגובות
├── frontend/        אפליקציית React
│   └── src/
│       ├── api/         מופע axios עם interceptors
│       ├── context/     AuthContext
│       ├── components/  Navbar, ArticleCard, SearchBar, CommentItem
│       └── pages/       Home, ArticleDetail, Login, Register
├── .env.example     תבנית משתני סביבה
└── requirements.txt
```

---

## נקודות קצה

| Method | Endpoint | הרשאה |
|---|---|---|
| POST | `/api/register/` | פתוח |
| POST | `/api/token/` | פתוח |
| POST | `/api/token/refresh/` | פתוח |
| GET/PATCH | `/api/users/me/` | מחובר |
| GET | `/api/articles/` | פתוח |
| GET | `/api/articles/?search=<q>` | פתוח |
| GET | `/api/articles/tags/` | פתוח |
| GET | `/api/articles/stats/` | פתוח |
| GET | `/api/comments/recent/` | פתוח |
| POST | `/api/articles/` | editors, managers |
| GET | `/api/articles/<id>/` | פתוח |
| PUT/PATCH | `/api/articles/<id>/` | מחבר או manager |
| DELETE | `/api/articles/<id>/` | מחבר או manager |
| GET | `/api/articles/<id>/comments/` | פתוח |
| POST | `/api/articles/<id>/comments/` | מחובר |
| PATCH | `/api/comments/<id>/` | כותב התגובה |
| DELETE | `/api/comments/<id>/` | כותב התגובה או manager |

תיעוד אינטראקטיבי מלא זמין ב-http://127.0.0.1:8000/api/ (Browsable API של DRF).

---

## קבוצות הרשאה

| קבוצה | הרשאות |
|---|---|
| `users` | צפייה בכתבות, כתיבת תגובות, עריכה ומחיקה של התגובות שלהם |
| `editors` | כל הנ"ל + יצירה, עריכה ומחיקה של הכתבות שהם יצרו |
| `managers` | שליטה מלאה: כל כתבה, כל תגובה, מחיקת משתמשים |

---

## מחסנית טכנולוגית

| שכבה | טכנולוגיה |
|---|---|
| שרת | Django 5.2, Django REST Framework 3.18 |
| אימות | djangorestframework-simplejwt |
| מסד נתונים | PostgreSQL |
| סינון וחיפוש | django-filter |
| ניהול סודות | python-decouple, python-dotenv |
| CORS | django-cors-headers |
| צד לקוח | React 18, Vite, axios |

---

## אבטחה

- כל הסודות (`SECRET_KEY`, פרטי מסד הנתונים) נטענים מקובץ `.env` באמצעות `python-decouple`, ואינם מקודדים בקוד.
- הקובץ `.env` מוחרג ב-`.gitignore` ואינו נכנס למאגר הקוד.
- ההרשאות נאכפות בשרת בכל נקודת קצה, ולא רק בממשק המשתמש.
- לפני העלאה לייצור יש להגדיר `DEBUG=False` ולציין `ALLOWED_HOSTS` מפורש.
