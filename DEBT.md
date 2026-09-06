# Technical Debt Register (unwritten shortcut = trap)
| Shortcut | Why taken | Repay by |
|---|---|---|
| X-Role header auth (no real identity) | v0.1 demo speed | Before ANY real resident data — OIDC |
| Sanitized image not yet persisted (storage seam empty) | Scope | When hub UI needs photos — S3/local store |
| In-process queue loses tasks on crash | Simplicity | Celery+Redis at first multi-hub deploy |
| Greedy clustering ignores roads | No OSRM yet | OSRM when drivers report bad loops |
| Classifier is keyword stub | No model yet | ResNet/YOLO endpoint behind same seam |
