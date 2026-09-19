#!/usr/bin/env bash
set -e
cd /mnt/d/VSCODE/multi-agent-ops-crew/backend
export PYTHONUNBUFFERED=1
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
