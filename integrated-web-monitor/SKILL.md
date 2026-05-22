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

### 2. ⚙️ Infrastructure (`infra/`)
- **Scheduler:** `infra/scheduler.md` - Manages Windows Task Scheduler and batch execution settings.

## 📓 Central Resources
- **History Tracking:** Gmail Search fallback (using `[통합 알림]` tag).
- **Primary Account:** `jeew0n.lee.217@gmail.com` (Both Sender and Receiver).

## 🛠 Execution Workflow
1. **Load Modules:** Identify the target sites and load logic from the `sites/` folder.
2. **Process:** Scrape, filter, and compare with previous history by searching Gmail for `"[통합 알림]"` in all mailboxes.
   - **Duplicate Check:** Match 'Title', 'Link', and 'Date/Period'. All three must match to be considered a duplicate.
   - **ETRI Special Rule:** Exclude posts with dates 2026-04-28, 2026-05-08, 2026-05-12.
3. **Notify (Consolidated Report):**
   - **Single Email:** Send one consolidated report for all sites.
   - **Subject:** `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`
   - **Content:** Include tables for all sites. If no new posts, mark as "No new announcements".

## 💡 Usage Command
`"통합 웹 모니터링 스킬 실행해줘"`
