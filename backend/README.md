# Agriqon Backend

Node + Express + TypeScript API for the Agriqon marketplace.

## Modules

- `auth` - JWT register/login with `USER`, `SELLER`, and `ADMIN` roles
- `items` - product listing CRUD, filtering, pagination, ownership checks
- `orders` - buyer orders and admin status updates
- `reviews` - product reviews and ratings
- `ai` - authenticated semantic-search/RAG placeholder endpoints with AI logs

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/items`
- `POST /api/items` - seller/admin
- `PATCH /api/items/:id` - owner/admin
- `POST /api/orders` - authenticated
- `PATCH /api/orders/:id/status` - admin
- `POST /api/reviews` - authenticated
- `POST /api/ai/search` - authenticated
- `POST /api/ai/chat` - authenticated
