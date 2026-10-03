# 5.10 Frontend Implementation and API Integration

## 5.10.1 Frontend Architecture

The frontend was implemented with React 19, TypeScript, Vite, and React Router. Its purpose is to provide the user-facing workflow while consuming the backend API as the authoritative application interface.

The frontend is organized around application areas such as authentication, dashboard, patients, appointments/queue, and clinical chart workflows.

## 5.10.2 Routing

React Router provides navigation between application areas. Protected application pages are presented within the authenticated application context.

Routing is treated as a navigation mechanism rather than as the security boundary. A user reaching a route does not imply that the backend will authorize every operation available from that route.

### [SCREENSHOT INSERT — Figure 5.25: Main application navigation]

**Capture:** Authenticated OCR screen showing the main navigation/sidebar and the currently selected module.

**What must be visible:** navigation items, active page indicator, and role-appropriate options.

**Purpose:** Demonstrates how the frontend exposes the implemented application modules.

**Suggested caption:** *Figure 5.25. OCR authenticated application navigation.*

## 5.10.3 API Integration

The frontend communicates with the ASP.NET Core REST API. The API base URL is configured through the frontend environment configuration rather than being hard-coded into individual feature components.

The integration pattern keeps UI concerns separate from backend persistence concerns.

## 5.10.4 Form Handling and Validation

Forms collect structured information for patient registration, appointments, and clinical documentation. Frontend validation provides immediate feedback, while backend validation remains authoritative.

This two-level approach improves usability without trusting client-side checks as the sole enforcement mechanism.

### [SCREENSHOT INSERT — Figure 5.26: Frontend validation]

**Capture:** One implemented form in an invalid state showing a useful validation message, such as a missing required field or invalid appointment input.

**Purpose:** Demonstrates user-facing validation behavior.

**Suggested caption:** *Figure 5.26. Client-side validation feedback during OCR data entry.*

## 5.10.5 Workflow-Oriented Interaction

The frontend reflects domain states instead of exposing arbitrary database operations. Appointment buttons change according to state; finalized visits do not behave like drafts; role-specific actions are presented only where appropriate.

This is an important UI engineering principle for workflow systems: the interface should communicate what can happen next.

## 5.10.6 Patient Chart Presentation

The patient chart is designed around chronology. Rather than presenting clinical data as unrelated forms, the interface gives the user patient context and visit history, then allows the appropriate visit to be opened for documentation.

### [SCREENSHOT INSERT — Figure 5.27: Clinical chart detail]

**Capture:** Patient chart detail screen showing patient header/context, visit timeline/list, and the selected visit's clinical information.

**Purpose:** Demonstrates the central longitudinal-chart interaction.

**Suggested caption:** *Figure 5.27. OCR patient chart detail and longitudinal visit presentation.*

## 5.10.7 Error and Loading States

A usable frontend must account for API latency, failed requests, invalid operations, and empty results. These states should be presented as application feedback rather than leaving users with ambiguous screens.

The report should document only the states that are actually implemented and demonstrated.

## 5.10.8 Frontend Testing Boundary

The project includes backend automated tests and frontend TypeScript/build verification through CI. Automated browser-level UI testing is more limited. Manual end-to-end testing therefore remains important for demonstrating complete user workflows.

This distinction prevents the report from claiming a level of automated UI coverage that was not actually implemented.
