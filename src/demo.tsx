import { render } from "preact";
import { SqlWidget } from "./widgets.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";
import { eachCode } from "./slim.tsx";
function prepareStatement(stmt: PreparedStatement) {
  if (stmt.getParamIndex(":name") !== undefined) {
    stmt.bind({ ":name": "alex" });
  }
}
async function main() {
  const sqlite3 = (await sqlite3InitModule({})) as Sqlite3Static;
  render(
    <SqlWidget
      sqlite3={sqlite3}
      prepareStatement={prepareStatement}
      extraCompletions={[{ label: "xxxxx" }]}
    />,
    document.getElementById("app")!
  );
  eachCode({ sqlite3, footerExtra: "" });
}
main();
