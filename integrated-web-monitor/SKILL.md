---
name: integrated-web-monitor
description: Monitors multiple web boards for new posts, records them in a Google Doc, and sends Gmail notifications.
---

# Integrated Web Monitoring System (Modular)

This skill automates checking multiple websites for updates, tracking history in a central Google Doc, and sending consolidated or individual email alerts.

## 📁 Modular Structure
The monitoring logic is split into individual modules for better maintainability and version control:

### 1. 🏢 Sites (`sites/`)
- **ETRI Recruitment:** `sites/etri.md` - Monitors ETRI's recruitment board.
- **KT Careers:** `sites/kt.md` - Monitors KT group's career opportunities.
- **BTP Regional Talent:** `sites/btp-talent.md` - Monitors Busan Techno Park for 'Busan Regional Talent' keywords.
- **2030 Youth Intern:** `sites/youth-intern.md` - Monitors the 2030 Youth Intern recruitment board.

## ⚙️ Infrastructure (`infra/`)
- **Scheduler:** `infra/scheduler.md` - Manages Windows Task Scheduler and batch execution settings.
- **Parsing & Filtering:** `parse.js` - JavaScript script that scrapes local HTML files, compares with `history.json`, and outputs `new_results.json`.

## 📓 Central Resources
- **History Tracking:** `history.json` (Local file for persistent state).
- **Primary Account:** `jeew0n.lee.217@gmail.com` (Both Sender and Receiver).

## 🛠 Execution Workflow
1. **Scrape:** Use Playwright to download the latest HTML from target sites.
2. **Filter (Code-based):** Run `node parse.js` to compare current data with `history.json`.
   - **Output:** Only new items are stored in `new_results.json`.
3. **Notify (AI-assisted):**
   - **Load Data:** Read `new_results.json`.
   - **Generate Report:** AI creates a consolidated report based *only* on the new items.
   - **Email:** Send via Gmail. Subject: `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`.
   - **Heartbeat:** If no new posts, send a brief "System operational, no new updates" message.


## 💡 Usage Command
`"통합 웹 모니터링 스킬 실행해줘"`
