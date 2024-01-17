import { useMemo, useState } from "preact/hooks";
import { PreparedStatement, Sqlite3Static } from "src/sqlite3.mjs";
import { Editor } from "./editor";
import { Results } from "./results";
import "./styles.css";
import { Completion } from "@codemirror/autocomplete";
const initialCode = `select 1 + 1, 'hello!' as name;`;

export function SqlWidget(props: {
  sqlite3: Sqlite3Static;
  initialCode?: string;
  prepareStatement?: (statement: PreparedStatement) => void;
  footerExtra?: string;
  extraCompletions?: Completion[];
}) {
  const db = useMemo(() => new props.sqlite3.oo1.DB(":memory:"), []);
  const sqliteVersion = useMemo(
    () => props.sqlite3.capi.sqlite3_libversion(),
    []
  );
  const [commit, setCommit] = useState<string | null>(
    props.initialCode ?? initialCode
  );
  const [lastSubmit, setLastSubmit] = useState<number>(Date.now());

  return (
    <div style="border: 1px solid #777; border-radius: 4px;">
      <Editor
        initialCode={props.initialCode ?? initialCode}
        onCommit={(s) => {
          setLastSubmit(Date.now());
          setCommit(s);
        }}
        extraCompletions={props.extraCompletions}
      />
      {commit && (
        <div>
          <Results
            commit={commit!}
            db={db}
            lastSubmit={lastSubmit}
            sqlite3={props.sqlite3}
            prepareStatement={props.prepareStatement}
            footer={`SQLite ${sqliteVersion}${props.footerExtra ?? ""}`}
          />
        </div>
      )}
    </div>
  );
}
