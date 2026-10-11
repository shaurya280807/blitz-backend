# Database Design & Modeling — BLITZ Backend

This document details MongoDB collections, schemas, indexes, relationship semantics, deletion behaviors, and the UUID strategy implemented in the BLITZ backend.

---

## 1. Primary Identifier & UUID Strategy

Every collection uses **RFC4122 v4 UUIDs** as the primary `_id` field.

```typescript
_id: { type: String, default: () => uuidv4() }
```

### Response Transformation
Every schema defines a Mongoose `toJSON` transform:
```typescript
toJSON: {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
}
```
**Benefits:**
- The public API consistently uses `id` (e.g. `c0326bc4-3b17-48f5-a0cf-7f551720d2d3`).
- No dual-ID confusion between MongoDB `ObjectId` and a secondary UUID.
- Route parameters are validated with `ParseUUIDPipe`.

---

## 2. Collections & Schemas

### 2.1 `events`
Represents society workshops, competitions, orientation sessions, and bootcamps.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `title` | String | Yes | Event title (trimmed) |
| `description` | String | Yes | Full description |
| `date` | Date | Yes | Canonical event Date (indexed) |
| `location` | String | Yes | Physical or virtual location |
| `additionalInfo`| String | No | Registration details, links, prerequisites |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ date: 1 }` (Ascending for date-based queries)

---

### 2.2 `team_members`
Represents current and past BLITZ executive committee and student members.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `name` | String | Yes | Full name |
| `position` | String | Yes | Designation (e.g., President, Tech Lead) |
| `tier` | String (Enum) | Yes | Member tier: `core`, `senior`, `junior`, `volunteer` |
| `image` | String | No | Public path to WebP image (e.g., `/uploads/<uuid>.webp`) |
| `bio` | String | No | Short biography |
| `linkedin` | String | No | LinkedIn profile URL |
| `github` | String | No | GitHub profile URL |
| `instagram` | String | No | Instagram profile URL |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ tier: 1 }`
- `{ name: 1 }`

---

### 2.3 `tags`
Reusable labels applied exclusively to projects (e.g. `web`, `machine-learning`, `flutter`).

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `name` | String | Yes | Unique normalized tag name (lowercase, trimmed) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ name: 1 }` (Unique constraint)

**Normalization Rule:**
Before persisting or querying, tag names are automatically converted to lowercase and trimmed. Duplicates are rejected with HTTP 409 Conflict.

---

### 2.4 `projects`
Showcase of applications, websites, and open-source tools developed by the society.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `name` | String | Yes | Project title |
| `description` | String | Yes | Project overview |
| `image` | String | No | Public path to WebP preview image |
| `github` | String | No | Repository URL |
| `liveDemo` | String | No | Live preview / deployment URL |
| `team` | Array of UUIDs | Yes | References to `team_members` |
| `tags` | Array of UUIDs | Yes | References to `tags` |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ name: 1 }`
- `{ tags: 1 }`
- `{ team: 1 }`

**Relationship Semantics:**
- Each project can reference 0 or more team members.
- Each project can reference 0 or more reusable tags.
- The service validates that every referenced UUID exists and deduplicates them before saving.
- The API response returns both the raw UUID arrays (`team`, `tags`) and populated objects (`teamMembers`, `tagDetails`) for frontend display.

---

### 2.5 `achievements`
Awards, hackathon placements, and honors received by society members.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `year` | Number | Yes | Competition year (e.g. 2026) |
| `title` | String | Yes | Achievement title |
| `team` | String | Yes | **Editable string** (e.g., "Team Blitz Byte") — NOT linked to team_members |
| `event` | String | Yes | Event or hackathon name |
| `result` | String | Yes | Result/position (e.g., "1st Runner Up") |
| `image` | String | No | Public path to WebP trophy/certificate image |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ year: -1 }`
- `{ title: 1 }`

> **Note on `team` field:** As agreed in requirements, `team` in achievements is maintained as an editable string and deliberately not related to `team_members` documents.

---

### 2.6 `gallery`
Highlights, ceremony photos, and event snapshots.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `image` | String | Yes | Public path to WebP photo |
| `title` | String | Yes | Photo title / caption |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ createdAt: -1 }`

> **Note on gallery relations:** Gallery items have no event relationships; each item is a standalone showcase document with a stable UUID.

---

### 2.7 `admins`
Stores the single authorized administrator account representing the BLITZ President.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Yes | Primary key |
| `username` | String | Yes | Administrator username (unique) |
| `passwordHash`| String | Yes | bcrypt hashed password (never exposed) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `{ username: 1 }` (Unique constraint)

---

## 3. Referential Integrity & Deletion Strategy

1. **Tag Deletion:**
   When an administrator deletes a tag via `DELETE /api/v1/tags/:id`:
   - The tag document is removed from `tags`.
   - The system executes `projects.updateMany({ tags: id }, { $pull: { tags: id } })`.
   - Existing projects remain intact, with the deleted tag cleanly detached.

2. **Team Member Deletion:**
   When an administrator deletes a team member via `DELETE /api/v1/team/:id`:
   - The team member document is removed from `team_members`.
   - The system executes `projects.updateMany({ team: id }, { $pull: { team: id } })`.
   - Existing projects remain intact with the deleted member safely detached.
   - The member's profile image is safely cleaned up from disk if no other record references it.

3. **Safe Image Cleanup:**
   Before deleting any image file from disk, the system queries `team_members`, `projects`, `achievements`, and `gallery` to guarantee the image is not shared by another document.
