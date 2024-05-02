import { render } from "preact";
import { SqlWidget } from "./widgets.tsx";
import { PreparedStatement, Sqlite3Static, Database } from "src/sqlite3.mjs";
import { SQLiteContext } from "./context.ts";

export async function attach(params: {
  target: HTMLElement;
  sqlite3: Sqlite3Static;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
  refresh?: EventTarget;
}) {
  return render(
    <SQLiteContext.Provider value={params.sqlite3}>
      <SqlWidget {...params} />
    </SQLiteContext.Provider>,
    params.target
  );
}

export function eachCode(params: {
  sqlite3: Sqlite3Static;
  footerExtra: string;
  db?: Database;
  extraCompletions?: any[];
  targets?: string;
  refresh?: EventTarget;
}) {
  for (const code of document.body.querySelectorAll(
    params.targets ?? "code.language-sql"
  )) {
    const sql = (code.textContent as string).trim();
    const replacement = document.createElement("div");
    code.replaceWith(replacement);
    render(
      <SQLiteContext.Provider value={params.sqlite3}>
        <SqlWidget
          db={params.db}
          initialCode={sql}
          footerExtra={params.footerExtra}
          extraCompletions={params.extraCompletions}
          refresh={params.refresh}
        />
      </SQLiteContext.Provider>,
      replacement
    );
  }
}
