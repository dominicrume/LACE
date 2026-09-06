# ROOTS-SCORE — LCX runnable core · scored 2026-08-12 · owner: Rume
| # | Check | State | Pointer | Waiver |
|---|-------|-------|---------|--------|
| 1 | Written rules | ROOTED | rules/RULES.md + root CLAUDE.md | |
| 2 | Spec-first | ROOTED | stage CONTEXT.md files predate code | |
| 3 | Decomposition | ROOTED | 4 workspaces, numbered stages, module-per-concern | |
| 4 | Planning [HV] | SEEDLING | | Rume 2026-08-12: fixed pipeline OK for v0.1; plan artifact in v0.2 |
| 5 | Exit criteria | ROOTED | Completion clause in every CONTEXT.md | |
| 6 | Context discipline | ROOTED | L1 What-NOT-to-Load tables x4 | |
| 7 | Sandboxing [HV] | SEEDLING | | Rume 2026-08-12: single-process v0.1; per-worker isolation with Celery graduation |
| 8 | Trajectory [HV] | SEEDLING | logging + justification fields | Rume 2026-08-12: full run-trace ledger in v0.2 (KYA witness layer) |
| 9 | Guardrails | ROOTED | WEEE branch + 409 override block + RBAC deps | |
| 10 | Verification | ROOTED | tests/ 19 tests incl. loud-failure cases | |
| 11 | Grounding [HV] | ROOTED | every decision carries justification; provenance test | |
| 12 | CI/CD [HV] | SEEDLING | check_roots.py exists | Rume 2026-08-12: wire pytest+gate into pipeline at first deploy |
| 13 | Feedback [HV] | ROOTED | operator_override recorded -> ai_human_agreement metric | |
