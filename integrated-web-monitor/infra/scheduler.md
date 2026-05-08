---
name: infra-scheduler
description: Manages automation scheduling and system execution.
---

# Infrastructure & Scheduling

## 📋 Automation Setup
- **Batch File:** `run_monitor.bat` (Root directory)
- **Task Scheduler:** `GeminiWebMonitor`
- **Execution Interval:** 1 Hour (Daily starting from 09:00 AM)

## 🛠 Maintenance
1. **Missed Tasks:** Ensure the "Run as soon as possible if scheduled start is missed" option is enabled in Task Scheduler.
2. **Logs:** Check PowerShell console for any execution errors during scheduled runs.
