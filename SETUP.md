# הוראות התקנה — macOS

מסמך זה מיועד להרצה חד-פעמית. אחרי שהכל עובד, ההרצה היומיומית מתועדת ב-`README.md`.

---

## שלב א' — התקנת Python 3.12 ו-PostgreSQL

```bash
brew install python@3.12 postgresql@16
```

ההתקנה עשויה לקחת מספר דקות.

---

## שלב ב' — הפעלת שרת PostgreSQL

```bash
brew services start postgresql@16
```

`postgresql@16` הוא keg-only ב-Homebrew, כלומר הפקודות שלו אינן נכנסות אוטומטית ל-PATH. יש להוסיף אותן:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

בדיקה שזה עבד:

```bash
which createdb
```

אמור להחזיר נתיב. אם אין פלט — פתח חלון טרמינל חדש ונסה שוב.

> **הערה למשתמשי Mac עם מעבד Intel:** הנתיב הוא `/usr/local/opt/postgresql@16/bin` במקום `/opt/homebrew/...`.

---

## שלב ג' — יצירת מסד הנתונים

```bash
createdb blog_db
```

בדיקה:

```bash
psql -l | grep blog_db
```

---

## שלב ד' — בניית הסביבה הווירטואלית מחדש

הסביבה הקיימת נבנתה עם Python 3.9 ולכן יש למחוק אותה:

```bash
cd ~/Desktop/Projects/hackeru-finalproject
deactivate 2>/dev/null
rm -rf venv

/opt/homebrew/bin/python3.12 -m venv venv
source venv/bin/activate
```

אימות — הפקודה חייבת להחזיר 3.12.x:

```bash
python --version
```

---

## שלב ה' — התקנת החבילות

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## שלב ו' — מיגרציות ומשתמש ניהול

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

---

## שלב ז' — הרצה

```bash
python manage.py runserver
```

פתח בדפדפן: http://127.0.0.1:8000/admin/

---

## פתרון תקלות

| שגיאה | סיבה וטיפול |
|---|---|
| `command not found: createdb` | ה-PATH לא עודכן. פתח טרמינל חדש או הרץ `source ~/.zshrc` |
| `could not connect to server` | השרת לא רץ. הרץ `brew services start postgresql@16` |
| `role "omridigmi" does not exist` | הרץ `createuser -s omridigmi` |
| `database "blog_db" does not exist` | הרץ `createdb blog_db` |
| `No module named 'django'` | ה-venv לא מופעל. הרץ `source venv/bin/activate` |
| `Could not find a version that satisfies Django` | ה-venv נבנה עם Python ישן. חזור לשלב ד' |

---

## תזכורת יומיומית

בכל פעם שאתה פותח טרמינל חדש לעבודה על הפרויקט:

```bash
cd ~/Desktop/Projects/hackeru-finalproject
source venv/bin/activate
python manage.py runserver
```
