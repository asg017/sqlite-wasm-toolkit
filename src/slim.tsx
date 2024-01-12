import { render } from "preact";
import { App, Sample } from "./app.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";

export async function attach(params: {
  target: HTMLElement;
  sqlite3: Sqlite3Static;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
}) {
  return render(<App {...params} />, params.target);
}

export function eachCode(params: {
  sqlite3: Sqlite3Static;
  footerExtra: string;
}) {
  for (const code of document.body.querySelectorAll("code.language-sql")) {
    console.log(code);
    const sql = code.textContent.trim();
    const replacement = document.createElement("div");
    code.parentElement.replaceWith(replacement);
    render(
      <Sample
        sqlite3={params.sqlite3}
        initialCode={sql}
        footerExtra={params.footerExtra}
      />,
      replacement
    );
  }
}
