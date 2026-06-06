---
name: infra-scheduler
description: Manages automation scheduling and system execution.
---

# Infrastructure & Scheduling

## 📋 Automation Setup
- **Batch File:** `run_monitor.bat` (Root directory)
- **Task Scheduler:** `GeminiWebMonitor`
- **Execution Interval:** Once Daily (11:00 AM) - **Friday and Saturday are automatically skipped via parse.js logic.**
- **Catch-up:** Enabled (Runs immediately on startup if 11:00 AM was missed)
