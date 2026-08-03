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
4. **Database (History):** Compare with previous results by searching Gmail for `"[통합 알림]"` in all mailboxes.
   - **Duplicate Check:** Title, Link, and Date must all match.
5. **Action:** Include results in the consolidated report `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[BTP] 부산테크노파크 부산지역인재 채용 공고`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Date, Link (Styled as '상세보기').
