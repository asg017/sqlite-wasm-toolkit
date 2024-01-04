import { render } from "preact";
import { App } from "./app.tsx";
import { Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";

async function main() {
  const sqlite3 = (await sqlite3InitModule()) as Sqlite3Static;
  render(<App sqlite3={sqlite3} />, document.getElementById("app")!);
}
main();
