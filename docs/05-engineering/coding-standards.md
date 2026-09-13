# Coding standards — Open Clinical Record

**Audience:** internship team  
**Scope:** backend (ASP.NET Core) and frontend (React + TypeScript)

## Principles

1. Prefer clarity over cleverness.
2. Match the approved UI mocks for layout and tokens.
3. Keep secrets out of source control (env vars / user secrets).
4. Ship small, reviewable commits (`feat:`, `fix:`, `docs:`, `ci:`).

## Backend (C# / ASP.NET Core)

- Target **.NET 8**.
- Controllers stay thin; validation on DTOs with data annotations.
- Use **async** end-to-end for I/O.
- Authorization: prefer **policy names** (`AdminOnly`, `ClinicalStaff`) over ad-hoc role checks.
- Entities live under `Models/Entities`; DTOs under `DTOs/{Area}`.
- Never log passwords, JWTs, or full connection strings.
- EF migrations are required for schema changes; do not rely on `EnsureCreated` in production.

### Naming

| Kind | Convention |
|------|------------|
| Types | `PascalCase` |
| Methods / properties | `PascalCase` |
| Locals / parameters | `camelCase` |
| Interfaces | `I` prefix (`IJwtTokenService`) |

### HTTP

- `2xx` success, `400` validation, `401` unauthenticated, `403` forbidden, `404` missing resource.
- Return problem details / clear `{ message }` for client errors.

## Frontend (React + TypeScript)

- Functional components only.
- Strict TypeScript; avoid `any`.
- Route pages under `pages/`; shared UI under `components/`; API calls under `services/`.
- Design tokens via CSS variables in `index.css` (teal `#3ddc97`, surfaces from mocks).
- Auth token only in `localStorage` keys managed by `authStorage`; send `Authorization: Bearer` from API helpers.
- No business logic in layout components beyond navigation chrome.

## Git & CI

- Branch from `main`; open PRs for non-trivial work.
- CI must **pass** (`dotnet build` / `dotnet test`, `npm run build`) before merge.
- After adding an npm package: run `npm install` locally and commit `package-lock.json` when present.

## What not to do

- Do not commit `bin/`, `obj/`, `node_modules/`, or real secrets.
- Do not change stack (Postgres, ASP.NET Core, React) without team agreement.
- Do not implement patient clinical workflows without matching API contracts and UI mocks.
