---
name: site-etri
description: Monitors ETRI Recruitment board for new posts.
---

# ETRI Recruitment Monitoring

## 📋 Target Site
- **ETRI Recruitment:** [Link](https://www.etri.re.kr/kor/bbs/list.etri?b_board_id=ETRI39)

## 🛠 Collection Logic
1. **Navigate:** Go to the ETRI recruitment board.
2. **Extract:** Scrape the latest table rows (Title, Date, Link).
3. **Database:** Compare with the Central DB (Google Doc).
4. **Action:** If new, append to DB and notify via Gmail.

## 🎨 Notification Standard (Template)
- **Subject:** `[ETRI] 신규 채용공고 알림 (N건)`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Date, Link (Styled as '상세보기').
