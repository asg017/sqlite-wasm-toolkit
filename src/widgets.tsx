import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { PreparedStatement, Sqlite3Static, Database } from "src/sqlite3.mjs";
import { Editor } from "./editor";
import { Results } from "./results";
import "./styles.css";
import { Completion } from "@codemirror/autocomplete";
import { SQLiteContext } from "./context";

const initialCode = `select 1 + 1, 'hello!' as name, random();`;

export function SqlWidget(props: {
  db?: Database;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
  footerExtra?: string;
  extraCompletions?: Completion[];
  refresh?: EventTarget;
}) {
  const sqlite3 = useContext(SQLiteContext)!;
  if (!sqlite3) return <></>;

  const db = useMemo(
    () => props.db ?? new sqlite3.oo1.DB(":memory:"),
    [props.db]
  );
  const sqliteVersion = useMemo(() => sqlite3.capi.sqlite3_libversion(), []);
  const [commit, setCommit] = useState<string | null>(
    props.initialCode ?? initialCode
  );
  const [lastSubmit, setLastSubmit] = useState<number>(Date.now());

  useEffect(() => {
    if (props.refresh) {
      function onRefresh() {
        setLastSubmit(Date.now());
      }
      props.refresh.addEventListener("refresh", onRefresh);
      return () => props.refresh?.removeEventListener("refresh", onRefresh);
    }
  }, [props.refresh, setLastSubmit]);
  return (
    <div className="swt-sql-widget">
      <Editor
        initialCode={props.initialCode ?? initialCode}
        onCommit={(s) => {
          setLastSubmit(Date.now());
          setCommit(s);
        }}
        extraCompletions={props.extraCompletions}
        commit={commit}
      />
      {commit && (
        <div>
          <Results
            commit={commit!}
            db={db}
            lastSubmit={lastSubmit}
            prepareStatement={props.prepareStatement}
            footer={`SQLite WASM ${sqliteVersion}${props.footerExtra ?? ""}`}
          />
        </div>
      )}
    </div>
  );
}
