# Contributing to Open Clinical Record

This project follows a lightweight, issue-driven development workflow.

## Work Tracking

1. Create or update a GitHub Issue before starting meaningful work.
2. Add the issue to the Open Clinical Record project board.
3. Assign the appropriate milestone and labels.
4. Create a focused branch from `main`.
5. Implement and validate the change.
6. Open a pull request and link the issue.
7. Review the change before merging.
8. Keep documentation and requirements synchronized with the implementation.

## Branch Naming

Use focused names such as:

- `feature/patient-registration`
- `feature/appointment-scheduling`
- `fix/appointment-status`
- `docs/requirements`
- `research/clinical-documentation`

## Commit Style

Prefer short, meaningful commits using a simple prefix:

- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code restructuring without intended behavior change
- `test:` tests
- `chore:` tooling or project maintenance

## Pull Requests

A pull request should explain what changed, why it changed, how it was validated, and any clinical, data, security, or architectural implications.

## Clinical Changes

Changes affecting patient information, appointments, encounters, clinical documentation, patient status, permissions, or audit history should be reviewed carefully and should not silently change the approved clinical workflow.
