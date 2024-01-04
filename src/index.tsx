import { render } from "preact";
import { App } from "./app.tsx";
import { Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";

export async function attach(target: HTMLElement) {
  const sqlite3 = (await sqlite3InitModule()) as Sqlite3Static;
  return render(<App sqlite3={sqlite3} />, target);
}
