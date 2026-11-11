# Growth — Instagram coach for @dentoart.dubai

A small installable web app (PWA) hosted on GitHub Pages.

- **Today** – daily to-do list + coach tips
- **Plan** – weekly content schedule (4 posts + daily Stories)
- **Posts** – what is working (reach by format and content type)
- **Ads** – log ads and see cost per message / client
- **Messages** – ready-made replies

Data: `.github/workflows/update.yml` runs every morning (07:00 Dubai), pulls Instagram with the
`INSTAGRAM_ACCESS_TOKEN` repository secret (`scripts/sync.mjs`), commits `public/data.json`, and
publishes the site. Ticks, plan edits and ads are stored in the browser of each device.

Local: `npm run dev` → http://localhost:4700
