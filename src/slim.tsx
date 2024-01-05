import { render } from "preact";
import { App } from "./app.tsx";
import { Sqlite3Static } from "src/sqlite3.mjs";

export async function attach(
  target: HTMLElement,
  sqlite3: Sqlite3Static,
  initialCode?: string
) {
  return render(<App sqlite3={sqlite3} initialCode={initialCode} />, target);
}
