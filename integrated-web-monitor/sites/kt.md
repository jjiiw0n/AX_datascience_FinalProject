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
3. **Database:** Compare with the Central DB (Google Doc).
4. **Action:** If new, append to DB and notify via Gmail.

## 🎨 Notification Standard (Template)
- **Subject:** `[KT Careers] 신규 채용공고 알림 (N건)`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Period, Link (Styled as '상세보기').
