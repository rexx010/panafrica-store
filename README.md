# PanAfric Store — Backend API

A pan-African e-commerce backend connecting merchants across Nigeria, Ghana, Kenya, and South Africa with customers anywhere on the continent.

## Live API
https://panafrica-store.onrender.com

## Postman Documentation Link
https://agent-of-christ.postman.co/workspace/agent-of-christ-Workspace~a4574e34-9bc8-4c41-86ad-c664ee3ab814/collection/47880336-4677e4eb-a5af-4d41-9235-b4dda8d08c85?action=share&creator=47880336

## Loom video walk through
https://www.loom.com/share/2061719f9de3434daea46143ea90f0e2

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js — I chose this framework for its minimal footprint and wide adoption in African fintech companies like Paystack and Flutterwave
- **Database**: PostgreSQL hosted on Supabase
- **Auth**: JWT with role-based access control
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Architecture
Modular + Layered architecture with clear separation of concerns:
- **Routes** → URL definitions
- **Controllers** → request/response handling
- **Services** → business logic
- **Repositories** → database queries
- **DTOs** → request validation
- **Models** → data shape

## Setup Instructions

### Prerequisites
- Node.js v20.18.1
- PostgreSQL database (Supabase recommended)
- exchangerate-api.com API key (free tier)

### Installation
```bash
git clone https://github.com/rexx010/panafrica-store.git
cd panafric-store
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:

PORT=3000

DATABASE_URL=your_supabase_connection_string

JWT_SECRET=your_long_random_secret

EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com

EXCHANGE_RATE_API_KEY=your_api_key

### Run Locally
```bash
npm run dev
```

### Run Tests
```bash
npm test
```


## Key Architectural Decisions

### Raw SQL over ORM
I Chose `pg` with raw SQL instead of Prisma because the brief evaluates schema thinking directly. Raw SQL keeps the data model explicit and auditable.

### Zod over Joi
Zod provides cleaner error messages out of the box and aligns better with the required error response shape `{ error, message, field }`.

### Exchange Rate Caching
Rates are cached in PostgreSQL with a 30-minute TTL. The `rate_cache` table serves as both an active cache and a historical audit trail — a finance team can query what rates existed at any point in time.

### Rate Locking at Checkout
The exchange rate is locked at the exact moment `POST /checkout` is called and stored permanently on the order record. This protects both merchants and customers from currency movement after checkout begins.

### Transactions at Checkout
The entire checkout flow (order creation, order items, payout notifications, cart clearing) runs inside a single PostgreSQL transaction. Either everything succeeds or nothing is saved — no partial data.

## Test Results
Run `npm test` to see all 17 tests passing.
