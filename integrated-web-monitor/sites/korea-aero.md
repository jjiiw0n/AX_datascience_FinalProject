---
name: site-korea-aero
description: Monitors KAI Recruitment board for new posts.
---

# KAI Recruitment Monitoring

## 📋 Target Site
- **KAI Recruitment:** [Link](https://koreaaero.recruiter.co.kr/career/job)

## 🛠 Collection Logic
1. **Navigate:** Go to the KAI recruitment board.
2. **Filter:** Search for '신입' keyword.
3. **Extract:** Scrape the table rows (Title, Date, Link).
4. **Database (History):** Compare with previous results in `crawl_history`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[KAI] 한국항공우주산업 채용 공고`
- **HTML Layout:** Standard table format (Title, Date, Link).
