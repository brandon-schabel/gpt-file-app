import fs from "node:fs";

const BASE_URL =
  "https://api.github.com/repos/oven-sh/bun/git/trees/main?recursive=1";
const RAW_BASE_URL = "https://raw.githubusercontent.com/oven-sh/bun/main/";

async function fetchFilesFromRepo() {
  const response = await fetch(BASE_URL);
  const data = await response.json();

  const docFiles = data.tree.filter(
    (item: any) => item.path.startsWith("docs/") && item.type === "blob"
  );

  const fileContents: Array<{ filename: string; content: string }> = [];

  for (const file of docFiles) {
    const fileResponse = await fetch(RAW_BASE_URL + file.path);
    const fileContent = await fileResponse.text();
    fileContents.push({
      filename: file.path,
      content: fileContent,
    });
  } 

  return fileContents;
}

async function saveToJSONL() {
  const fileContents = await fetchFilesFromRepo();

  // todo update to bun
  const writeStream = fs.createWriteStream("docs.jsonl");
  for (const item of fileContents) {
    writeStream.write(JSON.stringify(item) + "\n");
  }
  writeStream.end();
}

saveToJSONL()
  .then(() => {
    console.log("Docs saved to docs.jsonl");
  })
  .catch((err) => {
    console.error("Error fetching docs:", err);
  });
