---
name: site-btp-talent
description: Monitors Busan Techno Park (BTP) for 'Busan Regional Talent' related posts.
---

# BTP Busan Regional Talent Monitoring

## 📋 Target Site
- **Busan Techno Park (BTP):** [Link](https://www.btp.or.kr/kor/CMS/Board/Board.do?mCode=MN018)

## 🛠 Collection Logic
1. **Navigate:** Go to the BTP notice board.
2. **Search:** Use the search bar to filter for '부산지역인재'.
3. **Extract:** Scrape the filtered search results (Title, Date, Link).
4. **Database:** Compare with the Central DB (Google Doc).
5. **Action:** If new, append to DB and notify via Gmail.

## 🎨 Notification Standard (Template)
- **Subject:** `[BTP] 부산지역인재 관련 신규 공고 알림 (N건)`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Date, Link (Styled as '상세보기').
