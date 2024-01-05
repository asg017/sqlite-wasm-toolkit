import { render } from "preact";
import { App } from "./app.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";

function prepareStatement(stmt: PreparedStatement) {
  if (stmt.getParamIndex(":name") !== undefined) {
    stmt.bind({ ":name": "alex" });
  }
}
async function main() {
  const sqlite3 = (await sqlite3InitModule({})) as Sqlite3Static;
  render(
    <App sqlite3={sqlite3} prepareStatement={prepareStatement} />,
    document.getElementById("app")!
  );
}
main();
