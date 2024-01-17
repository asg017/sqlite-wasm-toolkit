import { render } from "preact";
import { SqlWidget } from "./widgets.tsx";
import { Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";

export async function attach(target: HTMLElement, initialCode?: string) {
  const sqlite3 = (await sqlite3InitModule()) as Sqlite3Static;
  return render(
    <SqlWidget sqlite3={sqlite3} initialCode={initialCode} />,
    target
  );
}
