# Intake Workspace (L1)
Resident-facing item reporting: validate, sanitize, persist, enqueue.

## What to Load
| Resource | When | Why |
|---|---|---|
| stages/01-report/CONTEXT.md | Always | Stage contract |
| src/lcx/main.py (/items)    | Editing intake | The endpoint |
| src/lcx/sanitize.py         | Photo handling | Rule 6 EXIF strip |
| config.yaml                 | Any config need | Rule 3 |

## What NOT to Load
| Resource | Why |
|---|---|
| Triage/cluster internals | Intake only enqueues; it never triages |
| Other workspaces | Irrelevant context |
