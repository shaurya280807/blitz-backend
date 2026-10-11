# Problems and Solutions — BLITZ Backend

Record of real issues encountered during development, diagnosis, solutions, and transferable lessons learned.

---

### Problem 1: TypeScript compilation failure due to nested `extends` in `tsconfig.build.json`

- **Problem:** Running `npm.cmd run build` produced 46 TypeScript compiler errors (e.g. `TS1240: Unable to resolve signature of property decorator when called as an expression`, `TS1241: Unable to resolve signature of method decorator`).
- **Why it mattered:** The backend failed to compile, preventing builds and development testing.
- **Diagnosis:** `tsconfig.build.json` incorrectly placed the `"extends": "./tsconfig.json"` property inside the `"compilerOptions"` object rather than at the top level of the JSON document. Consequently, `tsc` ignored the base `tsconfig.json` configuration, missing critical compiler options `experimentalDecorators: true` and `emitDecoratorMetadata: true`.
- **Solution:** Moved `"extends": "./tsconfig.json"` to the root level of `tsconfig.build.json`.
- **What I learned:** In TypeScript configuration files, `extends` must always reside at the document root, never inside `compilerOptions`. Without it, decorator metadata required by NestJS will fail compilation.

---

### Problem 2: Jest DTO validation test failure on UUID v4 check

- **Problem:** `projects/dto/create-project.dto.spec.ts` failed with 2 errors in `should accept valid UUID arrays for team and tags`.
- **Why it mattered:** DTO validation tests failed because dummy test UUIDs did not satisfy RFC4122 v4 criteria.
- **Diagnosis:** The test fixture used arbitrary UUID strings (`123e4567-e89b-12d3-a456-426614174000` and `a12b34cd-56ef-7890-abcd-ef1234567890`). Because `CreateProjectDto` uses `@IsUUID('4', { each: true })`, class-validator's underlying validator strictly checks that the version nibble is `4` and the variant bits conform to RFC4122 variant 1 (`[89ab]`). The second test string had version nibble `5` and variant `a`, but was not a genuine v4 UUID.
- **Solution:** Replaced test UUIDs with RFC4122-compliant v4 UUIDs generated via `uuidv4()` (`abacf6a1-9b24-4fa4-a4b4-fc387093eb4c` and `7989fcaf-4322-4734-82fd-fc8ea747618f`).
- **What I learned:** When configuring `@IsUUID('4')`, validator engines strictly inspect the version digit and variant bits according to RFC4122. Test fixtures must use genuine v4 UUIDs.

---

### Problem 3: Mongoose duplicate index warning on Tag schema

- **Problem:** Running tests output `[MONGOOSE] Warning: Duplicate schema index on {"name":1} found.`
- **Why it mattered:** Defining redundant indexes generates runtime warnings, slows indexing operations, and increases MongoDB memory overhead.
- **Diagnosis:** In `tag.schema.ts`, `@Prop({ unique: true })` already instructed Mongoose to build a unique index on `name`. In addition, `TagSchema.index({ name: 1 }, { unique: true })` was explicitly appended at the bottom of the file.
- **Solution:** Removed the explicit `TagSchema.index()` call, relying on the schema property decorator `unique: true`.
- **What I learned:** In NestJS Mongoose schemas, `@Prop({ unique: true })` automatically registers the index with Mongoose. Adding a manual `Schema.index()` on the same field creates duplicate index specifications.

---

### Problem 4: ESLint unused variable error on `IsUrl`

- **Problem:** `npm.cmd run lint` failed with `1:52 error 'IsUrl' is defined but never used @typescript-eslint/no-unused-vars`.
- **Why it mattered:** CI/CD pipelines and linters fail on unused symbols, breaking clean build certification.
- **Diagnosis:** `IsUrl` was imported in `create-team-member.dto.ts` during initial drafting, but social links were made optional strings with `@IsString()` and `@IsOptional()`.
- **Solution:** Removed the unused `IsUrl` import from `create-team-member.dto.ts`.
- **What I learned:** Always run automated linting (`eslint --fix`) after implementing DTOs to catch leftover imports.
