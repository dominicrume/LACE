# Logistics Workspace (L1)
Jitter coordinates, order pickup loops. Drivers see jittered points only.

## What to Load
| Resource | When | Why |
|---|---|---|
| stages/01-cluster/CONTEXT.md | Always | Stage contract |
| src/lcx/cluster.py           | Routing work | Greedy seam -> OSRM |
| tests/test_cluster.py        | Any change | Determinism + bounds |

## What NOT to Load
| Resource | Why |
|---|---|
| Raw resident PII / exact coords in outputs | Rule 5 |
| Triage internals | Consumes states only |
