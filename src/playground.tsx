import { SqlWidget } from "./widgets.tsx";
import { Database } from "src/sqlite3.mjs";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { SQLiteContext } from "./context.ts";

import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js";
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js";
import SlTreeItem from "@shoelace-style/shoelace/dist/react/tree-item/index.js";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/"
);

function DBSource(props: { setDb: (db: Database) => void }) {
  const sqlite3 = useContext(SQLiteContext)!;
  const [url, setUrl] = useState(
    "https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite"
  );
  useEffect(() => {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((body) => {
        const p = sqlite3.wasm.allocFromTypedArray(body);
        const db = new sqlite3.oo1.DB();
        const rc = sqlite3.capi.sqlite3_deserialize(
          // @ts-ignore
          db.pointer,
          "main",
          p,
          body.byteLength,
          body.byteLength,
          sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
          // Optionally:
          // | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
        );
        db.checkRc(rc);
        props.setDb(db);
      });
  }, []);
  return (
    <div>
      <input
        type="text"
        value={url}
        //@ts-ignore
        onInput={(e) => setUrl(e.target.value)}
      />
    </div>
  );
}
function Schema(props: { db: Database }) {
  const schema = useMemo(() => {
    const x = props.db.exec(
      `
      select
        name,
        (
          select json_group_array(
            json_object(
              'name', name,
              'type', type,
              'notnull', [notnull],
              'dflt_value', dflt_value,
              'pk', pk
            )
          )
          from pragma_table_info(sqlite_master.name)
        ) as columns,
        (
          select json_group_array(
            json_object(
              'to_table', [table],
              'xxx_from', [from],
              'to_column', [to]
            )
          )
          from pragma_foreign_key_list(sqlite_master.name)
        ) as foreign_keys
      from sqlite_master
      where type = 'table'
      `,
      {
        returnValue: "resultRows",
        rowMode: "object",
      }
    );
    console.log(x);
    return x.map((d) => ({
      ...d,
      name: d.name as string,
      columns: JSON.parse(d.columns as any) as {
        name: string;
        pk: number;
        type: string;
      }[],
    }));
  }, [props.db]);
  return (
    <div style="max-height:600px; overflow-y: auto;">
      <SlTree style={{ "--indent-guide-width": "1px", "--indent-size": "0px" }}>
        {schema.map((table) => (
          <SlTreeItem>
            <SlIcon name="table" />

            {table.name}

            {table.columns.map((c) => (
              <SlTreeItem>
                {c.pk ? <SlIcon name="key" /> : <SlIcon name="dot" />}
                <div style="display: flex; justify-content: space-between; align-items: center; width: 200px;">
                  <div>{c.name}</div>
                  <div style="font-size: 10px;">{c.type}</div>
                </div>
              </SlTreeItem>
            ))}
          </SlTreeItem>
        ))}
      </SlTree>
    </div>
  );
}
export function Playground() {
  const sqlite3 = useContext(SQLiteContext)!;
  const [db, setDb] = useState<Database>(
    useMemo(() => new sqlite3.oo1.DB(), [])
  );
  return (
    <div>
      <SlButton variant="danger">Help me</SlButton>
      <DBSource setDb={setDb} />
      <div style="display: grid; grid-template-columns: 300px minmax(0, 1fr);">
        <Schema db={db} />
        <SqlWidget db={db} initialCode="select * from Customer;" />
      </div>
    </div>
  );
}
