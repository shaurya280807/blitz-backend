# System Architecture — BLITZ Backend

This document details the architecture, design choices, data flow, and modular organization of the BLITZ backend.

---

## 1. Architectural Overview

The BLITZ backend follows a **Modular Layered Architecture** powered by the **NestJS** framework. It enforces a strict separation of concerns between HTTP transport, business logic, persistence, and external filesystem interaction.

```
+-------------------------------------------------------------+
|                     Client / Browser                        |
+-------------------------------------------------------------+
                              |
                              v  (HTTP / JSON & Multipart)
+-------------------------------------------------------------+
|                     Security & Middleware                   |
|   - Helmet (Security headers)                               |
|   - CORS Origin Whitelist                                   |
|   - CookieParser                                            |
|   - Global Rate Limiting (@nestjs/throttler)                |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     NestJS Pipeline                         |
|   - Global Prefix: /api/v1                                  |
|   - Global HttpExceptionFilter (Standardized error envelope)|
|   - Global TransformInterceptor (Standardized response meta)|
|   - Global ValidationPipe (Strict DTO whitelist)            |
|   - JwtAuthGuard & Passport-JWT (Route-level protection)    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      Controllers Layer                      |
|   - EventsController                                        |
|   - TeamController                                          |
|   - ProjectsController                                      |
|   - TagsController                                          |
|   - AchievementsController                                  |
|   - GalleryController                                       |
|   - UploadsController                                       |
|   - AuthController                                          |
|   - HealthController                                        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                       Services Layer                        |
|   - Business rules & input transformation                   |
|   - Relationship validation & deduplication                 |
|   - Referential integrity cleanup                           |
|   - Image processing pipeline (Sharp WebP)                  |
|   - Password verification & token issuance                  |
+-------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------+                 +---------------------+
| Mongoose Schema Layer |                 | Uploads Service     |
| (MongoDB Collections) |                 | (Persistent Storage)|
+-----------------------+                 +---------------------+
```

---

## 2. Core Modules

| Module | Scope & Responsibility |
| :--- | :--- |
| **ConfigModule** | Global environment variable loading and strict Joi validation at startup. |
| **DatabaseModule** | Asynchronous connection to MongoDB using Mongoose 8. |
| **AuthModule** | Issues JWTs upon valid admin credentials, verifies tokens from Authorization headers and cookies, provides `/api/v1/auth/login`, `/logout`, `/me`. |
| **AdminModule** | Persists single-admin records with bcrypt password hashing; supplies `seed-admin.ts` CLI script. |
| **EventsModule** | Public listing/detail and admin CRUD for events with proper Date storage and search. |
| **TeamModule** | Manages society members categorized into 4 tiers (`core`, `senior`, `junior`, `volunteer`), socials, and profile images. |
| **ProjectsModule** | Manages showcase projects; validates and establishes UUID relationships with `team_members` and `tags`. |
| **TagsModule** | Manages reusable project labels; normalizes tag names (lowercase trimmed), prevents duplicates, and safely detaches from projects on deletion. |
| **AchievementsModule**| Manages society competition achievements with editable string team and year filtering. |
| **GalleryModule** | Manages photo highlights with stable UUIDs and image upload/deletion lifecycle. |
| **UploadsModule** | Handles multipart file uploads, converts to WebP with Sharp, generates UUID filenames, and provides safe unreferenced image cleanup. |
| **HealthModule** | Provides a health check endpoint for deployment probes at `/api/v1/health`. |

---

## 3. Important Design Decisions

### 3.1 Primary Identifier Strategy (RFC4122 v4 UUIDs)
- MongoDB's default 12-byte hex `ObjectId` is replaced directly on the `_id` field with a v4 UUID string (`_id: { type: String, default: () => uuidv4() }`).
- In JSON serialization, Mongoose schemas map `_id` to `id` and remove `_id` and `__v`.
- This ensures absolute consistency: URLs use UUIDs (`/api/v1/events/:id`), database references use UUIDs, and API responses return UUIDs as `id`.

### 3.2 Dual Authentication Transport
- To support both traditional client-side JavaScript applications and secure modern browser clients, the JWT strategy extracts authentication tokens from two sources:
  1. `request.cookies.blitz_token` (HttpOnly, SameSite, Secure cookie).
  2. `Authorization: Bearer <token>` header.
- This prevents XSS attacks from accessing credentials in localStorage while maintaining developer flexibility during frontend development.

### 3.3 Safe Image Processing & Lifecycle
- Rather than storing image binaries in MongoDB (which bloats database memory and impairs query performance), images are stored as optimized **WebP** files on disk and referenced via URL path (e.g., `/uploads/<uuid>.webp`).
- **Replacement flow:** When an image is updated on an entity, the new image is validated and saved first. The database record is updated next. Only after the database update succeeds is the previous image deleted — and only if it is no longer referenced by any other record.
- **Path Traversal Guard:** Any delete operation resolves file paths strictly within `uploadsDir` using `path.basename` and bounds verification.

### 3.4 Referential Integrity Cleanup
- In a document database without foreign key cascades, application logic maintains referential integrity:
  - When a `Tag` is deleted, `projects` are automatically updated via `$pull: { tags: tagId }`.
  - When a `TeamMember` is deleted, `projects` are automatically updated via `$pull: { team: memberId }`.
  - When creating or updating a `Project`, team member and tag IDs are checked against existing documents in the database and deduplicated.
