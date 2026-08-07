---
name: site-hanwha
description: Monitors Hanwha Recruitment board for new posts.
---

# Hanwha Recruitment Monitoring

## 📋 Target Site
- **Hanwha Recruitment:** [Link](https://www.hanwhain.com/portal/apply/recruit)

## 🛠 Collection Logic
1. **Navigate:** Go to the Hanwha recruitment board.
2. **Filter:** Search for '한화에어로스페이스', '한화시스템' and '신입' keyword.
3. **Extract:** Scrape the table rows (Title, Date, Link).
4. **Database (History):** Compare with previous results in `crawl_history`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[한화] 한화 그룹 채용 공고`
- **HTML Layout:** Standard table format (Title, Date, Link).
