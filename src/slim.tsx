import { render } from "preact";
import { App } from "./app.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";

export async function attach(params: {
  target: HTMLElement;
  sqlite3: Sqlite3Static;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
}) {
  return render(<App {...params} />, params.target);
}
