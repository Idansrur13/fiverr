# עבודה עם pgAdmin

pgAdmin הוא ממשק גרפי לצפייה ועבודה עם Postgres – רואים את הטבלאות, הנתונים, ומריצים שאילתות SQL.
זה **לא חובה**: אפשר להסתפק ב-Prisma Studio (`npm run db:studio`). pgAdmin שימושי כשרוצים לכתוב SQL ולהבין לעומק מה קורה ב-DB.

לפני שמתחילים – צריך שה-DB ב-Docker ירוץ (שלב 9 ב-[SETUP.md](SETUP.md)).

---

## ⚠️ חוק אחד חשוב

**pgAdmin משמש לצפייה ולשאילתות בלבד.**

- **אסור** לשנות מבנה (טבלאות, עמודות, אינדקסים) דרך pgAdmin – שינויי מבנה עושים **רק** דרך Prisma migrations.
- שינוי נתונים (הוספה, עריכה, מחיקה של שורות) מותר רק ב-DB המקומי, לצורך בדיקות.
- אם מתחברים ל-Supabase – **רק לקריאה**. לא משנים שם כלום.

---

## שלב 1 – התקנה

מורידים את **pgAdmin 4** מ-[pgadmin.org/download](https://www.pgadmin.org/download/) לפי מערכת ההפעלה, ומתקינים עם ברירות המחדל.

בפתיחה הראשונה pgAdmin מבקש להגדיר **master password** – זו סיסמה שמגינה על הסיסמאות שתשמרו בו. בוחרים סיסמה וזוכרים אותה.

---

## שלב 2 – חיבור ל-DB המקומי

1. בצד שמאל, לוחצים קליק ימני על **Servers** → **Register** → **Server...**
2. בלשונית **General**:

| שדה  | ערך            |
| ---- | -------------- |
| Name | `fiverr-local` |

3. בלשונית **Connection**:

| שדה                  | ערך         |
| -------------------- | ----------- |
| Host name/address    | `localhost` |
| Port                 | `5440`      |
| Maintenance database | `postgres`  |
| Username             | `postgres`  |
| Password             | `postgres`  |
| Save password?       | ✅          |

4. לוחצים **Save**.

✅ **בדיקה:** בצד שמאל מופיע `fiverr-local`, ובתוכו **Databases** עם `fiverr` ו-`fiverr_test`.

> הפורט הוא **5440** ולא 5432 – כך מוגדר ב-`docker-compose.yml`.

---

## שלב 3 – צפייה בטבלאות ובנתונים

הטבלאות נמצאות כאן:

```
fiverr-local
└─ Databases
   └─ fiverr
      └─ Schemas
         └─ public
            └─ Tables
               ├─ Category
               ├─ Gig
               ├─ Order
               ├─ Package
               ├─ Review
               ├─ User
               └─ _prisma_migrations
```

- **צפייה בנתונים:** קליק ימני על טבלה → **View/Edit Data** → **All Rows**
- **צפייה במבנה:** פותחים את הטבלה → **Columns**
- **רענון אחרי migration:** קליק ימני על **Tables** → **Refresh**

`_prisma_migrations` היא הטבלה ש-Prisma משתמש בה כדי לדעת אילו migrations כבר רצו. **לא נוגעים בה.**

---

## שלב 4 – הרצת שאילתות SQL

1. בוחרים את ה-database `fiverr`.
2. בתפריט העליון: **Tools** → **Query Tool**.
3. כותבים שאילתה ומריצים עם **F5** (או כפתור ה-▶).

### שימו לב: גרשיים כפולים

Prisma יוצר טבלאות ועמודות עם אותיות גדולות (`Gig`, `ownerId`). ב-Postgres שמות כאלה **חייבים להיות בגרשיים כפולים**:

```sql
SELECT * FROM "Gig";
```

```sql
SELECT "title", "status" FROM "Gig" WHERE "status" = 'ACTIVE';
```

בלי גרשיים (`SELECT * FROM Gig`) תקבלו שגיאה `relation "gig" does not exist`.

### שאילתות שימושיות

כל הקטגוריות:

```sql
SELECT "name", "slug" FROM "Category" ORDER BY "name";
```

גיגים עם שם המוכר והקטגוריה:

```sql
SELECT g."title", u."username", c."name" AS "category"
FROM "Gig" g
JOIN "User" u ON u."id" = g."ownerId"
JOIN "Category" c ON c."id" = g."categoryId";
```

המחיר הזול ביותר לכל גיג:

```sql
SELECT g."title", MIN(p."price") AS "startingAt"
FROM "Gig" g
JOIN "Package" p ON p."gigId" = g."id"
GROUP BY g."id", g."title";
```

כמות הזמנות לפי סטטוס:

```sql
SELECT "status", COUNT(*) FROM "Order" GROUP BY "status";
```

דירוג ממוצע לכל גיג:

```sql
SELECT g."title", ROUND(AVG(r."rating"), 1) AS "rating", COUNT(r."id") AS "reviews"
FROM "Gig" g
LEFT JOIN "Review" r ON r."gigId" = g."id"
GROUP BY g."id", g."title"
ORDER BY "rating" DESC NULLS LAST;
```

אילו migrations כבר רצו:

```sql
SELECT "migration_name", "finished_at" FROM "_prisma_migrations" ORDER BY "finished_at";
```

---

## שלב 5 (אופציונלי) – חיבור ל-Supabase לקריאה

שימושי כדי לראות מה יש ב-DB של סביבת ה-dev או ה-production.

1. מבקשים מעידן את פרטי החיבור (host, user, password).
2. **Register** → **Server...** עם השם `fiverr-supabase-dev`.
3. בלשונית **Connection** ממלאים את הפרטים שקיבלתם, עם פורט `5432`.
4. בלשונית **Parameters** מוסיפים `SSL mode` = `require`.

**שוב – רק לקריאה.** כל שינוי ב-Supabase נעשה דרך migration שעובר PR.

---

## פתרון בעיות

| בעיה                                                 | פתרון                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `connection refused` / `could not connect to server` | ה-DB לא רץ – מריצים `docker compose up -d` ובודקים עם `docker ps`                  |
| `password authentication failed`                     | בודקים שהפורט הוא `5440` – בפורט אחר יכול לרוץ Postgres אחר עם סיסמה אחרת          |
| לא רואים טבלאות                                      | מוודאים שהרצתם `npx prisma migrate dev`, ואז קליק ימני על **Tables** → **Refresh** |
| `relation "gig" does not exist`                      | חסרים גרשיים כפולים סביב שם הטבלה: `"Gig"`                                         |
| שכחתי את ה-master password                           | **File** → **Reset Master Password** (השרתים השמורים יצטרכו סיסמה מחדש)            |
