# 4.12 Frontend Architecture

## 4.12.1 Purpose

The OCR frontend is the operational interface through which staff interact with patient, appointment, and clinical workflows. It is implemented using React 19, TypeScript, Vite 8, and React Router 7.

The frontend is organized around user activities rather than exposing the database structure directly.

## 4.12.2 Major interface areas

Conceptually, the application is organized around:

```text
Application
 ├── Authentication
 ├── Dashboard
 ├── Patients
 │    ├── Patient list
 │    ├── Registration / editing
 │    └── Patient chart
 ├── Appointments
 │    ├── Scheduling
 │    ├── Queue
 │    └── Status actions
 └── Administration
      ├── User management
      └── Audit
```

The precise visual arrangement may evolve, but these areas correspond to the implemented functional scope.

## 4.12.3 React component architecture

React provides the component model for reusable interface elements such as forms, tables, cards, status indicators, navigation, and clinical sections.

Componentization is particularly useful because several workflows reuse the same concepts. Patient identity, appointment status, role-dependent actions, and visit information appear in more than one part of the application.

## 4.12.4 Routing

React Router provides client-side navigation between major application areas.

Routing contributes to the workflow model by giving users clear destinations for different operational tasks rather than forcing every action into one large screen.

The route structure also provides a natural boundary for page-level loading and access-aware navigation.

## 4.12.5 API integration

The frontend communicates with the ASP.NET Core API using HTTP/JSON.

The backend address is configured through `VITE_API_BASE_URL`, which allows the same frontend implementation to work against different development environments without embedding a fixed server address throughout the code.

The browser does not connect directly to PostgreSQL.

## 4.12.6 Authentication state and role awareness

After login, the frontend receives the information needed to operate as the authenticated user.

That information can influence:

- visible navigation;
- action buttons;
- administrative screens;
- clinical controls;
- editing capabilities.

However, frontend role awareness is a usability mechanism, not the final security boundary. The API independently enforces authorization.

## 4.12.7 Workflow-oriented interface design

The interface follows the conceptual patient journey:

```text
Registration
     ↓
Appointment
     ↓
Check-in / Queue
     ↓
Draft Clinical Visit
     ↓
Clinical Documentation
     ↓
Finalization
     ↓
Completion
```

This makes the application more understandable than a design based only on independent CRUD screens.

For example, an appointment queue has meaning because it connects scheduling to check-in and subsequent clinical work.

## 4.12.8 Patient chart interface

The patient chart is intentionally broader than demographic information.

The chart allows staff to access the patient's longitudinal clinical visits and related information. Previous visits remain visible as historical records while the current visit can be treated as a separate workflow object.

This follows the domain analysis that a clinical chart is a workspace for continuity of care rather than merely a profile page.

## 4.12.9 Dashboard

The dashboard provides operational summary information through backend aggregates.

This prevents the browser from having to understand the entire database model simply to calculate basic statistics.

The dashboard is deliberately limited to MVP-level operational reporting. It should not be described as a complete business-intelligence platform.

## 4.12.10 Role-aware interaction

Role awareness can affect which actions are presented to the user.

For example, a receptionist and a nurse may both access patient information but have different responsibilities around clinical documentation and patient lifecycle actions. The interface can reduce confusion by not presenting actions that are unavailable to the current role.

The API remains responsible for enforcing the same boundaries.

## 4.12.11 Frontend validation

Frontend validation improves feedback speed and usability. It can identify missing or malformed fields before a request is submitted.

It does not replace server-side validation. The API must assume that requests can originate from outside the normal browser interface.

This separation is especially important for operations involving clinical state and authorization.

## 4.12.12 Frontend testing limitation

Backend automated testing is stronger than frontend browser automation in the current project. Manual end-to-end testing therefore remains important for verifying the complete user journey.

A production-scale implementation would benefit from broader automated UI tests covering navigation, role-specific rendering, forms, and critical workflow paths.

## 4.12.13 Engineering lesson

The frontend became easier to design once the project had explicit workflows and role boundaries. Instead of asking only “Which pages should exist?”, the engineering question became “What does this user need to accomplish at this point in the patient journey?”

That change helped the UI represent the process rather than merely expose database records.
