# חלוקת עבודה – Fiverr Clone

| חבר צוות | תחום אחריות                                                | Branch prefix |
| -------- | ---------------------------------------------------------- | ------------- |
| עידן     | תשתית, התחברות ומשתמשים, ניהול גיגים למוכר (Backoffice)    | `idan/`       |
| [שם 2]   | גילוי שירותים: Header, Home, Explore, פילטרים, פרופיל מוכר | `[name2]/`    |
| [שם 3]   | עמוד גיג, רכישה, הזמנות וביקורות                           | `[name3]/`    |

חוקי העבודה המלאים (בראנצ'ים, issues, טסטים, PR) נמצאים ב-[CONTRIBUTING.md](CONTRIBUTING.md).

---

## עקרונות החלוקה

1. **כל אחד אחראי על תחום מקצה לקצה** – UI, Redux, service, API ו-Prisma. כך כל אחד מאיתנו עושה עבודת full-stack אמיתית ויכול להציג אותה.
2. **אחריות זה לא לבד** – כל PR עובר review של חבר צוות אחר, וכל אחד מכיר את הקוד של השני.
3. **החוזים נקבעים מראש** – מבנה הנתונים (Prisma schema), הראוטים וה-API מוגדרים בשלב 0, כדי שכל אחד יוכל לעבוד במקביל בלי לחכות.
4. **רספונסיביות וטסטים** – כל אחד אחראי על המובייל והטסטים של העמודים והקוד שלו.

---

## שלב 0 – הקמה משותפת

### Product Design Approval

| משימה                                                      | אחראי  |
| ---------------------------------------------------------- | ------ |
| פתיחת חשבון ב-Fiverr, מעבר על האתר והאפליקציה, הרשמה כמוכר | כולם   |
| שם ייחודי ולוגו                                            | כולם   |
| מצגת אפיון – Home, Explore, NavBar, Footer                 | [שם 2] |
| מצגת אפיון – Details, Flow רכישה, Flow הזמנות              | [שם 3] |
| מצגת אפיון – Flow התחברות, Backoffice                      | עידן   |
| איחוד המצגת והכנה להצגה לראש הצוות                         | כולם   |

### Technical Approval

| משימה                                                                            | אחראי  |
| -------------------------------------------------------------------------------- | ------ |
| Repo ב-GitHub, הגנה על `main`, dev-board, labels, תבניות issue ו-PR              | עידן   |
| Supabase (פרויקט dev ופרויקט prod), Vercel, משתני סביבה                          | עידן   |
| `docker-compose.yml` עם Postgres מקומי                                           | עידן   |
| Prisma: schema ראשוני, migration ראשון, Prisma client                            | עידן   |
| CI ב-GitHub Actions: lint, test, build                                           | עידן   |
| שלד Vite + React, מבנה תיקיות, ראוטים ועמודי דמה                                 | [שם 2] |
| Redux store: actions, reducers לכל ישות                                          | [שם 2] |
| מבנה CSS, פונטים, משתני צבעים, assets                                            | [שם 3] |
| services בסיסיים: `http.service`, `gig.service`, `order.service`, `user.service` | [שם 3] |
| מעבר על קובץ ה-JSON של הנתונים והתאמה ל-schema                                   | כולם   |
| קובץ seed עם נתוני דמו (משתמשים, גיגים, ביקורות)                                 | [שם 2] |

---

## תחומי אחריות

### עידן – תשתית, התחברות וניהול גיגים

**Frontend**

- התחברות והרשמה: מודאל התחברות, Google login דרך Supabase Auth
- `UserMenu` ב-Header: אווטאר, התנתקות, מעבר בין מצב קונה למוכר
- Protected routes לעמודים שדורשים התחברות
- עמוד פרופיל והגדרות אישיות
- Flow "הפוך למוכר"
- Backoffice – Dashboard: כרטיסי סיכום (הכנסות, הזמנות פעילות, הזמנות שהושלמו)
- Backoffice – הגיגים שלי: טבלה עם טאבים לפי סטטוס (Active, Draft, Paused)
- Backoffice – יצירה ועריכה של גיג: פרטים, קטגוריה, חבילות, העלאת תמונות ל-Supabase Storage

**Backend**

- `requireUser` – אימות טוקן של Supabase בכל endpoint מוגן
- `GET /api/users/me`, `PATCH /api/users/me`, `POST /api/users/me/seller`
- `GET /api/seller/gigs`, `POST /api/gigs`, `PUT /api/gigs/[id]`, `DELETE /api/gigs/[id]`
- `GET /api/seller/stats`

**תשתית**

- Docker, Prisma schema ו-migrations, Supabase, Vercel, CI

**טסטים**

- `requireUser`, ולידציה של יצירת ועדכון גיג, `user.reducer`, קומפוננטת `GigForm`

---

### [שם 2] – גילוי שירותים

**Frontend**

- `AppHeader`: לוגו, חיפוש, ניווט קטגוריות (כולל מקום ל-`UserMenu` ולאינדיקציית הזמנות)
- `AppFooter`, ניווט תחתון במובייל
- `HomePage`: Hero עם חיפוש, שירותים פופולריים (קרוסלה), קטגוריות
- `ExplorePage`: רשימת גיגים, `GigPreview` (קרוסלת תמונות, מוכר, דירוג, מחיר התחלתי)
- פילטרים: קטגוריה, תקציב, זמן אספקה, רמת מוכר
- מיון: מומלץ, הכי נמכר, חדש
- סנכרון הפילטרים ל-URL (query params) ו-pagination
- `SellerProfilePage`: עמוד מוכר ציבורי עם הגיגים שלו

**Backend**

- `GET /api/gigs` עם פילטרים, מיון ו-pagination
- `GET /api/categories`
- `GET /api/users/[id]` – פרופיל ציבורי
- `prisma/seed.js`

**טסטים**

- בניית שאילתת הפילטרים, `GigPreview`, סנכרון פילטרים ל-URL, `gig.reducer`

---

### [שם 3] – עמוד גיג, רכישה והזמנות

**Frontend**

- `GigDetailsPage`: breadcrumbs, כותרת, גלריית תמונות, תיאור, על המוכר
- בחירת חבילה (Basic / Standard / Premium) בקופסת רכישה צמודה
- רשימת ביקורות עם פילוח דירוגים
- Flow רכישה: עמוד checkout וחיווי הזמנה שבוצעה
- הזמנות קונה: טאבים Active, Delivered, Completed, Cancelled
- הזמנות מוכר (Backoffice): אישור, דחייה, מסירה והשלמה של הזמנה
- עמוד פרטי הזמנה: פירוט מחיר ו-Track Order
- כתיבת ביקורת אחרי הזמנה שהושלמה
- אינדיקציית הזמנה חדשה ב-Header

**Backend**

- `GET /api/gigs/[id]` – כולל מוכר, חבילות וביקורות
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/[id]`, `PATCH /api/orders/[id]/status`
- `POST /api/reviews`
- חוקי מעבר סטטוס של הזמנה וחישוב מחיר (subtotal, service fee, total)

**טסטים**

- מעברי סטטוס, חישוב מחיר, `order.reducer`, קומפוננטת `PackageSelector`, `POST /api/orders`

---

## מבנה נתונים (חוזה משותף)

ה-schema נמצא ב-`prisma/schema.prisma`. האחראי עליו הוא עידן, וכל שינוי עובר PR עם אישור של כל הצוות.

| ישות       | שדות עיקריים                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `User`     | `id` (מ-Supabase Auth), `username`, `fullname`, `imgUrl`, `isSeller`, `level`, `about`, `country`, `languages`, `createdAt`      |
| `Category` | `id`, `name`, `slug`, `parentId`                                                                                                 |
| `Gig`      | `id`, `ownerId`, `categoryId`, `title`, `description`, `images`, `tags`, `status`, `createdAt`                                   |
| `Package`  | `id`, `gigId`, `tier`, `title`, `description`, `price`, `daysToMake`, `revisions`, `features`                                    |
| `Order`    | `id`, `buyerId`, `sellerId`, `gigId`, `packageId`, `price`, `serviceFee`, `total`, `status`, `dueAt`, `deliveredAt`, `createdAt` |
| `Review`   | `id`, `orderId`, `gigId`, `reviewerId`, `rating`, `text`, `createdAt`                                                            |

סטטוסים:

- `Gig.status`: `ACTIVE`, `DRAFT`, `PAUSED`
- `Package.tier`: `BASIC`, `STANDARD`, `PREMIUM`
- `Order.status`: `PENDING` → `IN_PROGRESS` → `DELIVERED` → `COMPLETED`, או `CANCELLED`

---

## מפת ראוטים

| ראוט                                        | עמוד                  | אחראי  |
| ------------------------------------------- | --------------------- | ------ |
| `/`                                         | `HomePage`            | [שם 2] |
| `/explore`                                  | `ExplorePage`         | [שם 2] |
| `/user/:id`                                 | `SellerProfilePage`   | [שם 2] |
| `/gig/:id`                                  | `GigDetailsPage`      | [שם 3] |
| `/checkout/:gigId`                          | `CheckoutPage`        | [שם 3] |
| `/orders`                                   | `BuyerOrdersPage`     | [שם 3] |
| `/orders/:id`                               | `OrderDetailsPage`    | [שם 3] |
| `/seller/orders`                            | `SellerOrdersPage`    | [שם 3] |
| `/profile`                                  | `ProfilePage`         | עידן   |
| `/seller/dashboard`                         | `SellerDashboardPage` | עידן   |
| `/seller/gigs`                              | `SellerGigsPage`      | עידן   |
| `/seller/gigs/new`, `/seller/gigs/:id/edit` | `GigEditPage`         | עידן   |

## מפת API

| Endpoint                                                          | תיאור                        | אחראי  |
| ----------------------------------------------------------------- | ---------------------------- | ------ |
| `GET /api/gigs`                                                   | רשימת גיגים עם פילטרים       | [שם 2] |
| `GET /api/categories`                                             | קטגוריות                     | [שם 2] |
| `GET /api/users/[id]`                                             | פרופיל מוכר ציבורי           | [שם 2] |
| `GET /api/gigs/[id]`                                              | גיג מלא                      | [שם 3] |
| `POST /api/orders`                                                | יצירת הזמנה                  | [שם 3] |
| `GET /api/orders`                                                 | הזמנות לפי `role` ו-`status` | [שם 3] |
| `GET /api/orders/[id]`                                            | הזמנה בודדת                  | [שם 3] |
| `PATCH /api/orders/[id]/status`                                   | שינוי סטטוס                  | [שם 3] |
| `POST /api/reviews`                                               | ביקורת                       | [שם 3] |
| `GET /api/users/me` / `PATCH /api/users/me`                       | המשתמש המחובר                | עידן   |
| `POST /api/users/me/seller`                                       | הפיכה למוכר                  | עידן   |
| `GET /api/seller/gigs`                                            | הגיגים של המוכר              | עידן   |
| `POST /api/gigs` / `PUT /api/gigs/[id]` / `DELETE /api/gigs/[id]` | ניהול גיג                    | עידן   |
| `GET /api/seller/stats`                                           | נתוני Dashboard              | עידן   |

---

## לוח זמנים

| ספרינט | תאריכים       | יעד                     | עידן                                       | [שם 2]                              | [שם 3]                             |
| ------ | ------------- | ----------------------- | ------------------------------------------ | ----------------------------------- | ---------------------------------- |
| 0      | **/** – **/** | Product Design Approval | מצגת: התחברות, Backoffice                  | מצגת: Home, Explore                 | מצגת: Details, Flows               |
| 1      | **/** – **/** | Technical Approval      | Repo, Docker, Prisma, Supabase, Vercel, CI | שלד, ראוטים, Redux, seed            | CSS, assets, services              |
| 2      | **/** – **/** | זרימות קריאה            | Google login, `UserMenu`, פרופיל           | Header, Home, Explore עם נתוני seed | עמוד גיג, חבילות, ביקורות          |
| 3      | **/** – **/** | זרימות כתיבה            | יצירה ועריכה של גיג, העלאת תמונות          | פילטרים, מיון, pagination           | Checkout, יצירת הזמנה, הזמנות קונה |
| 4      | **/** – **/** | Backoffice              | Dashboard, הגיגים שלי                      | פרופיל מוכר, רספונסיביות            | הזמנות מוכר, סטטוסים, ביקורת       |
| 5      | **/** – **/** | ליטוש ודמו              | בדיקת flow מלא, יעדי הרחבה                 | בדיקת flow מלא, יעדי הרחבה          | בדיקת flow מלא, יעדי הרחבה         |

---

## נקודות חיבור בין התחומים

| נקודה                     | מי בונה      | מי משתמש                                      | איך לא נתקעים                                                             |
| ------------------------- | ------------ | --------------------------------------------- | ------------------------------------------------------------------------- |
| `AppHeader`               | [שם 2]       | עידן (`UserMenu`), [שם 3] (אינדיקציית הזמנות) | ה-Header נבנה עם מקומות שמורים, כל אחד מכניס קומפוננטה משלו               |
| התחברות                   | עידן         | [שם 3] (רכישה), עידן (Backoffice)             | עד שה-Google login מוכן משתמשים במשתמש דמו מה-seed                        |
| מבנה `Gig`                | עידן (כתיבה) | [שם 2], [שם 3] (קריאה)                        | נקבע ב-schema בספרינט 1, שינוי רק ב-PR מאושר                              |
| `GigPreview` → `/gig/:id` | [שם 2]       | [שם 3]                                        | הראוט מוגדר בשלד מהיום הראשון                                             |
| טבלת `Order`              | [שם 3]       | עידן (`GET /api/seller/stats`)                | מבנה ההזמנה נקבע ב-schema בספרינט 1, עד אז ה-Dashboard עובד על נתוני seed |

---

## יעדי הרחבה (אם נשאר זמן)

| יעד                                       | אחראי  |
| ----------------------------------------- | ------ |
| הודעות בין קונה למוכר (Supabase Realtime) | עידן   |
| רשימת מועדפים (Wishlist)                  | [שם 2] |
| התראות בזמן אמת על שינוי סטטוס הזמנה      | [שם 3] |
| טסטי E2E ל-flow המלא: חיפוש → גיג → רכישה | כולם   |
