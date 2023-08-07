import fs from "node:fs";
import tailwindConfig from "./tailwind.config";
export const initHTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <script src="https://cdn.tailwindcss.com"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>

    <script>
    tailwind.config = ${JSON.stringify(tailwindConfig)};
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

// write to index.html file
export const writeInitHTML = (html: string) => {
  
  // write index.html
  fs.writeFileSync("index.html", html);
};


writeInitHTML(initHTML);