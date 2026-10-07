# Michał Wędzik — links page

A simple, responsive personal links page for Michał Wędzik.
Built with Astro, with link data stored in JSON and styling written in plain CSS.
Generates a static site with no backend or database.

**Website:** [links-page-mwedzik.michalwedzik.workers.dev](https://links-page-mwedzik.michalwedzik.workers.dev/)

## Local development

Requirements: Node.js **22.12.0 or later** and npm.

```bash
npm ci
npm run dev
```

Open the URL printed by Astro in your terminal.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server with live updates. |
| `npm run build` | Builds the static site into `dist/`. |
| `npm run preview` | Serves the built site locally; run the build first. |
| `npm run astro -- --help` | Displays Astro CLI help. |

## Project structure

```text
src/
  data/
    links.json        # Link data
  pages/
    index.astro       # Page content, layout, and styles
astro.config.mjs      # Astro configuration and site URL
wrangler.jsonc        # Cloudflare Workers deployment configuration
package.json          # Dependencies and npm scripts
```

## Editing links

Links are defined in `src/data/links.json`. Example entry:

```json
{
  "name": "github",
  "url": "https://github.com/michalwedzik",
  "icon": "",
  "text": "Projects and code",
  "active": true
}
```

| Field | Description |
| --- | --- |
| `name` | Name displayed on the link card. |
| `url` | Destination URL. |
| `icon` | Optional text icon, such as an emoji. An empty string hides it. |
| `text` | Optional description displayed below the name. |
| `active` | `true` displays the link; `false` hides it. |

**Links appear in the order of entries in the JSON array**, not according to
the `order` field. Links open in a new tab.

## Customizing content and appearance

Edit `src/pages/index.astro`:

- Update the page title and search engine description in `<head>`.
- Change the avatar initials, name, and job title in the `.profile` header.
- Update the copyright text in `<footer>`; the year is generated at build time.
- Adjust colors, fonts, width, spacing, and link cards in the `<style>` section.

The project does not use a theme library or Tailwind CSS.

## Deploying to Cloudflare Workers

The `wrangler.jsonc` file configures deployment of static assets from `dist/`
under the Worker name `links-page-mwedzik`. Deployment requires a Cloudflare
account and authentication through Wrangler.

```bash
npm run build
npx wrangler login
npx wrangler deploy
```

Wrangler is not a project dependency, so `npx` may prompt you to download it.
When deploying to a different URL, update `site` in `astro.config.mjs`.
If you change the Worker name, also update `name` in `wrangler.jsonc`.