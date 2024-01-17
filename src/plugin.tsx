import { render } from "preact";
import { SqlWidget } from "./widgets.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";

export async function attach(params: {
  target: HTMLElement;
  sqlite3: Sqlite3Static;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
}) {
  return render(<SqlWidget {...params} />, params.target);
}

export function eachCode(params: {
  sqlite3: Sqlite3Static;
  footerExtra: string;
  extraCompletions?: any[];
  targets?: string;
}) {
  for (const code of document.body.querySelectorAll(
    params.targets ?? "code.language-sql"
  )) {
    const sql = (code.textContent as string).trim();
    const replacement = document.createElement("div");
    (code.parentElement as HTMLElement).replaceWith(replacement);
    render(
      <SqlWidget
        sqlite3={params.sqlite3}
        initialCode={sql}
        footerExtra={params.footerExtra}
        extraCompletions={params.extraCompletions}
      />,
      replacement
    );
  }
}
