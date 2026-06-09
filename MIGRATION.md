# FoodLink — Option B migration guide

## 1. Backend environment (`backend/.env`)

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_ACCESS_EXPIRES=15m
PORT=5000
FRONTEND_URL=https://your-app.vercel.app

# Photo uploads (required for Photos & Safety page when attaching images)
# 1. Sign up: https://cloudinary.com/users/register_free
# 2. Dashboard → API Keys → copy Cloud name, API Key, API Secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional — email alerts
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FoodLink <noreply@foodlink.app>
```

## 2. Migrate existing Restaurant/NGO users

```bash
cd backend
npm run migrate
```

## 3. Create admin user

```bash
npm run seed:admin
# Default: admin@foodlink.app / admin123
```

## 4. Start servers

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## 5. Frontend env (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

On Vercel, set `VITE_API_URL` to your deployed API URL and add that origin to `FRONTEND_URL` in the backend.

## New API surface

| Area | Base path |
|------|-----------|
| Auth | `/api/auth/*` |
| Listings | `/api/listings/*` |
| Claims | `/api/claims/*` |
| Volunteers | `/api/volunteers/*` |
| Notifications | `/api/notifications` |
| Messages | `/api/messages/*` |
| Impact | `/api/impact/*` |
| Admin | `/api/admin/*` |
| Templates | `/api/templates/*` |

Legacy paths (`/api/restaurants`, `/api/ngos`, `/api/foodlistings`) remain for existing UI flows.

## New frontend routes (same visual style)

- `/ngo/dashboard/browse` — Leaflet map
- `/ngo/dashboard/claims` — claim timeline
- `/restaurant/dashboard/analytics` — impact stats
- `/restaurant/dashboard/photos` — Cloudinary + safety checklist
- `/volunteer/login`, `/volunteer/register`, `/volunteer/dashboard`
- `/profile`, `/admin/analytics`

All HTTP calls go through `frontend/src/services/`.
