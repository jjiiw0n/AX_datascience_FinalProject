---
name: infra-scheduler
description: Manages automation scheduling and system execution.
---

# Infrastructure & Scheduling

## 📋 Automation Setup
- **Batch File:** `legacy/windows/run_monitor.bat`
- **Task Scheduler:** `GeminiWebMonitor`
- **Execution Interval:** Once Daily (11:00 AM) - **Saturday is automatically skipped via parse.js logic.**
- **Catch-up:** Enabled (Runs immediately on startup if 11:00 AM was missed)
