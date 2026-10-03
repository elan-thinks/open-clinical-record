# 6.3 Access-Control Testing

## 6.3.1 Purpose

Access control is one of the highest-value QA areas in OCR because the application contains different operational roles and clinical documentation privileges.

The repository contains an access-control audit report dated September 19, 2026 and reviewed September 27, 2026. Its automated coverage is associated with AccessMatrixTests.cs.

## 6.3.2 Authorization Matrix

The documented expected matrix includes:

| Operation | Admin | Doctor | Nurse | Receptionist | Anonymous |
|---|:---:|:---:|:---:|:---:|:---:|
| List patients | ✓ | ✓ | ✓ | ✓ | 401 |
| Create patient | ✓ | ✓ | ✓ | ✓ | 401 |
| Update patient | ✓ | ✓ | ✓ | ✓ | 401 |
| Mark deceased | ✓ | ✓ | 403 | ✓ | 401 |
| Clear deceased | ✓ | ✓ | 403 | 403 | 401 |
| Create appointment | ✓ | ✓ | ✓ | ✓ | 401 |
| Chart read | ✓ | ✓ | ✓ | ✓ | 401 |
| Clinical chart write | 403 | ✓ | ✓ | 403 | 401 |
| User/audit administration | ✓ | 403 | 403 | 403 | 401 |

A separate business rule states that an appointment cannot be created for a deceased patient, resulting in a validation/business-rule rejection rather than an authorization failure.

## 6.3.3 Why 401 and 403 Matter

The distinction between 401 and 403 is meaningful:

- 401 indicates that authentication is missing or invalid.
- 403 indicates that the caller is authenticated but does not have permission for the operation.

The tests therefore verify both identity protection and role boundaries.

### [SCREENSHOT INSERT — Figure 6.5: Access matrix evidence]

**Capture:** The access-control audit report in the repository showing the authorization matrix.

**What must be visible:** role columns, key operations, and 401/403 outcomes.

**Purpose:** Connects the report's role claims to a dated engineering artifact.

**Suggested caption:** *Figure 6.5. OCR access-control matrix defining expected authorization behavior.*

## 6.3.4 Boundary-Focused Test Cases

Representative scenarios include:

1. anonymous API access to protected patient data → 401;
2. nurse attempts to mark a patient deceased → 403;
3. doctor marks a patient deceased → allowed;
4. deceased patient cannot receive a new appointment → 400;
5. receptionist attempts to create a clinical visit → 403;
6. nurse creates a clinical visit → allowed.

### [SCREENSHOT INSERT — Figure 6.6: Access-control automated tests]

**Capture:** Test source or test-run output for AccessMatrixTests.cs.

**What must be visible:** recognizable test names/scenarios and successful test results.

**Purpose:** Shows that the authorization matrix is backed by executable verification.

**Suggested caption:** *Figure 6.6. Automated access-control verification for OCR role boundaries.*

## 6.3.5 Security Testing Limitation

The matrix demonstrates application-level authorization behavior. It does not constitute a complete security assessment, penetration test, threat-model validation, or production security certification.
