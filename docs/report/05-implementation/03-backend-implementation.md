# 5.3 Backend Implementation

## 5.3.1 Backend Role

The ASP.NET Core backend is the authoritative application layer between the frontend and PostgreSQL. Its responsibilities include exposing REST endpoints, authenticating users, enforcing authorization, validating workflow operations, coordinating persistence, and returning application results to the frontend.

The backend was deliberately structured so that controllers do not become the primary location for domain logic.

## 5.3.2 Layered Implementation

The implementation follows the general pattern:

**HTTP request → Controller → Application Service → EF Core/Data Layer → PostgreSQL**

Application services identified in the project include:

| Service | Implementation responsibility |
|---|---|
| `PatientService` | Patient operations and lifecycle actions |
| `AppointmentWorkflowService` | Appointment transitions, check-in, rescheduling, and workflow rules |
| `ClinicalChartService` | Clinical visit/chart operations |
| `DashboardService` | Dashboard aggregate information |
| `AuditService` | Audit/event recording |

Dependency injection registers the application services, allowing controllers and other components to depend on abstractions rather than constructing services directly.

### [SCREENSHOT INSERT — Figure 5.4: Backend service registration]

**Capture:** Open `ServiceCollectionExtensions.cs` in the repository and show the `AddApplicationServices` method where the application services are registered.

**What must be visible:** registrations for the appointment workflow, clinical chart, patient, and audit services.

**Purpose:** This is stronger evidence than a generic architecture diagram because it demonstrates that the service-layer architecture exists in executable code.

**Suggested caption:** *Figure 5.4. Dependency-injection registration of OCR application services.*

## 5.3.3 Controllers and Business Logic

Thin controllers provide the HTTP boundary. The service layer performs the operations that require domain reasoning. This separation matters particularly for workflow operations because the same rule should not depend on whether the request originated from one particular UI component.

For example, a rule such as preventing new appointments for deceased patients is a business constraint and therefore belongs in backend workflow logic, not only in a disabled frontend button.

## 5.3.4 Dependency Injection

ASP.NET Core dependency injection was used to provide database contexts, authentication components, application services, and other dependencies. This improves testability and keeps object construction centralized.

The same architectural structure also supports the automated testing approach, where the application can be hosted through `WebApplicationFactory` for API-level verification.

## 5.3.5 Error Handling

The backend distinguishes validation and authorization failures from unexpected persistence/application failures. Client-facing responses should provide enough information for the frontend to react appropriately without exposing internal database details or sensitive implementation information.

This distinction is especially important for an EMR because technical exception details should not become part of ordinary user-facing clinical workflows.

## 5.3.6 Backend Evidence

### [SCREENSHOT INSERT — Figure 5.5: Backend project structure]

**Capture:** VS Code/GitHub view of `src/backend/OpenClinicalRecord.Api/` showing Controllers, Services/application services, Data, Models or domain entities, Extensions, and Program/configuration areas.

**Purpose:** Demonstrates separation of backend responsibilities.

**Suggested caption:** *Figure 5.5. Backend project structure supporting the layered OCR architecture.*

## 5.3.7 Engineering Reflection

The implementation reinforced a key lesson from the internship: a service layer is not valuable merely because it exists as a folder. Its value comes from placing business decisions in a stable application boundary. In OCR, appointment transitions, patient lifecycle restrictions, and clinical chart operations are examples where that boundary reduces duplication and makes behavior easier to test.
