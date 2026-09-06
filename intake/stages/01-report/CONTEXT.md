# Stage: Report Item
## Input
- Resident form: resident_id, declared_condition, lat, lon, optional
  category/photo. Role: resident only.
## Process
1. Validate condition against triage.VALID_CONDITIONS (422 on bad).
2. Sanitize photo (strip EXIF) BEFORE any storage; discard raw.
3. Persist Item(RECEIVED); enqueue triage task.
## Output
{item_id, workflow_state: RECEIVED, triage: queued}
## Completion
Triage worker takes over asynchronously.
