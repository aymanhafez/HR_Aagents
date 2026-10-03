# Responsive app shell and pages

## What will change
- Replace the crowded phone header with a compact mobile bar, including a navigation drawer and icon access to Nayera AI.
- Keep role and data controls available without forcing the page wider than the screen.
- Make shared page headings, action groups, forms, cards, transaction rows, and data tables adapt cleanly from phone to desktop.
- Fix modal and side-panel sizing so they fit short and narrow screens.

## Verification
- Check representative dashboard, feature, employee, task, and agent pages at phone, tablet, and desktop widths.
- Confirm navigation, forms, tables, and AI controls remain usable with no horizontal page overflow.

## Technical details
- Reuse the existing responsive utilities and design components; business logic and data behavior remain unchanged.
- Apply fixes primarily in the shared shell and shared page components so all feature pages benefit consistently.
