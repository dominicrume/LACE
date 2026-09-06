# Stage: Classify (suggestion only)
## Input: item filename + metadata
## Process: run classifier; on ANY failure return None (circuit breaker).
## Output: category suggestion or None
## Completion: pass to 02-rules. The suggestion NEVER routes an item alone.
