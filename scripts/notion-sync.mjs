import { writeFile } from "node:fs/promises";

const response = await fetch(
  `https://api.notion.com/v1/data_sources/${process.env.NOTION_DATABASE_ID}/query`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2026-03-11",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  }
);

if (!response.ok) {
  const error = await response.text();
  throw new Error(`Notion API error ${response.status}: ${error}`);
}

const data = await response.json();

const links = data.results.map((page) => {
  const properties = page.properties;

  return {
    name: properties.name.title[0]?.plain_text ?? "",
    url: properties.url.url ?? "",
    icon: properties.icon.rich_text[0]?.plain_text ?? "",
    order: properties.order.number ?? 0,
    active: properties.active.checkbox
  };
});

await writeFile(
  "src/data/links.json",
  JSON.stringify(links, null, 2)
);

console.log(`Saved ${links.length} links to links.json`);