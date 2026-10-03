# 13. Non-Functional Requirements

## 13.1 Purpose

Functional completeness alone is insufficient for an EMR-oriented application. The system must also demonstrate appropriate qualities in security, maintainability, integrity, usability, reliability and testability. Because OCR is an internship-scale MVP, these qualities are documented in proportion to the implemented scope.

## 13.2 Security

| ID | Quality requirement | Engineering response |
|---|---|---|
| NFR-SEC-01 | Protected application operations require authentication. | ASP.NET Core Identity and JWT Bearer authentication |
| NFR-SEC-02 | Authorization must not depend solely on frontend visibility. | Backend/API authorization |
| NFR-SEC-03 | Clinical operations must respect role boundaries. | Role checks and service-layer business rules |
| NFR-SEC-04 | Significant operational actions should be auditable. | Audit service/events |
| NFR-SEC-05 | Training credentials must not be treated as production credentials. | Explicit limitation/documentation |

## 13.3 Maintainability

The application should remain understandable and modifiable after the internship. The architecture therefore separates frontend presentation, API controllers, service-layer business logic and persistence concerns. Controllers are kept comparatively thin while workflow rules reside in services.

## 13.4 Data Integrity

The system should preserve relationships among Patient, Appointment and ClinicalVisit records. Clinical history should not be lost merely because current patient information changes. Finalized visits are treated as historical records rather than ordinary editable forms.

## 13.5 Reliability

The application should handle invalid workflow actions predictably. Examples include attempting to schedule a deceased patient, cancelling without a reason, or rescheduling an appointment in a state where rescheduling is prohibited.

## 13.6 Usability

The UI should support the operational workflow without requiring users to understand the internal database model. Navigation, patient search, appointment handling and chart access should follow recognizable clinical workflow concepts.

## 13.7 Testability

Important business rules should be testable independently of the UI. Backend automated tests and service-layer organization support this requirement. Manual end-to-end testing complements automated tests because the automated test environment uses EF Core InMemory rather than the production PostgreSQL provider.

## 13.8 Performance and Scalability Boundary

The internship MVP does not claim enterprise-scale performance benchmarking or horizontal scalability. The engineering objective is instead to avoid unnecessarily expensive data access, maintain clear service boundaries and establish an architecture that could be extended.

## 13.9 Documentation Quality

The system should be accompanied by technical and user documentation sufficient for another person to understand the architecture, workflow, setup and usage. Documentation is treated as an engineering deliverable rather than an afterthought.
