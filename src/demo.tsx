import { render } from "preact";
import { SqlWidget } from "./widgets.tsx";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";
import { default as sqlite3InitModule } from "./sqlite3.mjs";
import { eachCode } from "./plugin.tsx";
import { Playground } from "./playground.tsx";
import { SQLiteContext } from "./context.ts";

function prepareStatement(stmt: PreparedStatement) {
  if (stmt.getParamIndex(":name") !== undefined) {
    stmt.bind({ ":name": "alex" });
  }
}
async function main() {
  const sqlite3 = (await sqlite3InitModule({})) as Sqlite3Static;
  render(
    <SQLiteContext.Provider value={sqlite3}>
      {/*<Playground />*/}
      <SqlWidget
        prepareStatement={prepareStatement}
        extraCompletions={[{ label: "xxxxx" }]}
      />
    </SQLiteContext.Provider>,
    document.getElementById("app")!
  );
  eachCode({ sqlite3, footerExtra: "" });
}
main();
