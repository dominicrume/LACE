# Triage Workspace (L1)
Classify (suggestion) then deterministic rules (final say). WEEE is law.

## What to Load
| Resource | When | Why |
|---|---|---|
| stages/{current}/CONTEXT.md | Always | Stage contract |
| src/lcx/triage.py           | Rules work | The law lives here |
| src/lcx/classifier.py       | Classify work | Suggestion seam |
| tests/test_triage.py        | Any rules change | Never break WEEE tests |

## What NOT to Load
| Resource | Why |
|---|---|
| API/DB internals | Rules are pure functions; keep them so |
| Cluster/scorecard code | Different concern |
