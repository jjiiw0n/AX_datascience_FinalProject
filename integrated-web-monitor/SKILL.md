---
name: integrated-web-monitor
description: Monitors multiple web boards for new posts, records them in a Google Doc, and sends Gmail notifications. Currently monitoring ETRI Recruitment. Use this to check all registered sites in the 'Site List'.
---

# Integrated Web Monitoring System

This skill automates checking multiple websites for updates, tracking history in a central Google Doc, and sending consolidated or individual email alerts.

## 📋 Registered Site List
1. **ETRI Recruitment:** [Link](https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39)
2. **KT Careers:** [Link](https://recruit.kt.com/careers)
3. **Busan Techno Park (BTP):** [Link](https://www.btp.or.kr/kor/CMS/Board/Board.do?mCode=MN018)
   - *Filter: Only notify if the title contains '부산지역인재'.*

## 📓 Database & Notifications
- **Central DB (Google Doc):** [ETRI 채용공고 모니터링 DB](https://docs.google.com/document/d/1MnKxCrVYzdu6qGdvrnCNCttLcIfSQs-WAWFOXVTu7S4/edit)
- **Primary Alert Email:** `zzib0808@gmail.com`

## 🛠 Execution Workflow
1. **Iterate Sites:** For each site in the 'Registered Site List':
   - Scrape the latest posts (Title, Date, Link).
   - **Apply Filters:**
     - For BTP: Check if the Title contains "부산지역인재". Skip if it doesn't.
   - Compare with the records in the Central DB to avoid duplicates.
2. **Process Updates:**
   - If new (and filtered) posts are found:
     - Append them to the DB (Format: `| Timestamp | Site Name | Title | Date | Link |`).
     - Send an HTML notification email via Gmail.
3. **Report:** Provide a summary of how many sites were checked and how many new relevant items were found in total.

## 💡 Usage Command
`"통합 웹 모니터링 스킬 실행해줘"`
