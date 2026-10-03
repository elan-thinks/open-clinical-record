# 4.15 Audit and Record Integrity

## 4.15.1 Why integrity matters

For an EMR, correctness is not only whether data can be saved. The system must preserve the meaning and chronology of records.

OCR addresses integrity through longitudinal visits, explicit lifecycle states, appointment event history, audit events, server-side workflow validation, and transactional persistence for related operations.

## 4.15.2 Longitudinal record integrity

A patient remains one persistent identity while each attendance creates a separate ClinicalVisit. This prevents a later visit from replacing the clinical history of an earlier attendance.

A useful representation is Patient → Visit A (Final), Visit B (Final), Visit C (Draft).

## 4.15.3 Final visit boundary

ClinicalVisit states are Draft, Final, and Cancelled. Finalization is treated as a lifecycle boundary. The normal workflow does not simply reopen a final visit for arbitrary editing; new clinical content is represented through a new visit according to the documented rules.

This is a simplified approach compared with mature systems that may provide formal amendment/version workflows.

## 4.15.4 Appointment event history

Appointments can change state multiple times. AppointmentEvent records meaningful changes so that the current appointment status does not have to carry the entire history.

## 4.15.5 Audit events

AuditEvent records important system activity including actor, event, time, and affected entity. The audit trail is not intended to become a second copy of the clinical chart.

## 4.15.6 Deceased state

Marking a patient deceased is a lifecycle transition, not a deletion operation. Historical appointments and clinical visits remain, while inappropriate future operations such as creating a new appointment are prevented.

The ability to clear deceased status is also restricted to specific roles.

## 4.15.7 ACID and transactional reasoning

Maintaining transactional integrity was one of the more difficult engineering concepts during implementation because some workflow operations affect more than one record.

The important question is not merely whether the database supports ACID, but which changes must succeed together and what state would be invalid if only part of an operation succeeded.

For example, check-in can involve appointment state and draft-visit creation. These changes are logically related and therefore require careful transactional treatment.

## 4.15.8 Concurrency limitations

The project documents that MRN generation and appointment conflict checks are not fully concurrency-hardened. Unique constraints reduce certain duplicate outcomes, but production-grade concurrency strategies would require further work.

## 4.15.9 Integrity versus auditability

Integrity asks whether records remain correct and consistent. Auditability asks whether important actions can be traced to actors and times.

They are complementary concerns: an audit trail does not automatically make invalid data valid, and valid data does not automatically provide accountability.

## 4.15.10 Engineering lesson

The project made record integrity more concrete than abstract database theory. A state transition can affect several related records, so implementation requires reasoning about invariants before coding and verifying those invariants through tests.
