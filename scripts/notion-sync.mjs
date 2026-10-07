import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function fetchNotionLinks(env = process.env) {
  const token = env.NOTION_TOKEN;
  // Preserve compatibility with the previous GitHub Actions configuration.
  const dataSourceId = env.NOTION_DATA_SOURCE_ID || env.NOTION_DATABASE_ID;

  if (!token || !dataSourceId) {
    throw new Error("Set NOTION_TOKEN and NOTION_DATA_SOURCE_ID before syncing Notion.");
  }

  const links = [];
  let cursor;

  do {
    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2026-03-11",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      throw new Error(`Notion API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.results) || typeof data.has_more !== "boolean") {
      throw new Error("Invalid Notion query response.");
    }
    if (data.request_status?.type === "incomplete") {
      throw new Error("Notion query is incomplete; narrow the data source before syncing.");
    }

    for (const page of data.results) {
      const properties = page.properties;
      const requiredTypes = {
        name: "title",
        url: "url",
        icon: "rich_text",
        order: "number",
        active: "checkbox",
      };
      for (const [name, type] of Object.entries(requiredTypes)) {
        if (properties?.[name]?.type !== type) {
          throw new Error(`Notion page ${page.id}: property "${name}" must have type "${type}".`);
        }
      }
      if (properties.text && properties.text.type !== "rich_text") {
        throw new Error(`Notion page ${page.id}: property "text" must have type "rich_text".`);
      }

      links.push({
        name: properties.name.title.map((part) => part.plain_text).join(""),
        url: properties.url.url ?? "",
        icon: properties.icon.rich_text.map((part) => part.plain_text).join(""),
        text: properties.text?.rich_text.map((part) => part.plain_text).join("") ?? "",
        order: properties.order.number ?? 0,
        active: properties.active.checkbox,
      });
    }

    if (data.has_more && (!data.next_cursor || data.next_cursor === cursor)) {
      throw new Error("Notion pagination did not return a new cursor.");
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return links.sort((a, b) => a.order - b.order);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const links = await fetchNotionLinks();
  await writeFile(
    new URL("../src/data/links.json", import.meta.url),
    `${JSON.stringify(links, null, 2)}\n`,
  );
  console.log(`Saved ${links.length} links to links.json`);
}
