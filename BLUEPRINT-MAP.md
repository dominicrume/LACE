# Blueprint -> Build Map (what runs now vs what it graduates to)

| Blueprint component        | Running now                        | Graduates to            |
|----------------------------|------------------------------------|-------------------------|
| HAProxy/Cloudflare         | uvicorn direct                     | add at deploy           |
| FastAPI Core API           | src/lcx/main.py  (LIVE)            | same, containerised     |
| Image Sanitization svc     | src/lcx/sanitize.py (EXIF strip)   | own service + YOLO blur |
| Redis broker + Celery      | src/lcx/queue.py in-process        | Redis + Celery workers  |
| AI Triage (ResNet/YOLO)    | stub classifier + REAL rules engine| model endpoint + same rules |
| OSRM route clustering      | src/lcx/cluster.py greedy KNN      | OSRM + PostGIS          |
| PostgreSQL/PostGIS         | SQLite (SQLModel)                  | swap DSN, add PostGIS   |
| Prometheus/Grafana         | /scorecard + /health JSON          | exporters               |
| Offline-first driver app   | NOT in this cut                    | PWA + IndexedDB phase 2 |
The contracts don't change when components graduate. That's the point.
