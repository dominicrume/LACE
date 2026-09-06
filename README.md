# LCX — Ladywood Circular Exchange (Runnable Core)

Residents report items -> images sanitized -> AI suggests, deterministic
WEEE-safe rules decide -> routes clustered -> KPIs served. Built on the ICM
pattern: contracts in folders, code implements contracts.

## Run it (VS Code terminal)
    pip install -e .            # or: uv sync
    pytest                      # 15 tests should pass
    uvicorn lcx.main:app --reload --app-dir src

## Try it
    # report a toaster (resident role)
    curl -X POST http://127.0.0.1:8000/items \
      -H "X-Role: resident" \
      -F resident_id=grace -F declared_condition=NEEDS_REPAIR \
      -F declared_category=APPLIANCES -F lat=52.4862 -F lon=-1.9250
    # watch it hit the WEEE safety queue
    curl http://127.0.0.1:8000/items/1 -H "X-Role: operator"
    # KPIs
    curl http://127.0.0.1:8000/scorecard -H "X-Role: auditor"

## The architecture promise
Every enterprise component in the blueprint has a SEAM here and a
graduation path in BLUEPRINT-MAP.md. Contracts don't change when
components graduate — that is the design.
