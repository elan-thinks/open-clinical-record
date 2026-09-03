# ADR 0001: Record Architectural Decisions

- **Status:** Accepted
- **Date:** 2026-09-03

## Context

EMR projects accumulate important technical decisions quickly: data boundaries, integration choices, security models, and clinical workflow assumptions. If those decisions only live in chat or in someone's memory, they become difficult to review later.

## Decision

Important architecture decisions for Open Clinical Record will be recorded as short Architecture Decision Records (ADRs) in this directory.

Each ADR should contain:

1. Context
2. Decision
3. Alternatives considered
4. Consequences
5. Evidence / references

## Why

This keeps the project understandable to another developer six months later. It also gives us a place to explain why we chose a simpler approach for the MVP instead of making the repository look artificially complicated.

## Consequences

There will be a little more documentation work, but architectural reasoning becomes visible, reviewable, and easier to change deliberately.
