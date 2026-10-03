# 4.17 Deployment and Environment

## 4.17.1 Purpose

Deployment engineering describes how the implemented application is configured, started, tested, and moved between development environments. For an internship MVP, the objective was reproducibility and clear environment separation rather than a full production infrastructure platform.

## 4.17.2 Runtime topology

The implemented application has three main runtime components:

| Component | Role |
|---|---|
| Browser frontend | React/Vite/TypeScript application |
| ASP.NET Core API | REST API, authentication, authorization, workflow |
| PostgreSQL | Persistent relational database |

The browser communicates with the API over HTTP/JSON. The API communicates with PostgreSQL through EF Core and Npgsql.

## 4.17.3 Development environment

The documented local workflow starts the API and frontend separately.

Backend development uses ASP.NET Core 8 and can be launched with the project's HTTP launch profile.

Frontend development uses Node/npm and Vite.

PostgreSQL provides the development persistence environment used for manual end-to-end verification.

## 4.17.4 Configuration

The frontend uses VITE_API_BASE_URL to determine the API base address. This keeps environment-specific server addresses outside application business logic.

Backend configuration includes database connection information and JWT-related settings through the application's configuration/environment mechanisms.

This separation is important because development and deployment environments should not require source-code modifications simply to change infrastructure addresses or secrets.

## 4.17.5 Database migrations

EF Core migrations are the authoritative mechanism for schema evolution.

A deployment process must therefore account for applying the correct migrations to the target database. The repository also contains reference SQL, but project documentation warns that it may lag behind migrations.

This distinction prevents an outdated SQL snapshot from being mistaken for the current schema.

## 4.17.6 Health and readiness

The API includes health and readiness endpoints. These provide a basic mechanism for determining whether the backend is reachable and ready.

Although simple, health endpoints are useful in deployment environments because process availability and application readiness are different operational questions.

## 4.17.7 CI pipeline

GitHub Actions provides automated checks on pushes to the main branch.

The documented pipeline includes:

- backend automated tests;
- frontend TypeScript/type checking;
- frontend production build.

This creates a repeatable minimum verification process before changes are considered healthy.

## 4.17.8 Deployment boundary

The internship project should not be described as having a fully automated production deployment pipeline. The documented implementation establishes development execution and CI verification rather than a complete hospital-grade deployment platform.

A future production deployment would need infrastructure provisioning, TLS, managed secrets, database backup/recovery, monitoring, centralized logging, scaling, access controls, and disaster-recovery procedures.

## 4.17.9 Environment risks

Several environment-related risks were identified:

- development credentials must not be reused in production;
- connection strings and JWT secrets must be protected;
- database migrations must match application expectations;
- frontend and backend origins must be configured consistently;
- PostgreSQL behavior should be included in final integration verification.

These are practical deployment concerns rather than purely theoretical security issues.

## 4.17.10 Engineering lesson

Deployment became easier to reason about when configuration was separated from application logic. The project also reinforced that “it runs on my machine” is not enough evidence: build checks, migrations, environment configuration, and integration testing all contribute to reproducibility.
