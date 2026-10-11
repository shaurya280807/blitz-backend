# Development Log — BLITZ Backend

Chronological log of implementation milestones, architecture decisions, and verification activities.

---

### Phase 1: Environment & Existing Work Inspection
- **Action:** Inspected `c:\Users\SHAURYA GUPTA\OneDrive\Documents\projects\blitz-backend` and verified it is a distinct repository from the frontend.
- **Findings:**
  - 21 existing files created during prior attempt.
  - Dependencies installed in `node_modules`. Node version v24.20.0, npm v11.19.0.
  - Initial `tsconfig.build.json` had a nested `compilerOptions.extends` configuration error preventing clean Nest build.
- **Resolution:** Corrected `tsconfig.build.json` structure to point to `./tsconfig.json` at top-level.

---

### Phase 2: Core Infrastructure Verification
- **Action:** Verified `AdminModule`, `AdminService`, `admin.schema.ts`, `seed-admin.ts`, `DatabaseModule`, `HttpExceptionFilter`, `TransformInterceptor`, `ParseUUIDPipe`, and `JwtAuthGuard`.
- **Findings:**
  - Database schemas adopt RFC4122 v4 UUIDs for `_id` and cleanly map `_id` to `id` in `toJSON()`.
  - Passwords hashed using `bcrypt` (12 rounds).
  - Admin seed script is idempotent and checks `countDocuments()` before insertion.

---

### Phase 3: Image Pipeline & Uploads Module
- **Action:** Implemented `UploadsModule` with `UploadsController` and `UploadsService`.
- **Details:**
  - Added multipart image handler with Sharp conversion to optimized WebP.
  - Configured UUID filename generation.
  - Implemented safe unreferenced image cleanup checking `team_members`, `projects`, `achievements`, and `gallery`.
  - Added path traversal guards using `path.basename` and root boundary verification.

---

### Phase 4: Domain Feature Modules Implementation
- **EventsModule:**
  - Created `Event` schema with proper `Date` storage, `CreateEventDto`, `UpdateEventDto`, `EventsService` (pagination + search), and `EventsController`.
- **TeamModule:**
  - Created `TeamMember` schema with tiers (`core`, `senior`, `junior`, `volunteer`), socials, `TeamService` with referential cleanup in projects and safe image replacement/cleanup, and `TeamController`.
- **TagsModule:**
  - Implemented reusable tags with lowercase normalization, duplicate rejection (HTTP 409), and automatic referential cleanup in `projects` on deletion.
- **ProjectsModule:**
  - Implemented `Project` schema with UUID arrays for `team` and `tags`.
  - Implemented relationship validation ensuring referenced team members and tags exist, deduplicating IDs, and populating responses.
  - Added image cleanup on replacement and deletion.
- **AchievementsModule:**
  - Implemented `Achievement` schema preserving `team` as an editable string, validating `year` number, and supporting image management.
- **GalleryModule:**
  - Implemented `Gallery` schema with UUIDs, photo titles, and safe image deletion.

---

### Phase 5: Application Assembly & Security Configuration
- **Action:** Created `src/app.module.ts` and `src/main.ts`.
- **Configured:**
  - Global API prefix `/api/v1`.
  - Helmet middleware with `crossOriginResourcePolicy: { policy: 'cross-origin' }`.
  - Cookie parser for HttpOnly session cookies.
  - CORS with origin whitelist support.
  - Global `ValidationPipe` with whitelist & forbidNonWhitelisted.
  - Global `HttpExceptionFilter` and `TransformInterceptor`.
  - OpenAPI/Swagger UI at `/api/docs`.
  - ServeStatic for `/uploads`.

---

### Phase 6: Automated Testing & Verification
- **Action:** Implemented unit tests for pipes, DTOs, and services:
  - `parse-uuid.pipe.spec.ts`
  - `create-tag.dto.spec.ts`
  - `create-event.dto.spec.ts`
  - `create-team-member.dto.spec.ts`
  - `create-project.dto.spec.ts`
  - `create-achievement.dto.spec.ts`
  - `login.dto.spec.ts`
  - `auth.service.spec.ts`
  - `tags.service.spec.ts`
- **Results:**
  - All 9 test suites passed (26 tests total).
  - ESLint ran with 0 errors and 0 warnings.
  - `nest build` passed with zero compilation errors.
