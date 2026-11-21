# הקמת הפרויקט במחשב – שלב אחר שלב

המדריך מניח שאין לכם כלום מותקן. עוברים על השלבים לפי הסדר, ובסוף כל שלב יש בדיקה שמוודאת שהוא עבד. אם בדיקה נכשלת – לא ממשיכים, מסתכלים ב[פתרון בעיות](#פתרון-בעיות) או כותבים בקבוצה.

| שלב | מה מתקינים / עושים   | בערך   |
| --- | -------------------- | ------ |
| 1   | Git                  | 5 דק'  |
| 2   | Node.js              | 5 דק'  |
| 3   | Docker Desktop       | 10 דק' |
| 4   | עורך קוד (VS Code)   | 5 דק'  |
| 5   | גישה ל-repo ב-GitHub | 2 דק'  |
| 6   | הורדת הפרויקט        | 2 דק'  |
| 7   | התקנת חבילות         | 3 דק'  |
| 8   | קובץ `.env`          | 1 דק'  |
| 9   | הרמת ה-DB ב-Docker   | 2 דק'  |
| 10  | migrations ו-seed    | 1 דק'  |
| 11  | טסטים                | 1 דק'  |
| 12  | הרצת האפליקציה       | 1 דק'  |

---

## שלב 1 – Git

**Mac**

ב-Mac פותחים Terminal ומריצים:

```bash
git --version
```

אם Git לא מותקן, ה-Mac יציע להתקין את Command Line Tools – מאשרים ומחכים שיסתיים.

**Windows**

מורידים ומתקינים מ-[git-scm.com](https://git-scm.com/download/win). בהתקנה משאירים את ברירות המחדל.
אחרי ההתקנה עובדים עם **Git Bash** (מותקן יחד עם Git) או עם הטרמינל של VS Code.

**הגדרת שם ומייל** (אותו מייל של חשבון ה-GitHub):

```bash
git config --global user.name "Your Name"
```

```bash
git config --global user.email "you@example.com"
```

✅ **בדיקה:** `git --version` מחזיר מספר גרסה.

---

## שלב 2 – Node.js

הפרויקט עובד עם **Node 22**.

מורידים את גרסת **22 LTS** מ-[nodejs.org](https://nodejs.org) ומתקינים עם ברירות המחדל. npm מותקן יחד איתו.

אחרי ההתקנה **סוגרים ופותחים מחדש** את הטרמינל.

✅ **בדיקה:**

```bash
node -v
```

```bash
npm -v
```

`node -v` צריך להחזיר `v22.x.x`.

---

## שלב 3 – Docker Desktop

Docker מריץ אצלנו את מסד הנתונים (Postgres) בתוך container, כך שלכולם יש בדיוק אותה סביבה בלי להתקין Postgres על המחשב.

**Mac**

מורידים מ-[docker.com](https://www.docker.com/products/docker-desktop/) – לבחור את הגרסה הנכונה למעבד:

- Apple Silicon (M1/M2/M3/M4) – `Mac with Apple chip`
- Intel – `Mac with Intel chip`

גוררים ל-Applications, פותחים, ומאשרים את ההרשאות שהוא מבקש.

**Windows**

1. מורידים מ-[docker.com](https://www.docker.com/products/docker-desktop/) ומתקינים.
2. בהתקנה משאירים מסומן **Use WSL 2**.
3. אם מתבקשים להתקין או לעדכן WSL – מאשרים, ובסוף מפעילים מחדש את המחשב.

**חשוב:** Docker Desktop צריך **לרוץ** (האייקון של הלוויתן מופיע בשורת המשימות / בתפריט העליון) בכל פעם שעובדים על הפרויקט.

✅ **בדיקה:**

```bash
docker -v
```

```bash
docker compose version
```

```bash
docker run --rm hello-world
```

הפקודה האחרונה צריכה להדפיס `Hello from Docker!`.

---

## שלב 4 – VS Code

מורידים מ-[code.visualstudio.com](https://code.visualstudio.com) ומתקינים.

תוספים מומלצים (Extensions בצד שמאל):

- **ESLint**
- **Prettier - Code formatter**
- **Prisma**
- **Docker**

---

## שלב 5 – גישה ל-repo

1. אם אין לכם חשבון – נרשמים ב-[github.com](https://github.com).
2. שולחים לעידן את שם המשתמש שלכם ב-GitHub.
3. מאשרים את ההזמנה שמגיעה במייל (או ב-[github.com/notifications](https://github.com/notifications)).

✅ **בדיקה:** נכנסים ל-[github.com/Idansrur13/fiverr](https://github.com/Idansrur13/fiverr) ורואים את הקוד.

---

## שלב 6 – הורדת הפרויקט

נכנסים לתיקייה שבה אתם שומרים פרויקטים, ומורידים:

```bash
git clone https://github.com/Idansrur13/fiverr.git
```

```bash
cd fiverr
```

בפעם הראשונה ש-Git מבקש התחברות ל-GitHub, נפתח חלון בדפדפן – מתחברים ומאשרים.

פותחים את הפרויקט ב-VS Code:

```bash
code .
```

מכאן והלאה כל הפקודות רצות מתוך תיקיית `fiverr` (אפשר בטרמינל של VS Code: `` Ctrl+` ``).

✅ **בדיקה:** `git status` מחזיר `On branch main`.

---

## שלב 7 – התקנת חבילות

```bash
npm install
```

הפקודה מורידה את כל החבילות לתיקיית `node_modules` ומייצרת את ה-Prisma client.

✅ **בדיקה:** הפקודה מסתיימת בלי `ERR!`, ובסוף מופיע `Generated Prisma Client`.

---

## שלב 8 – קובץ `.env`

יוצרים קובץ `.env` מקובץ הדוגמה:

**Mac / Git Bash**

```bash
cp .env.example .env
```

**Windows PowerShell**

```bash
copy .env.example .env
```

הקובץ כבר מכוון ל-DB המקומי ב-Docker, אין צורך לשנות בו כלום כרגע.
את המפתחות של Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY` ו-`VITE_...`) תקבלו מעידן כשנגיע להתחברות.

**לעולם לא מעלים את `.env` ל-Git** – הוא כבר נמצא ב-`.gitignore`.

✅ **בדיקה:** יש קובץ `.env` בתיקייה הראשית של הפרויקט.

---

## שלב 9 – הרמת ה-DB ב-Docker

מוודאים ש-Docker Desktop פתוח, ומריצים:

```bash
docker compose up -d
```

בפעם הראשונה Docker מוריד את Postgres – זה לוקח דקה-שתיים.
ה-container נקרא `fiverr-db`, רץ על פורט **5440**, ויוצר שני databases:

- `fiverr` – לפיתוח
- `fiverr_test` – לטסטים

✅ **בדיקה:**

```bash
docker ps
```

בשורה של `fiverr-db` צריך להופיע `(healthy)` ו-`0.0.0.0:5440->5432/tcp`.

---

## שלב 10 – migrations ו-seed

יצירת הטבלאות לפי ה-schema:

```bash
npx prisma migrate dev
```

טעינת נתוני דמו:

```bash
npm run db:seed
```

ב-production לא מריצים את זה מהמחשב. ב-GitHub נכנסים ל-**Actions** → **Seed database** → **Run workflow**, ומקלידים `seed` בשדה האישור. ה-workflow מריץ קודם את ה-migrations ואחר כך את ה-seed, ואפשר להריץ אותו שוב בלי שייווצרו כפילויות. הוא צריך את הסודות `DATABASE_URL` ו-`DIRECT_URL` ב-**Settings** → **Secrets and variables** → **Actions**.

✅ **בדיקה:** פותחים את Prisma Studio ורואים את הטבלאות, ובטבלת `Category` יש נתונים:

```bash
npm run db:studio
```

ייפתח דפדפן בכתובת `http://localhost:5555`. סוגרים עם `Ctrl+C` בטרמינל.

רוצים לעבוד עם pgAdmin במקום? יש מדריך נפרד: [PGADMIN.md](PGADMIN.md).

---

## שלב 11 – טסטים

```bash
npm run check
```

הפקודה מריצה lint, טסטים ו-build – אותו דבר שה-CI מריץ על כל PR.

✅ **בדיקה:** כל הטסטים עוברים (`passed`) וה-build מסתיים ב-`built in`.

---

## שלב 12 – הרצת האפליקציה

```bash
npm run dev
```

פותחים בדפדפן את `http://localhost:5173`.

✅ **בדיקה:** האתר עולה בלי שגיאות בקונסול של הדפדפן (`F12` → Console).

### הרצה עם ה-API (כשנגיע לעבודה מול השרת)

1. מבקשים מעידן הזמנה לצוות ב-Vercel.
2. מתקינים את ה-CLI:

```bash
npm install -g vercel
```

3. מתחברים ומקשרים את הפרויקט (פעם אחת):

```bash
vercel login
```

```bash
vercel link
```

4. מריצים:

```bash
vercel dev
```

✅ **בדיקה:** `http://localhost:3000/api/health` מחזיר `{"status":"ok"}`.

---

## מוכנים 🎉

עכשיו עוברים על [CONTRIBUTING.md](../CONTRIBUTING.md) ופותחים את הבראנץ' הראשון:

```bash
git checkout -b <name>/<feature_name>
```

---

## עבודה יומיומית

בתחילת כל יום עבודה:

1. פותחים את Docker Desktop
2. מעדכנים את `main`:

```bash
git checkout main
```

```bash
git pull origin main
```

3. אם נכנסו חבילות או migrations חדשים:

```bash
npm install
```

```bash
npx prisma migrate dev
```

4. מרימים את ה-DB (אם הוא לא רץ):

```bash
docker compose up -d
```

בסוף היום אפשר לכבות את ה-DB (הנתונים נשמרים):

```bash
docker compose down
```

---

## פתרון בעיות

| בעיה                                                           | פתרון                                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot connect to the Docker daemon`                          | Docker Desktop לא פתוח – פותחים אותו ומחכים שיסיים לעלות                                                                                          |
| `port is already allocated` / `address already in use` על 5440 | משהו אחר תופס את הפורט. בודקים מה רץ עם `docker ps`, או כותבים בקבוצה ונבחר פורט אחר                                                              |
| `P1001: Can't reach database server`                           | ה-DB לא רץ – מריצים `docker compose up -d` ובודקים ש-`docker ps` מראה `healthy`                                                                   |
| `P1000: Authentication failed`                                 | ה-`.env` לא תקין – מעתיקים אותו שוב מ-`.env.example`                                                                                              |
| `database "fiverr_test" does not exist`                        | ה-volume נוצר לפני שהסקריפט נוסף. מריצים `docker compose down -v` ואז `docker compose up -d` (**מוחק את הנתונים המקומיים**), ואחריו שוב את שלב 10 |
| `'node' is not recognized` / `command not found: node`         | סוגרים ופותחים מחדש את הטרמינל, ואם לא עוזר – מתקינים שוב את Node                                                                                 |
| `npm install` נכשל                                             | מוחקים את `node_modules` ומריצים `npm install` שוב                                                                                                |
| הטסטים של ה-API נכשלים                                         | הם רצים מול ה-DB ב-Docker – מוודאים שהוא רץ                                                                                                       |
| Windows: Docker לא עולה                                        | פותחים PowerShell כמנהל, מריצים `wsl --update`, ומפעילים מחדש את המחשב                                                                            |

לא מצאתם את הבעיה כאן? שולחים בקבוצה צילום מסך של השגיאה המלאה ואת הפקודה שהרצתם.
