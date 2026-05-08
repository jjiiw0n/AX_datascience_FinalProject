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

### 2. ⚙️ Infrastructure (`infra/`)
- **Scheduler:** `infra/scheduler.md` - Manages Windows Task Scheduler and batch execution settings.

## 📓 Central Resources
- **Central DB (Google Doc):** [ETRI 채용공고 모니터링 DB](https://docs.google.com/document/d/1MnKxCrVYzdu6qGdvrnCNCttLcIfSQs-WAWFOXVTu7S4/edit)
- **Primary Alert Email:** `zzib0808@gmail.com`

## 🛠 Execution Workflow
1. **Load Modules:** Identify the target site and load the corresponding logic from the `sites/` folder.
2. **Process:** Scrape, filter (if applicable), and compare with the Central DB.
3. **Notify:** Update the DB and send Gmail alerts for any new findings.

## 💡 Usage Command
`"통합 웹 모니터링 스킬 실행해줘"`
