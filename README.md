# Fiverr Clone

פרויקט full-stack בהשראת Fiverr – React, Redux, Vercel Serverless, Supabase, Prisma ו-Docker.

- חלוקת העבודה: [WORK_PLAN.md](WORK_PLAN.md)
- חוקים וצורת עבודה: [CONTRIBUTING.md](CONTRIBUTING.md)
- הקמת הפרויקט במחשב, שלב אחר שלב: [docs/SETUP.md](docs/SETUP.md)
- עבודה עם pgAdmin: [docs/PGADMIN.md](docs/PGADMIN.md)

## התחלה מהירה

דרישות: Node 22, Docker. בפעם הראשונה עוברים על [docs/SETUP.md](docs/SETUP.md).

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
npx prisma migrate dev
```

```bash
npm run db:seed
```

```bash
npm run dev
```

## פקודות

| פקודה                               | מה היא עושה                        |
| ----------------------------------- | ---------------------------------- |
| `npm run dev`                       | הרצת הפרונט                        |
| `vercel dev`                        | הרצת הפרונט וה-API יחד             |
| `npm test`                          | הרצת כל הטסטים (Docker צריך לרוץ)  |
| `npm run lint`                      | בדיקת ESLint                       |
| `npm run check`                     | lint + test + build – חובה לפני PR |
| `npm run db:up` / `npm run db:down` | הרמה וכיבוי של ה-DB המקומי         |
| `npm run db:migrate`                | יצירה והרצה של migration           |
| `npm run db:seed`                   | טעינת נתוני דמו                    |
| `npm run db:studio`                 | צפייה בנתונים ב-Prisma Studio      |

## מבנה הפרויקט

```
├─ api/                    Vercel Serverless Functions
│  ├─ _lib/                prisma, auth, http – לא הופכים ל-endpoint
│  └─ health.js            GET /api/health
├─ prisma/
│  ├─ schema.prisma        מבנה הנתונים
│  ├─ migrations/
│  └─ seed.js
├─ src/
│  ├─ assets/styles/       setup, basics, cmps, pages – הכל מיובא ב-main.css
│  ├─ cmps/                קומפוננטות
│  ├─ pages/               עמודים
│  ├─ routes.js            מפת הראוטים
│  └─ RootCmp.jsx
├─ tests/
│  ├─ api/                 טסטים של ה-API מול DB של Docker
│  └─ web.setup.js
├─ docs/                   מדריכי הקמה ו-pgAdmin
├─ docker/                 סקריפט יצירת DB לטסטים
├─ docker-compose.yml
└─ vercel.json
```
