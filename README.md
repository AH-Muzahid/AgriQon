# Agriqon

Agriqon is split into two independent apps:

```text
agriqon/
  frontend/   Next.js marketplace UI
  backend/    Express + Prisma API
```

## Commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

From the repo root:

```bash
npm run build:frontend
npm run build:backend
npm run lint:frontend
```
