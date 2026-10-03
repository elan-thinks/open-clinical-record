# 7.11 Difficulties and Lessons Learned

## Scope pressure

The original task description contained more features than could realistically be completed in one month. The scope reduction taught the importance of prioritization and a defensible MVP boundary.

**Lesson:** a smaller coherent system is more valuable than a larger collection of incomplete features.

## Domain complexity

The relationship between patients, appointments, visits, clinical documentation, roles, and history was more complex than a generic CRUD interpretation suggested.

**Lesson:** model the domain before committing to implementation details.

## Transactional integrity

The project raised questions about transactional integrity and ACID behavior when operations involve multiple related records. It also exposed areas where concurrency hardening would require additional engineering.

**Lesson:** correctness includes failure and concurrent-operation thinking, not only successful execution.

## Testing limitations

Automated verification uses an InMemory database while final end-to-end verification uses PostgreSQL. Frontend automated UI testing is also limited.

**Lesson:** state the boundary of test evidence explicitly.

## Environment interruptions

Development-machine availability and environment problems can interrupt implementation.

**Lesson:** source control, documentation, issue tracking, and recoverable project structure reduce the impact of interruptions.

## AI-assisted uncertainty

AI can accelerate exploration but can also introduce incorrect assumptions.

**Lesson:** generated output must be treated as a hypothesis until verified.

## Evidence capture

A final report loses quality if evidence is collected only at the end.

**Lesson:** capture screenshots and verification records during development.

## Evidence

**Figure 7.20 — Challenge-to-lesson matrix**

Create:
Challenge → Impact → Response → What was learned → Evidence

Use only genuine project experiences. Do not invent failures.