# מערכת בלוג — פרויקט גמר

REST API מבוסס Django REST Framework עם צד לקוח ב-React.

---

## דרישות מקדימות

- Python 3.10+
- PostgreSQL 14+
- Node.js 18+ (לצד הלקוח, בשלבים מאוחרים יותר)

---

## התקנה והרצה

### 1. יצירת סביבה וירטואלית

```bash
cd ~/Desktop/Projects/hackeru-finalproject
python3 -m venv venv
source venv/bin/activate
```

לאחר ההפעלה תראה `(venv)` בתחילת שורת הטרמינל. **בכל פעם שתפתח טרמינל חדש תצטרך להריץ שוב את `source venv/bin/activate`.**

### 2. התקנת החבילות

```bash
pip install -r requirements.txt
```

### 3. יצירת מסד הנתונים ב-PostgreSQL

```bash
createdb blog_db
```

אם הפקודה לא מוכרת, ודא ש-PostgreSQL מותקן ורץ:

```bash
brew install postgresql@16
brew services start postgresql@16
```

### 4. הגדרת משתני סביבה

הקובץ `.env` כבר קיים. יש לוודא ש-`DB_USER` ו-`DB_PASSWORD` תואמים להתקנת PostgreSQL שלך.

בהתקנה דרך Homebrew ב-macOS, המשתמש הוא בדרך כלל שם המשתמש שלך במערכת וללא סיסמה:

```
DB_USER=omridigmi
DB_PASSWORD=
```

### 5. הרצת מיגרציות

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. יצירת משתמש מנהל

```bash
python manage.py createsuperuser
```

### 7. הרצת השרת

```bash
python manage.py runserver
```

| כתובת | תיאור |
|---|---|
| http://127.0.0.1:8000/admin/ | ממשק הניהול |
| http://127.0.0.1:8000/api/ | שורש ה-API (יתווסף בשלב 3) |

---

### 8. זריעת נתוני דמו

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
hackeru-finalproject/
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
├── .env             סודות — לא נכנס ל-Git
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
| GET | `/api/articles/` | פתוח |
| GET | `/api/articles/?search=<q>` | פתוח |
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

## אבטחה

כל הסודות (`SECRET_KEY`, פרטי מסד הנתונים) נטענים מקובץ `.env` באמצעות `python-decouple`.
הקובץ `.env` מוחרג ב-`.gitignore` ואינו נכנס למאגר הקוד.
