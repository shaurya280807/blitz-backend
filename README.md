# BLITZ Backend — Departmental Coding Society API

The official backend API for **BLITZ**, the Department of Computer Science departmental coding society at **Keshav Mahavidyalaya, University of Delhi**.

This backend provides a secure, high-performance, frontend-agnostic REST API for public content retrieval and authenticated content management for the society website.

---

## 1. Technology Stack

* **Runtime**: Node.js (v18+)
* **Framework**: [NestJS](https://nestjs.com/) (Express platform)
* **Language**: TypeScript
* **Database**: MongoDB via [Mongoose](https://mongoosejs.com/)
* **Identifier Strategy**: Consistent UUID v4 primary keys across all schemas and APIs
* **Authentication**: Stateless JWT + bcrypt (12 salt rounds) via `HttpOnly` cookies & Bearer headers
* **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (converting uploads to optimized WebP)
* **Validation**: `class-validator`, `class-transformer`, `joi`
* **API Documentation**: OpenAPI / Swagger (`/api/docs`)
* **Testing**: Jest unit and integration tests

---

## 2. Prerequisites

* **Node.js**: v18.0.0 or higher (Tested on v24.20.0)
* **npm**: v9.0.0 or higher
* **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017/blitz`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.

---

## 3. Installation & Setup

### 3.1 Clone & Navigate
```powershell
cd "C:\Users\SHAURYA GUPTA\OneDrive\Documents\projects\blitz-backend"
```

### 3.2 Install Dependencies
```powershell
npm install
```
*(If PowerShell execution policy blocks npm, use `npm.cmd install`)*

### 3.3 Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your actual settings:
```ini
# Application
NODE_ENV=development
PORT=3001

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/blitz
# Atlas Example:
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/blitz?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=replace-this-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRATION=24h

# Administrator Provisioning
ADMIN_USERNAME=blitz_admin
ADMIN_PASSWORD=your-secure-president-password

# Allowed Frontend Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5500

# Local Uploads Directory
UPLOADS_DIR=uploads
```

---

## 4. Provisioning the President Account

The system supports exactly one administrator representing the BLITZ President. There is no public registration endpoint.

Run the secure seeding script to create the initial account:
```powershell
npm run seed:admin
```
*Note: This script is idempotent. If an admin already exists, it will safely skip without overwriting or resetting the existing password.*

---

## 5. Running the Application

### Development Mode (with hot-reload)
```powershell
npm run start:dev
```

### Production Build & Run
```powershell
npm run build
npm run start:prod
```

Once running:
* **API Root**: `http://localhost:3001/api/v1`
* **Interactive Swagger UI**: `http://localhost:3001/api/docs`
* **Health Check**: `http://localhost:3001/api/v1/health`

---

## 6. Running Tests & Quality Checks

```powershell
# Run Jest automated test suites
npm test

# Run ESLint check
npm run lint

# Check TypeScript compiler without emitting
npx tsc --noEmit
```

---

## 7. Project Documentation Sitemap

Detailed documentation is available in the repository root:
* [ARCHITECTURE.md](file:///./ARCHITECTURE.md): Module layout, request lifecycle, and security design.
* [DATABASE.md](file:///./DATABASE.md): Collections, fields, UUID strategy, relationships, and deletion rules.
* [API.md](file:///./API.md): Endpoint reference, request/response payloads, and upload workflows.
* [AUTHENTICATION.md](file:///./AUTHENTICATION.md): JWT strategy, cookie configuration, and account recovery.
* [DEVELOPMENT_LOG.md](file:///./DEVELOPMENT_LOG.md): Milestones, decisions, and verification records.
* [PROBLEMS_AND_SOLUTIONS.md](file:///./PROBLEMS_AND_SOLUTIONS.md): Problems encountered and their solutions.

---

## 8. Frontend Integration Summary

The separately maintained BLITZ frontend (`blitz website`) connects to this backend over HTTP:
1. **Base URL**: Configure your frontend fetch calls to `http://localhost:3001/api/v1`.
2. **Public Content**:
   * Events: `GET /events`
   * Team: `GET /team-members`
   * Projects: `GET /projects`
   * Achievements: `GET /achievements`
   * Gallery: `GET /gallery`
3. **Image Display**:
   * Image paths are returned as relative URLs (e.g. `/uploads/3b1a...webp`).
   * Prepend the backend origin to display images: `http://localhost:3001/uploads/3b1a...webp`.
4. **Admin Actions**:
   * Send credentials to `POST /auth/login`.
   * For browser sessions with `credentials: 'include'`, the `blitz_token` cookie is automatically handled.
   * Alternatively, send the returned token in the `Authorization: Bearer <token>` header for all write requests.
