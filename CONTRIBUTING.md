# חוקים וצורת עבודה

המסמך הזה מחייב את כל חברי הצוות. חלוקת התחומים נמצאת ב-[WORK_PLAN.md](WORK_PLAN.md).

---

## הסטאק

| שכבה          | טכנולוגיה                                   |
| ------------- | ------------------------------------------- |
| Frontend      | React + Vite, Redux, CSS                    |
| Backend       | Vercel Serverless Functions (תיקיית `api/`) |
| Database      | Supabase Postgres                           |
| ORM           | Prisma                                      |
| Auth          | Supabase Auth (מייל וסיסמה)                 |
| קבצים ותמונות | Supabase Storage                            |
| סביבה מקומית  | Docker (Postgres מקומי לפיתוח ולטסטים)      |
| טסטים         | Vitest, React Testing Library               |
| CI            | GitHub Actions                              |
| Deploy        | Vercel                                      |

---

## חוקי ברזל

1. **אין push ואין מיזוג ישירות ל-`main`.** כל שינוי נכנס רק דרך PR.
2. **כל משימה מתחילה ב-issue** ומופיעה ב-dev-board.
3. **כל אחד עובד בבראנץ' משלו**, לפי השם שלו והפיצ'ר.
4. **אין PR בלי טסטים**, ושולחים PR רק כשהכל ירוק.
5. **אף אחד לא ממזג PR בלי אישור** של חבר צוות נוסף.
6. **סודות לא נכנסים ל-Git.** אף פעם.

---

## בראנצ'ים

### שם הבראנץ'

```
<name>/<feature_name>
```

| ✅ נכון                   | ❌ לא נכון        |
| ------------------------- | ----------------- |
| `idan/user_profile`       | `user-profile`    |
| `idan/gig_edit_form`      | `idan/fix`        |
| `[name2]/explore_filters` | `feature/explore` |
| `[name3]/order_status`    | `[name3]/stuff`   |

- אותיות קטנות באנגלית, מילים מופרדות ב-`_`
- בראנץ' אחד לפיצ'ר אחד, לא לערבב כמה משימות
- יוצאים תמיד מ-`main` מעודכן
- אחרי מיזוג הבראנץ' נמחק

### מחזור עבודה

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git checkout -b idan/user_profile
```

עובדים, ועושים commit-ים קטנים לאורך הדרך:

```bash
git add .
```

```bash
git commit -m "feat: add user profile page"
```

לפני ה-PR מעדכנים מול `main`:

```bash
git fetch origin
```

```bash
git rebase origin/main
```

```bash
npm run check
```

```bash
git push -u origin idan/user_profile
```

אם הבראנץ' כבר נדחף לפני ה-rebase, דוחפים עם:

```bash
git push --force-with-lease
```

`--force` רגיל אסור.

### Commits

פורמט: `<type>: <תיאור קצר באנגלית>`

| type       | מתי                         |
| ---------- | --------------------------- |
| `feat`     | פיצ'ר חדש                   |
| `fix`      | תיקון באג                   |
| `test`     | הוספה או שינוי של טסטים     |
| `refactor` | שינוי קוד בלי שינוי התנהגות |
| `style`    | עיצוב ו-CSS                 |
| `chore`    | תשתית, תלויות, קונפיגורציה  |
| `docs`     | מסמכים                      |

דוגמאות: `feat: add explore filters`, `fix: order total rounding`, `test: gig reducer`.

---

## Issues ו-dev-board

### Issue

כל משימה, גדולה או קטנה, נפתחת כ-issue **לפני** שמתחילים לעבוד עליה.

- **כותרת:** קצרה וברורה – `User profile page`, `Explore filters by budget`
- **תיאור:** מה צריך לעשות ומתי זה נחשב גמור
- **Assignee:** מי שעובד על זה
- **Labels:** `frontend`, `backend`, `db`, `infra`, `design`, `bug`, `blocked`
- **גודל:** `S` (עד חצי יום), `M` (יום–יומיים), `L` (מעל – לפרק לכמה issues)

### dev-board

| עמודה       | משמעות                    |
| ----------- | ------------------------- |
| Backlog     | משימות שעוד לא תוכננו     |
| Ready       | מוגדר ומוכן לעבודה        |
| In Progress | מישהו עובד על זה עכשיו    |
| In Review   | יש PR פתוח שמחכה ל-review |
| Done        | מוזג ל-`main`             |

- מזיזים את הכרטיס **בכל פעם** שהסטטוס משתנה – הבורד צריך לשקף את המצב האמיתי
- עד 2 משימות במקביל ב-In Progress לכל אחד
- נתקעת? מוסיפים label `blocked` וכותבים בקבוצה על מה

---

## טסטים

### מה חייב להיות בכל PR

- טסטים לכל לוגיקה חדשה: services, reducers, פונקציות עזר, API handlers
- טסטים לקומפוננטות עם התנהגות (טפסים, פילטרים, בחירת חבילה)
- תיקון באג מגיע עם טסט שמשחזר אותו
- אין `.only` ואין `.skip` שנשארים בקוד

### איפה הטסטים

| סוג                        | כלי                   | מיקום                                 |
| -------------------------- | --------------------- | ------------------------------------- |
| לוגיקה, services, reducers | Vitest                | ליד הקובץ: `gig.service.test.js`      |
| קומפוננטות                 | React Testing Library | ליד הקומפוננטה: `GigPreview.test.jsx` |
| API handlers               | Vitest + DB של Docker | `tests/api/gigs.test.js`              |

טסטים של ה-API רצים מול DB מקומי ב-Docker (`fiverr_test`), **לא** מול Supabase. לכן Docker צריך לרוץ לפני `npm test`.

טסטים של ה-API נמצאים ב-`tests/api` ולא בתוך `api/`, כי כל קובץ בתוך `api/` הופך ב-Vercel ל-endpoint.

### לפני כל PR

```bash
npm run check
```

הפקודה מריצה `lint`, `test` ו-`build`. **רק אם הכל ירוק – פותחים PR.**

---

## Pull Requests

### פתיחת PR

- **כותרת:** באותו פורמט של commit – `feat: user profile page`
- **תיאור:**
  - מה נעשה ולמה
  - `Closes #12` – קישור ל-issue (סוגר אותו אוטומטית במיזוג)
  - איך בדקתי
  - צילומי מסך או GIF לכל שינוי ב-UI (גם מובייל)
- PR קטן וממוקד – עדיף כמה PR-ים קטנים מאחד ענק
- מעבירים את הכרטיס ל-In Review

### Review

- כל PR צריך **אישור אחד לפחות** מחבר צוות אחר
- review תוך 24 שעות
- בשינויי UI – פותחים את ה-Preview של Vercel ובודקים בעצמנו
- הערות נסגרות על ידי מי שפתח את ה-PR, אחרי תיקון או הסבר

### מיזוג

- רק כש-CI ירוק **וגם** יש אישור
- שיטת מיזוג: **Squash and merge**
- מי שפתח את ה-PR ממזג אותו
- קונפליקטים פותרים מקומית עם `git rebase origin/main`, לא בממשק של GitHub
- אחרי המיזוג: מוחקים את הבראנץ' ומוודאים שהכרטיס עבר ל-Done

### הגנה על `main` (מוגדר ב-GitHub)

- Require a pull request before merging
- Require 1 approval
- Require status checks to pass (CI)
- Require branches to be up to date before merging
- Block force pushes

---

## CI

כל PR ל-`main` מריץ ב-GitHub Actions:

1. `npm ci`
2. `prisma generate`
3. Postgres ב-container + `prisma migrate deploy`
4. `npm run lint`
5. `npm test`
6. `npm run build`

PR עם CI אדום לא ממוזג.

---

## Docker – סביבה מקומית

פעם ראשונה – יוצרים קובץ `.env` מהדוגמה:

```bash
cp .env.example .env
```

הרמת Postgres מקומי:

```bash
docker compose up -d
```

ה-DB רץ על פורט `5440` במחשב (ולא על 5432), כדי לא להתנגש ב-Postgres אחר שכבר רץ אצלכם. בתוך ה-container נוצרים שני databases: `fiverr` לפיתוח ו-`fiverr_test` לטסטים.

הרצת migrations:

```bash
npx prisma migrate dev
```

טעינת נתוני דמו:

```bash
npm run db:seed
```

הרצת האפליקציה עם ה-API (צריך התחברות ל-Vercel וקישור לפרויקט פעם אחת עם `vercel link`):

```bash
vercel dev
```

הרצת הפרונט בלבד:

```bash
npm run dev
```

כיבוי:

```bash
docker compose down
```

---

## Prisma ו-Database

- **שינוי schema רק דרך migration:** `npx prisma migrate dev --name <change_name>`
- תיקיית `prisma/migrations` נכנסת ל-Git יחד עם השינוי
- **אסור לערוך migration קיים** – רק להוסיף חדש
- **אסור לשנות טבלאות ידנית בדשבורד של Supabase**
- migration אחד לכל PR, ומודיעים בקבוצה כשנכנס שינוי schema
- אחרי `git pull` עם migration חדש מריצים `npx prisma migrate dev`
- Prisma client אחד משותף ב-`api/_lib/prisma.js` – לא יוצרים `new PrismaClient()` בכל קובץ
- ה-migrations מוחלים על Supabase רק אחרי מיזוג ל-`main`

### חיבור ל-Supabase

| משתנה          | שימוש                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | חיבור דרך ה-pooler (פורט `6543`, `?pgbouncer=true&connection_limit=1`) – לפונקציות serverless |
| `DIRECT_URL`   | חיבור ישיר (פורט `5432`) – ל-migrations                                                       |

---

## Vercel

- כל PR מקבל **Preview Deployment** אוטומטי – משתמשים בו ל-review
- Production עולה **רק** מ-`main`
- Preview מחובר לפרויקט ה-dev של Supabase, Production לפרויקט ה-prod
- קבצי עזר של ה-API נמצאים ב-`api/_lib/` (קבצים שמתחילים ב-`_` לא הופכים ל-endpoint)

---

## משתני סביבה וסודות

- `.env` **לעולם** לא נכנס ל-Git (נמצא ב-`.gitignore`)
- `.env.example` מתעדכן בכל משתנה חדש – שם בלבד, בלי ערך
- ערכים אמיתיים נשמרים ב-Vercel וב-GitHub Secrets
- מפתחות `service_role` של Supabase רק בצד השרת, אף פעם לא בקוד הפרונט

---

## קונבנציות קוד

| מה          | פורמט                                        | דוגמה                                    |
| ----------- | -------------------------------------------- | ---------------------------------------- |
| קומפוננטות  | PascalCase                                   | `src/cmps/GigPreview.jsx`                |
| עמודים      | PascalCase + `Page`                          | `src/pages/ExplorePage.jsx`              |
| services    | `<entity>.service.js`                        | `src/services/gig.service.js`            |
| Redux       | `<entity>.actions.js`, `<entity>.reducer.js` | `src/store/gig.reducer.js`               |
| CSS         | `<kebab-case>.css`, מיובא ב-`main.css`       | `src/assets/styles/cmps/gig-preview.css` |
| CSS classes | kebab-case                                   | `.gig-preview`                           |
| API         | לפי ראוט                                     | `api/gigs/[id].js`                       |

- ESLint ו-Prettier מוגדרים בפרויקט – הקוד עובר אותם לפני commit
- אין `console.log` בקוד שנכנס ל-`main`
- אין כתובות או מפתחות hard-coded
- קוד, שמות משתנים, commits ובראנצ'ים – באנגלית

---

## תקשורת

- **סנכרון יומי** – 10 דקות: מה עשיתי, מה אעשה, איפה אני תקוע
- **תכנון ספרינט** – בתחילת כל ספרינט עוברים יחד על הבורד ומחלקים issues
- **תקוע מעל שעתיים?** – כותבים בקבוצה, לא מחכים לסנכרון הבא
- **שינוי שנוגע לתחום של מישהו אחר** (schema, Header, services משותפים) – מתאמים לפני שמתחילים

---

## Definition of Done

משימה נחשבת גמורה רק כש:

- [ ] יש issue מקושר והכרטיס עבר ב-dev-board
- [ ] הקוד בבראנץ' בפורמט `<name>/<feature_name>`
- [ ] יש טסטים ו-`npm run check` ירוק מקומית
- [ ] CI ירוק
- [ ] עובד גם במובייל
- [ ] PR אושר על ידי חבר צוות
- [ ] מוזג ל-`main` ועובד ב-Production
