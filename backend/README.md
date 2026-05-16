# Agriqon Backend

Node + Express + TypeScript API for the Agriqon marketplace.

## Modules

- `auth` - JWT register/login with `USER`, `SELLER`, and `ADMIN` roles
- `items` - product listing CRUD, filtering, pagination, ownership checks
- `orders` - buyer orders and admin status updates
- `reviews` - product reviews and ratings
- `inventory` - multi-warehouse stock management with optimistic locking and WAC valuation
- `ai` - authenticated semantic-search/RAG placeholder endpoints with AI logs

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Products & Inventory
- `GET /api/items`
- `POST /api/items` - seller/admin
- `PATCH /api/items/:id` - owner/admin
- `GET /api/inventory/valuation` - admin/owner (Current inventory value)
- `GET /api/inventory/valuation/history` - admin/owner (Historical snapshots)

### Orders & Reviews
- `POST /api/orders` - authenticated
- `PATCH /api/orders/:id/status` - admin
- `POST /api/reviews` - authenticated

### AI Features
- `POST /api/ai/search` - authenticated
- `POST /api/ai/chat` - authenticated
