# Industrial Observations and Lessons

## 1. Documentation as an Engineering Tool

One of the strongest lessons from the OCR internship was the usefulness of preparing and reviewing different kinds of documentation before implementation.

The project included research, requirements, domain rules, architecture decisions, data design, engineering documentation, testing documentation, and finalization material. These documents progressively reduced ambiguity.

The practical sequence was:

1. Understand the domain.
2. Research existing approaches.
3. Define the project scope.
4. Describe requirements.
5. Model the clinical workflow and data.
6. Make architecture decisions.
7. Implement.
8. Test and refine.
9. Document the final system.

The intern found that this made the development journey clearer and easier to follow.

## 2. Scope Management

The original plan contained more functionality than could reasonably be completed in the available period. Mentor feedback narrowed the project to Patient Management, Patient Chart, and Appointment Management.

This was not simply a reduction in ambition. It created a more coherent MVP and made it possible to concentrate effort on complete workflows.

## 3. Healthcare Workflow Complexity

The project showed that even a relatively small EMR contains significant workflow complexity.

The repository's final domain rules distinguish concepts that can easily be confused:

- patient registration ≠ appointment;
- appointment ≠ visit;
- check-in ≠ completed consultation;
- cancellation ≠ no-show;
- rescheduling ≠ deletion;
- deceased status ≠ deletion of history.

This became an important software-engineering lesson: domain terminology and workflow state have direct consequences for requirements, database design, authorization, and implementation.

## 4. Longitudinal Records

The project also demonstrated why medical records require preservation of history. The implemented model uses a patient with multiple clinical visits, with clinical content attached to individual visits rather than overwriting the patient's previous record.

This is reflected in the repository's clinical-domain rules and technical documentation.

## 5. Transactional Integrity

The intern came to appreciate the importance of maintaining transactional integrity for significant record operations. Healthcare records cannot be treated like disposable application data; related changes must be handled carefully so that the system does not leave inconsistent clinical or workflow state.

This experience also showed that transaction strategy must be considered in relation to the operation being performed rather than applied mechanically to every action in exactly the same way.

## 6. Security and Authorization

The project provided practical exposure to authentication and authorization. The final documentation records JWT authentication, role-based authorization, and API-side enforcement of permissions.

An important lesson was that hiding an interface element on the frontend is not sufficient security. Authorization must also be enforced at the backend/API boundary.

## 7. Industrial Communication

The Wednesday meetings exposed the intern to regular communication around progress, blockers, resources, and responsibilities.

This helped demonstrate that professional software engineering involves communication and coordination alongside technical implementation.

## 8. Learning Through an MVP

Working on a small system made it possible to see the complete development lifecycle rather than only one technical layer. The intern was able to connect research and requirements with architecture, implementation, testing, documentation, and presentation.

The main lesson was that an MVP is not simply a smaller application. It is a deliberate exercise in deciding which workflows are essential enough to complete within the available constraints.
