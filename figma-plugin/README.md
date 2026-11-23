# SchoolScore → Figma plugin

Rebuilds the HTML prototype in Figma without using the Figma MCP allowance.

## What it creates (on the **Designs** page, below the existing frames)

A section called **"SchoolScore — synced from site"** with:

- **Desktop (1440):** Home, Schools, School detail, About us
- **Phone (375):** the same 4 pages
- **Components:** Site / Header, Site / Footer, School row (Desktop/Phone variants), Chip (Default/Selected/On surface), Stars
- **Variables:** a "SchoolScore" collection with `color/*`, `space/1…20` and `radius/*`, using the same values as `style.css`. All fills, gaps, padding and radii are bound to them.

Your existing frames (B · Main, B · Index, B · Single) are left untouched. Running the plugin again deletes and rebuilds only its own section.

## Run it (Figma desktop app)

1. Open the **School Rating – Designs** file.
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Pick `school-rating/figma-plugin/manifest.json`.
4. Menu → **Plugins → Development → SchoolScore – sync from site**.

It takes a few seconds, then zooms to the new section.

## After changing the site

Edit `src/plugin.js` (content and layout live there), then rebuild `code.js`, which bundles the photos from `../assets/img`:

```
node build.js
```
