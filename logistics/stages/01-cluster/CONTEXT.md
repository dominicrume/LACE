# Stage: Cluster Routes
## Input: all triaged items with coordinates
## Process: jitter coords (deterministic per item id), greedy nearest-
  neighbour loop. Drivers see jittered waypoints only.
## Output: ordered stop list
## Completion: serve at /routes/today (driver|operator roles).
