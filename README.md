# Michał Wędzik — links page

A simple, responsive personal links page for Michał Wędzik.
Built with Astro, with link data fetched from Notion at build time and styling written in plain CSS.
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
| `npm run sync:notion` | Fetches Notion data into `src/data/links.json`. |
| `npm run build` | Syncs Notion, then builds the static site into `dist/`. |
| `npm run build:static` | Builds using the existing JSON without contacting Notion. |
| `npm test` | Tests Notion synchronization with mocked API responses. |
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
scripts/
  notion-sync.mjs     # Build-time Notion synchronization
wrangler.jsonc        # Cloudflare Workers deployment configuration
package.json          # Dependencies and npm scripts
```

## Editing links

Links are managed in Notion and exported to `src/data/links.json`. Example entry:

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

Synchronization sorts links by the numeric `order` property (empty values default
to `0`). The page renders active links in JSON array order. Links open in a new tab.

## Connecting Notion

Create a Notion integration with read access and connect it to your database.
The data source must have these case-sensitive properties:

| Property | Notion type |
| --- | --- |
| `name` | Title |
| `url` | URL |
| `icon` | Text (rich text) |
| `order` | Number |
| `active` | Checkbox |
| `text` | Text (rich text), optional |

Set the environment variables `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID`.
No `.env` file is required or loaded by the synchronization script.
Use the **data source ID**, not the parent database ID. If you only have the
database ID, retrieve the database through the Notion API and use the ID from
its `data_sources` list. The legacy variable `NOTION_DATABASE_ID` is also accepted,
but its value must still be a data source ID.

For local use, export the variables in your terminal before running:

```bash
npm run sync:notion
npm run dev
```

Synchronization fetches all result pages. Missing configuration, API errors,
incomplete queries or incompatible properties stop the build instead of deploying
stale data. The token is used only by the build script and is not bundled into
the website. Only the generated HTML and assets are deployed.

`npm run dev` does not contact Notion automatically. Run synchronization again
to refresh local data. For offline work, edit the JSON and use `npm run build:static`;
the next synchronization will overwrite those edits.

## Customizing content and appearance

Edit `src/pages/index.astro`:

- Update the page title and search engine description in `<head>`.
- Change the avatar initials, name, and job title in the `.profile` header.
- Update the copyright text in `<footer>`; the year is generated at build time.
- Adjust colors, fonts, width, spacing, and link cards in the `<style>` section.

The project does not use a theme library or Tailwind CSS.

## Deploying to Cloudflare Workers

The `wrangler.jsonc` file configures deployment of static assets from `dist/`
under the Worker name `links-page-notion`. Deployment requires a Cloudflare
account and authentication through Wrangler.

```bash
npm run build
npx wrangler login
npx wrangler deploy
```

Wrangler is not a project dependency, so `npx` may prompt you to download it.
When deploying to a different URL, update `site` in `astro.config.mjs`.
If you change the Worker name, also update `name` in `wrangler.jsonc`.

### Cloudflare Workers Builds (Git integration)

Connect this repository to your Worker. In **Settings > Build**, configure:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root |
| Build variable | `NOTION_DATA_SOURCE_ID`: your data source ID |
| Build secret | `NOTION_TOKEN`: your integration token |

Add these under **Build variables and secrets**, not the Worker's runtime
**Variables & Secrets**. The script runs in Node.js during the build; the deployed
Worker only serves static assets, so no Astro Cloudflare adapter or runtime
Notion secret is needed. Use Node.js 22.12.0 or later in the build environment.

Each push to the connected production branch triggers a sync, build and deploy.
**Editing Notion alone does not trigger a deployment.** To publish those changes,
trigger a new build in Cloudflare or push another commit. This setup does not
provide scheduled synchronization.

See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).