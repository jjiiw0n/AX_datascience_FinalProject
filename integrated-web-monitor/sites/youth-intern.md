---
name: site-youth-intern
description: Monitors 2030 Youth Intern recruitment board for new posts.
---

# 2030 Youth Intern Monitoring

## 📋 Target Site
- **2030 Youth Intern:** [Link](https://www.2030db.go.kr/user/youthIntern/selectYouthInternList.do)

## 🛠 Collection Logic
1. **Navigate:** Go to the 2030 Youth Intern recruitment list page.
2. **Extract:** Scrape the table rows (Title, Period, Link).
3. **Database (History):** Compare with previous results by searching Gmail for `"[통합 알림]"` in all mailboxes.
   - **Duplicate Check:** Title, Link, and Period must all match.
4. **Action:** Include results in the consolidated report `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[2030인턴] 청년인턴 모집 공고`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Period, Organization, Link (Styled as '상세보기').
