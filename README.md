# 🍽️ Restaurant API

A RESTful API for managing restaurants and menu items, built with **Hono**, **Bun**, **Prisma**, and **MySQL**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) v1.x |
| Framework | [Hono](https://hono.dev) |
| ORM | [Prisma](https://www.prisma.io) |
| Database | MySQL 8+ |
| Validation | [Zod](https://zod.dev) |
| Auth | JWT (via `hono/jwt`) |
| Testing | Bun Test (built-in) |
| Language | TypeScript |

---

## Requirements

- Bun >= 1.0
- Node.js >= 20 (for Prisma CLI compatibility)
- MySQL 8+

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone https://github.com/your-username/restaurant-api.git
cd restaurant-api
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/restaurant_db?allowPublicKeyRetrieval=true&ssl=false"
PORT=3000
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN=86400
```

> **Note:** If using MySQL 8+, add `allowPublicKeyRetrieval=true&ssl=false` to avoid RSA auth errors. Alternatively, run `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';` in MySQL.

### 3. Setup database

```bash
# Run migrations + generate Prisma client + seed data
bun run setup
```

Or step by step:

```bash
bun run db:generate   # Generate Prisma client
bun run db:migrate    # Run migrations
bun run db:seed       # Seed initial data (2 restaurants, 5 menu items each)
```

### 4. Run the server

```bash
# Development (hot reload)
bun run dev

# Production
bun run start
```

Server running at `http://localhost:3000`

---

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server with hot reload |
| `bun run start` | Start production server |
| `bun run setup` | Full setup: install → generate → migrate → seed |
| `bun run db:migrate` | Run pending migrations (dev) |
| `bun run db:migrate:prod` | Deploy migrations (production/CI) |
| `bun run db:reset` | Drop all tables, re-migrate, re-seed |
| `bun run db:seed` | Seed initial data |
| `bun run db:studio` | Open Prisma Studio in browser |
| `bun run db:generate` | Regenerate Prisma client after schema changes |
| `bun run db:push` | Push schema directly (no migration file, prototyping only) |
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `bun run lint` | TypeScript type-check |

---

## Project Structure

```
restaurant-api/
├── prisma/
│   ├── schema.prisma          # Database schema & models
│   ├── seed.ts                # Seed script (2 restaurants, 10 menu items)
│   └── migrations/            # Auto-generated migration files
├── src/
│   ├── index.ts               # App entry point, route registration
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── jwt.ts             # JWT sign & verify helpers
│   │   ├── hash.ts            # Password hash & verify (Bun built-in)
│   │   └── response.ts        # Standardized response helpers
│   ├── routes/
│   │   └── v1/
│   │       ├── auth.route.ts
│   │       ├── restaurant.route.ts
│   │       └── menuItem.route.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── restaurant.controller.ts
│   │   └── menuItem.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── restaurant.service.ts
│   │   └── menuItem.service.ts
│   ├── repositories/
│   │   ├── auth.repository.ts
│   │   ├── restaurant.repository.ts
│   │   └── menuItem.repository.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── restaurant.validator.ts
│   │   └── menuItem.validator.ts
│   ├── middlewares/
│   │   ├── auth.ts            # JWT auth middleware
│   │   └── errorHandler.ts    # Global error handler + AppError class
│   └── tests/
│       ├── auth.test.ts
│       ├── restaurant.test.ts
│       └── menuItem.test.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Architecture & Design Decisions

### Layered Architecture (Repository Pattern)

The project follows a strict 4-layer architecture to separate concerns and keep each layer focused on a single responsibility:

```
Request → Route → Controller → Service → Repository → Database
```

| Layer | Responsibility |
|---|---|
| **Route** | Define HTTP method + path, apply middleware, delegate to controller |
| **Controller** | Parse request (params, body, query), validate input with Zod, call service, return response |
| **Service** | Business logic, orchestration, throws `AppError` for domain errors |
| **Repository** | All Prisma queries, no business logic, pure data access |

**Why this pattern?**
- Each layer can be tested independently
- Swapping the database (e.g. Prisma → Drizzle) only requires changes in the repository layer
- Business logic stays in services, not scattered across controllers or routes

---

### Centralized Error Handling

All errors are handled in one place via `app.onError()` in `src/index.ts`. Services throw `AppError` with a status code, and the handler converts it to a consistent JSON response.

```typescript
// Services throw domain errors:
throw new AppError(404, "Restaurant with id 1 not found");

// Handler catches and formats:
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.statusCode);
  }
  return c.json({ success: false, message: "Internal server error" }, 500);
});
```

Controllers never need `try/catch` — errors bubble up automatically.

---

### Consistent Response Shape

All API responses follow a single structure via helper functions in `src/lib/response.ts`:

```json
// Success (200)
{ "success": true, "message": "...", "data": { } }

// Created (201)
{ "success": true, "message": "...", "data": { } }

// Error (4xx / 5xx)
{ "success": false, "message": "...", "errors": { } }
```

---

### Input Validation with Zod

Validation happens at the **controller layer** using Zod schemas defined in `src/validators/`. Schema types are inferred and passed as typed DTOs to services and repositories — no `any` types in the data flow.

```typescript
const parsed = createRestaurantSchema.safeParse(body);
if (!parsed.success) {
  return sendError(c, 400, "Validation failed", parsed.error.flatten().fieldErrors);
}
await restaurantService.create(parsed.data); // fully typed DTO
```

---

### JWT Authentication

Protected routes use a `authMiddleware` that validates the Bearer token and attaches the payload to the Hono context. The JWT is signed with `HS256` and expires in 24 hours (configurable via `JWT_EXPIRES_IN`).

```
POST /auth/login → returns JWT token
Authorization: Bearer <token> → required for all other endpoints
```

Passwords are hashed using `Bun.password.hash()` (bcrypt under the hood, built into Bun — no `bcrypt` dependency needed).

---

### Pagination & Search

List endpoints support pagination and search out of the box:

- `page` + `limit` query params for pagination
- `search` param for full-text search across multiple columns using Prisma `OR` + `contains`
- Menu items additionally support filtering by `category` and `name`

The response always includes a `meta` object:

```json
"meta": {
  "total": 20,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### API Versioning

Routes are versioned via Hono's `basePath` and separate route files under `src/routes/v1/`. Adding v2 only requires a new `src/routes/v2/` directory and mounting it in `src/index.ts` — no changes to existing v1 routes.

```typescript
app.route("/api/v1", v1);
app.route("/api/v2", v2); // future
```

---

### Database: Cascade Delete

Deleting a `Restaurant` automatically deletes all its `MenuItem` records via Prisma's `onDelete: Cascade`. This is enforced at the database level, not just application level.

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

All endpoints except `/auth/*` require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT token |

### Restaurants

| Method | Endpoint | Description |
|---|---|---|
| GET | `/restaurants` | List all (pagination + search) |
| POST | `/restaurants` | Create a restaurant |
| GET | `/restaurants/:id` | Get detail with menu items |
| PUT | `/restaurants/:id` | Update (partial) |
| DELETE | `/restaurants/:id` | Delete (cascades to menu items) |

### Menu Items

| Method | Endpoint | Description |
|---|---|---|
| GET | `/restaurants/:id/menu_items` | List items (filter by category, name, pagination) |
| POST | `/restaurants/:id/menu_items` | Add a menu item |
| PUT | `/menu_items/:id` | Update a menu item (partial) |
| DELETE | `/menu_items/:id` | Delete a menu item |

Full API documentation: open `api-doc.html` in a browser.

---

## Running Tests

Tests are written with Bun's built-in test runner. They are **integration tests** — they run against a real MySQL database.

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# Specific file
bun test src/tests/auth.test.ts
```

Test isolation strategy:
- All test data uses a `Test` prefix (e.g. `"Test Warung"`, `"test_user"`)
- `beforeEach` clears test data before every test
- `afterAll` cleans up remaining test data after the suite

> **Note:** Tests run against the same database as development. A separate `TEST_DATABASE_URL` in `.env` is recommended for CI environments.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | - | MySQL connection string |
| `PORT` | ❌ | `3000` | Server port |
| `JWT_SECRET` | ✅ | - | Secret key for signing JWT |
| `JWT_EXPIRES_IN` | ❌ | `86400` | Token expiry in seconds (24h) |

---

## Docker (MySQL only)

If you don't have MySQL installed locally, use Docker:

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: restaurant_db
    ports:
      - "3306:3306"
```

```bash
docker compose up -d
```

---

## License

MIT
