# API Reference & Integration Contract — BLITZ Backend

Base URL: `http://localhost:3001`
API Prefix: `/api/v1`
Interactive Swagger Docs: `http://localhost:3001/api/docs`

---

## 1. Response Formats

### Standard Response Envelope
All standard responses are wrapped in a unified structure:
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-11T13:30:00.000Z"
  }
}
```

### Paginated Response Envelope
Endpoints supporting pagination return:
```json
{
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Response Envelope
```json
{
  "statusCode": 400,
  "message": "Event date must be a valid ISO 8601 string",
  "error": "Bad Request",
  "timestamp": "2026-10-11T13:30:00.000Z",
  "path": "/api/v1/events"
}
```

---

## 2. Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates the BLITZ President. Rate-limited to 5 requests/minute.

**Request Body:**
```json
{
  "username": "blitz_president",
  "password": "strong-password-here"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "admin": {
      "id": "e21bcf80-496e-4bb5-a337-b9529ffc3755",
      "username": "blitz_president"
    }
  },
  "meta": { ... }
}
```
*Note: Also sets an HttpOnly cookie named `blitz_token`.*

### `POST /api/v1/auth/logout`
Clears the session cookie.

**Response (200 OK):**
```json
{
  "data": { "message": "Logged out successfully" },
  "meta": { ... }
}
```

### `GET /api/v1/auth/me` *(Protected: Admin only)*
Validates the current session/token and returns admin details.

---

## 3. Image Upload Endpoint

### `POST /api/v1/uploads` *(Protected: Admin only)*
Accepts multipart form upload (`file` key), validates file format (JPEG, PNG, WebP) and size (max 5MB), converts it to optimized WebP via Sharp, and stores it with a collision-resistant UUID filename.

**Request:** `multipart/form-data` with form field `file`.

**Response (201 Created):**
```json
{
  "data": {
    "url": "/uploads/1297a497-647e-4dc7-a809-d9acc9b1f947.webp",
    "filename": "1297a497-647e-4dc7-a809-d9acc9b1f947.webp"
  },
  "meta": { ... }
}
```

---

## 4. Events Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | Public | List events with pagination (`?page=1&limit=10`) and search (`?search=hackathon`) |
| `GET` | `/api/v1/events/:id` | Public | Get event by UUID |
| `POST` | `/api/v1/events` | Admin | Create event |
| `PATCH`| `/api/v1/events/:id` | Admin | Update event |
| `DELETE`| `/api/v1/events/:id` | Admin | Delete event |

**Sample Event Payload:**
```json
{
  "title": "BLITZ Annual Hackathon 2026",
  "description": "24-hour inter-college hackathon focusing on AI and Web3.",
  "date": "2026-11-20T09:00:00.000Z",
  "location": "KMV Campus, Rani Bagh, Delhi",
  "additionalInfo": "Exciting prizes, certificates, and refreshments provided."
}
```

---

## 5. Team Members Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/team` | Public | List team members, optionally filter by tier (`?tier=core`) |
| `GET` | `/api/v1/team/:id` | Public | Get team member by UUID |
| `POST` | `/api/v1/team` | Admin | Create team member |
| `PATCH`| `/api/v1/team/:id` | Admin | Update team member (auto image cleanup on replace) |
| `DELETE`| `/api/v1/team/:id` | Admin | Delete member (detaches from projects, cleans image) |

**Supported Tiers:** `core`, `senior`, `junior`, `volunteer`

**Sample Team Member Payload:**
```json
{
  "name": "Aarav Sharma",
  "position": "Technical Secretary",
  "tier": "core",
  "image": "/uploads/1297a497-647e-4dc7-a809-d9acc9b1f947.webp",
  "bio": "Open-source contributor and full-stack enthusiast.",
  "linkedin": "https://linkedin.com/in/aaravsharma",
  "github": "https://github.com/aaravsharma",
  "instagram": "https://instagram.com/aaravsharma"
}
```

---

## 6. Tags Endpoints (Reusable Labels)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tags` | Public | List all reusable tags, with optional autocomplete search (`?search=rea`) |
| `GET` | `/api/v1/tags/:id` | Public | Get tag by UUID |
| `POST` | `/api/v1/tags` | Admin | Create tag (name is normalized to lowercase and trimmed) |
| `PATCH`| `/api/v1/tags/:id` | Admin | Rename tag |
| `DELETE`| `/api/v1/tags/:id` | Admin | Delete tag (automatically removes tag UUID from all projects) |

**Sample Tag Payload:**
```json
{
  "name": "Machine Learning"
}
```

---

## 7. Projects Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Public | List projects with pagination, tag filter (`?tag=<uuid>`), search (`?search=query`) |
| `GET` | `/api/v1/projects/:id` | Public | Get project by UUID with populated `teamMembers` and `tagDetails` |
| `POST` | `/api/v1/projects` | Admin | Create project with UUID validation |
| `PATCH`| `/api/v1/projects/:id` | Admin | Update project |
| `DELETE`| `/api/v1/projects/:id` | Admin | Delete project |

**Sample Project Payload:**
```json
{
  "name": "BLITZ Society Portal",
  "description": "Comprehensive portal showcasing events, team members, and open-source projects.",
  "image": "/uploads/1297a497-647e-4dc7-a809-d9acc9b1f947.webp",
  "github": "https://github.com/blitz-kmv/portal",
  "liveDemo": "https://blitz-kmv.github.io",
  "team": [
    "e21bcf80-496e-4bb5-a337-b9529ffc3755"
  ],
  "tags": [
    "7989fcaf-4322-4734-82fd-fc8ea747618f"
  ]
}
```

---

## 8. Achievements Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/achievements` | Public | List achievements with pagination and year filter (`?year=2026`) |
| `GET` | `/api/v1/achievements/:id`| Public | Get achievement by UUID |
| `POST` | `/api/v1/achievements` | Admin | Create achievement |
| `PATCH`| `/api/v1/achievements/:id`| Admin | Update achievement |
| `DELETE`| `/api/v1/achievements/:id`| Admin | Delete achievement |

**Sample Achievement Payload:**
```json
{
  "year": 2026,
  "title": "Smart India Hackathon 2026",
  "team": "Team CodeBlitz",
  "event": "Smart India Hackathon (Hardware Edition)",
  "result": "1st Prize (Gold Medal)",
  "image": "/uploads/1297a497-647e-4dc7-a809-d9acc9b1f947.webp"
}
```

---

## 9. Gallery Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/gallery` | Public | List gallery items with pagination |
| `GET` | `/api/v1/gallery/:id` | Public | Get gallery item by UUID |
| `POST` | `/api/v1/gallery` | Admin | Create gallery item |
| `PATCH`| `/api/v1/gallery/:id` | Admin | Update caption or replace image |
| `DELETE`| `/api/v1/gallery/:id` | Admin | Delete gallery item and clean up image |

**Sample Gallery Payload:**
```json
{
  "title": "Annual Department Fest Inauguration",
  "image": "/uploads/1297a497-647e-4dc7-a809-d9acc9b1f947.webp"
}
```
