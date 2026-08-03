---
name: site-kt
description: Monitors KT Careers for new job postings.
---

# KT Careers Monitoring

## 📋 Target Site
- **KT Careers:** [Link](https://recruit.kt.com/careers)

## 🛠 Collection Logic
1. **Navigate:** Go to the KT Careers page.
2. **Extract:** Scrape the current job listings (Title, Period, Link).
3. **Database (History):** Compare with previous results by searching Gmail for `"[통합 알림]"` in all mailboxes.
   - **Duplicate Check:** Title, Link, and Period must all match.
4. **Action:** Include results in the consolidated report `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[KT] KT Careers 채용 공고`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Period, Link (Styled as '상세보기').
