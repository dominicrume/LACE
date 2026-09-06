# LCX Rules

## Engineering
1. Contract before code: every workspace stage has a CONTEXT.md; code
   implements the contract, never the other way round.
2. One change at a time, committed. Deterministic by default; seeds logged.
3. No hardcoded config — config.yaml is the single source.
4. Every stage ships a contract test (valid in -> valid out) and a loud-
   failure test (bad in -> structured error). No silent imputation, ever.

## Hardening (civic data — treat as government-grade)
5. PII minimization: exact addresses stay in the DB; public/stats endpoints
   only ever serve jittered coordinates.
6. Every image is sanitized BEFORE storage: EXIF stripped (GPS leak
   prevention). No original with metadata is ever persisted.
7. RBAC on every endpoint: resident | operator | driver | auditor. A role
   sees only what its contract allows.
8. WEEE SAFETY IS ABSOLUTE: any electrical item routes to the safety queue
   with requires_pat=True. No AI output, config flag, or convenience path
   may override this rule. Enforced in code and tested.
9. AI never decides alone: vision classification is a SUGGESTION; the
   deterministic rules engine has final say; operator overrides are recorded
   (feeds the AI-Human Agreement Rate metric).
10. Provenance: every triage decision stores its justification string.

## Scaling (graduation path — see BLUEPRINT-MAP.md)
11. SQLite -> PostgreSQL/PostGIS when >1 hub or spatial queries needed.
12. In-process queue -> Redis+Celery when triage latency affects intake.
13. Greedy clustering -> OSRM when road-network routing is needed.
14. Circuit-breaker: if the vision classifier fails, degrade to metadata-only
    rules — the system NEVER halts intake. (Implemented.)
