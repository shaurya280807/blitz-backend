# Authentication & Security Model — BLITZ Backend

This document details the authentication design, session lifecycle, administrator provisioning, and defense-in-depth security measures implemented in the BLITZ backend.

---

## 1. Single-President Administrator Model

As specified in the core requirements:
- Exactly **one authorized administrator** exists in the system (the BLITZ President).
- There is **no public registration or sign-up endpoint**.
- There is **no role hierarchy, multi-tenancy, or RBAC system**.
- Public clients cannot create administrative users.
- Administrator passwords are never stored in plaintext and password hashes are never exposed.

---

## 2. Authentication Strategy & Session Handling

The backend implements a **Dual-Transport JWT (JSON Web Token)** authentication system:

### 2.1 Login Flow
1. The administrator sends credentials to `POST /api/v1/auth/login`.
2. The endpoint is rate-limited via `@nestjs/throttler` (max 5 requests per minute per IP).
3. The password is verified against the salted bcrypt hash (cost factor 12).
4. Upon successful verification:
   - A signed JWT token is generated (`sub`: admin UUID, `username`: admin username).
   - An **`HttpOnly` cookie** named `blitz_token` is set with `SameSite=Lax` (or `Strict` in production) and `Secure` flag.
   - The token is also returned in the JSON response body (`accessToken`).
5. The administrator can authenticate subsequent requests using either:
   - The browser-managed `blitz_token` cookie (recommended for browser clients to prevent XSS exfiltration).
   - The standard HTTP header `Authorization: Bearer <accessToken>`.

### 2.2 Logout Flow
The administrator calls `POST /api/v1/auth/logout`.
The server clears the `blitz_token` cookie with matching scope and domain settings.

### 2.3 Status Inspection Flow
The administrator calls `GET /api/v1/auth/me`.
The `JwtAuthGuard` extracts the token, checks signature and expiry, fetches the administrator identity, and returns `{ "id": "...", "username": "..." }`.

---

## 3. Provisioning the President Account

The administrator account is seeded using a dedicated CLI script rather than an HTTP endpoint or automatic startup side-effect:

```powershell
npm.cmd run seed:admin
```

### Safety Guarantees:
1. **Idempotence:** The script checks whether an administrator account already exists. If one exists, it logs a notice and terminates immediately without modifying existing credentials.
2. **Environment Controlled:** The script reads `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`.
3. **No Hardcoded Defaults:** The script validates that `ADMIN_PASSWORD` has been changed from the placeholder value before proceeding.

---

## 4. Defense-in-Depth Protections

1. **Helmet HTTP Headers:** Configures secure HTTP headers including `X-Frame-Options`, `X-Content-Type-Options`, and `Cross-Origin-Resource-Policy`.
2. **CORS Restrictions:** Only origins explicitly configured in `CORS_ORIGINS` (e.g. `http://localhost:3000,http://localhost:5500`) are allowed to send cross-origin requests.
3. **Rate Limiting:** Protects the authentication endpoint from dictionary attacks and brute-forcing.
4. **Input Whitelisting:** NestJS `ValidationPipe` operates with `whitelist: true` and `forbidNonWhitelisted: true`, preventing parameter injection or malicious mass assignment.
5. **Path Traversal Protection:** The upload service validates file names using `path.basename` and asserts that target paths are strictly children of the configured `UPLOADS_DIR`.
