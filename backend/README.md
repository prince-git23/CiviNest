# CiviNest Backend

Node.js/Express backend API for the CiviNest civic intelligence platform.

## Setup

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `JWT_EXPIRES_IN` — Token expiration (default: 7d)
- `FRONTEND_URL` — Frontend URL for CORS (default: http://localhost:3000)

## Running

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

Backend runs on `http://localhost:5000` by default.

## API Endpoints

### Health
```
GET /api/health
```

### Authentication
```
POST /api/auth/register    — Create new account
POST /api/auth/login       — Sign in
GET  /api/auth/me          — Get authenticated user (requires Bearer token)
PUT  /api/auth/profile     — Update user profile (requires Bearer token)
POST /api/auth/logout      — Sign out (requires Bearer token)
```

### Request/Response Format

All responses follow:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Or on error:
```json
{
  "success": false,
  "error": "Error message"
}
```

### User Roles
- `CITIZEN` — Default role for residents
- `MUNICIPAL_OFFICER` — Municipal government staff
- `COMMUNITY_REPRESENTATIVE` — Community/RWA representatives
- `ADMIN` — System administrators

### Frontend Integration

The frontend connects to the backend at `http://localhost:5000/api` via `src/services/api.ts`.

Authentication tokens are stored in `localStorage` as `civinest_token`.
