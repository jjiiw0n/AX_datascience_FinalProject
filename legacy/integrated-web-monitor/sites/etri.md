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
3. **Database (History):** Compare with previous results by searching Gmail for `"[통합 알림]"` in all mailboxes.
   - **Duplicate Check:** Title, Link, and Date must all match.
   - **Special Rule:** Exclude posts dated 2026-04-28, 2026-05-08, 2026-05-12 as they are already confirmed.
4. **Action:** Include results in the consolidated report `[통합 알림] 웹 모니터링 결과 보고 (YYYY-MM-DD)`.

## 🎨 Notification Standard (Template)
- **Report Section Title:** `[ETRI] 한국전자통신연구원 채용 공고`
- **HTML Layout:**
  - Header: blue (#1a73e8) heading.
  - Table: Collapse border, 100% width.
  - Rows: Alternating colors or gray header (#f2f2f2).
  - Columns: Title, Date, Link (Styled as '상세보기').
