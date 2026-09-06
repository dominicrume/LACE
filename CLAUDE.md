# LCX — Ladywood Circular Exchange — Root Router (L0)

Civic resource-routing platform: residents report items -> sanitized ->
triaged (vision + deterministic WEEE rules) -> routed to hubs. This repo is
the RUNNABLE CORE of the enterprise blueprint (see BLUEPRINT-MAP.md for how
each piece graduates to the full architecture).

## Read rules first
rules/RULES.md before any change. Non-negotiable.

## Routing Table
| Job Slug          | Workspace        | Entry Stage      |
|-------------------|------------------|------------------|
| `report-item`     | `intake/`        | `01-report`      |
| `run-triage`      | `triage/`        | `01-classify`    |
| `cluster-routes`  | `logistics/`     | `01-cluster`     |
| `scorecard`       | `observability/` | `01-scorecard`   |

## Facts (single source of truth)
- Code lives in src/lcx/. One FastAPI app: src/lcx/main.py
- DB: SQLite via SQLModel (upgrade path: PostgreSQL/PostGIS)
- Queue: in-process worker (upgrade path: Redis + Celery)
- Triage rules: src/lcx/triage.py — deterministic, WEEE-safe, TESTED
- Run: `uvicorn lcx.main:app --reload`  Test: `pytest`
