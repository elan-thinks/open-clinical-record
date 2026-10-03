# 5.2 Development Environment and Repository Setup

## 5.2.1 Development Environment

The implementation was developed using a modern web application stack centered on C#/.NET for the backend and React/TypeScript for the frontend. PostgreSQL was selected as the persistence engine and accessed through Entity Framework Core with the Npgsql provider.

The major technologies used were:

| Area | Technology |
|---|---|
| Backend | ASP.NET Core 8 |
| Language | C# |
| Frontend | React 19 |
| Frontend language | TypeScript |
| Build tooling | Vite 8 |
| Routing | React Router 7 |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL |
| PostgreSQL provider | Npgsql |
| Authentication | ASP.NET Core Identity + JWT Bearer |
| Backend testing | xUnit + WebApplicationFactory |
| Version control | Git/GitHub |
| CI | GitHub Actions |

The environment was configured so that backend and frontend could be developed independently while communicating through the API boundary.

### [SCREENSHOT INSERT — Figure 5.2: Development environment]

**Capture:** VS Code or the development environment with the OCR repository opened. Ideally show the project tree on the left and a terminal demonstrating the application running.

**Terminal evidence to capture:** backend running successfully and frontend development server running successfully. Do not include passwords, connection strings, JWT secrets, or other credentials.

**Purpose:** Demonstrates that the implementation was actively developed and executed locally.

**Suggested caption:** *Figure 5.2. Local development environment used for OCR implementation.*

## 5.2.2 Repository Organization

The repository separates implementation from supporting engineering documentation. The source area contains backend and frontend projects, the tests area contains automated verification, and the docs area contains requirements, architecture, research, testing, and finalization material.

This organization was valuable during the internship because implementation decisions could be connected back to requirements rather than remaining undocumented coding decisions.

## 5.2.3 Git-Based Development

Git was used as the version-control mechanism throughout development. GitHub provided the remote repository and also served as an engineering evidence source through commits, issues, project organization, and documentation.

The repository history is particularly useful for the internship report because it can demonstrate progression from requirements and architecture toward implementation and finalization.

### [SCREENSHOT INSERT — Figure 5.3: Git commit history]

**Capture:** GitHub commit history for the OCR repository showing a sequence of implementation/documentation commits.

**What must be visible:** repository name, commit dates, commit messages, and enough history to show progression. Avoid cropping so tightly that the context disappears.

**Purpose:** Provides independent evidence of development progression and supports the planned-vs-actual timeline discussion.

**Suggested caption:** *Figure 5.3. Git commit history demonstrating iterative development and documentation.*

## 5.2.4 Configuration Management

Application configuration separates environment-specific settings from application logic. The PostgreSQL connection and frontend API base URL are configured through environment/application configuration rather than being embedded into business logic.

Secrets and production credentials should never be included in screenshots or committed to the repository.

## 5.2.5 Reproducibility

A useful implementation environment should allow another developer to understand how the application is structured and how it is expected to run. The repository documentation, project files, migrations, test projects, and CI configuration collectively contribute to this reproducibility.

The environment is nevertheless still development-oriented. A complete production deployment pipeline, infrastructure-as-code layer, production secrets management, monitoring stack, and operational disaster-recovery process were outside the internship scope.
