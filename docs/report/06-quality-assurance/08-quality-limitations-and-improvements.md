# 6.8 Quality Limitations and Future Improvements

## 6.8.1 Automated Database Testing Limitation

The automated test suite uses EF Core InMemory. This makes tests fast and isolated, but database behavior is not identical to PostgreSQL.

A stronger future approach would add a PostgreSQL-backed integration-test environment, potentially using an isolated database instance or containerized test infrastructure.

## 6.8.2 Frontend Test Coverage

Frontend TypeScript/build checks do not verify browser interaction comprehensively. A future implementation could add automated component and browser-level tests for critical workflows such as login, patient registration, check-in, chart documentation, and role-specific controls.

## 6.8.3 Concurrency Testing

The current implementation documents concurrency limitations around MRN generation and appointment conflict checking. Production-quality testing should include concurrent requests and database-level constraints designed to prevent race conditions.

## 6.8.4 Security Testing

The authorization tests verify application-level role boundaries but are not a penetration test. Future QA should include security scanning, dependency review, threat-model-driven testing, session/token testing, and controlled penetration testing.

## 6.8.5 Clinical Usability Testing

The internship project did not constitute a formal clinical usability study. Future evaluation with representative healthcare users would be required before making claims about real-world clinical usability.

## 6.8.6 Interoperability Testing

FHIR exchange was explicitly outside the MVP. Therefore no interoperability conformance claim should be made. If interoperability is added later, testing should include profile validation, terminology handling, resource mapping, and exchange failure cases.

## 6.8.7 Quality Assurance Reflection

The strongest lesson from QA was that correctness is contextual. A form can save successfully and still produce an incorrect clinical workflow. A role can see the correct screen and still be insecure if the API accepts unauthorized requests. A test can pass against InMemory and still require PostgreSQL verification.

Quality therefore depends on testing the boundaries where requirements, domain rules, architecture, and implementation meet.
