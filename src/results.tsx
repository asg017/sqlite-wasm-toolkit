import {
  Database,
  PreparedStatement,
  Sqlite3Static,
  SqlValue,
} from "src/sqlite3.mjs";

import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "preact/hooks";
import prettyMilliseconds from "pretty-ms";

interface ExecutionResult {
  rows: [SqlValue, number][][];
  columns: string[];
  elapsed: number;
}
interface ExecutionError {
  error: Error;
}
interface State {
  loading: boolean;
  results?: ExecutionResult;
  error?: ExecutionError;
}

type Action =
  | { type: "init" }
  | { type: "success"; results: ExecutionResult }
  | { type: "failure"; error: ExecutionError };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return { ...state, loading: true };
    case "failure":
      return {
        ...state,
        loading: false,
        error: action.error,
        results: undefined,
      };
    case "success":
      return {
        ...state,
        loading: false,
        results: action.results,
        error: undefined,
      };
  }
}

function TableCell(props: { value: SqlValue; subtype: number }) {
  const { value, subtype } = props;
  let inner;
  if (value === null) {
    inner = <span className="swt-cell-null">NULL</span>;
  } else if (value instanceof Uint8Array) {
    inner = (
      <span className="swt-cell-blob">
        {"Blob<"}
        {value.byteLength}
        {">"}
      </span>
    );
  } else if (typeof value === "string")
    if (subtype === 74)
      inner = (
        <span>
          <InspectJson data={value} />
        </span>
      );
    else inner = <span className="swt-cell-string">{props.value}</span>;
  else if (typeof value === "number")
    inner = <span className="swt-cell-number">{props.value}</span>;
  else if (typeof value === "bigint")
    inner = <span className="swt-cell-number">{props.value}</span>;
  else inner = <span className="swt-cell-unknown">Unknown</span>;
  return <td>{inner}</td>;
}

// @ts-ignore
import { Inspector } from "@observablehq/inspector";
import { SQLiteContext } from "./context";

function InspectJson(props: { data: string }) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(props.data);
    } catch {
      return props.data;
    }
  }, [props.data]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const i = new Inspector(root);
    i.fulfilled(parsed);
    return () => {
      while (root.lastChild) root.removeChild(root.lastChild);
    };
  }, [ref, parsed]);
  return <div ref={ref}></div>;
}

export function Results(props: {
  commit: string;
  db: Database;
  lastSubmit: number;
  prepareStatement?: (statement: PreparedStatement) => void;
  footer: string;
}) {
  const sqlite3 = useContext(SQLiteContext)!;
  const [state, dispatch] = useReducer<State, Action>(reducer, {
    loading: true,
  });
  useEffect(() => {
    dispatch({ type: "init" });

    const start = performance.now();
    try {
      const stmt = props.db.prepare(props.commit);
      if (props.prepareStatement) {
        props.prepareStatement(stmt);
      }
      const columns = stmt.getColumnNames();
      const rows: [SqlValue, number][][] = [];
      while (stmt.step()) {
        rows.push(
          columns.map((_, i) => {
            const value = sqlite3.capi.sqlite3_column_value(stmt, i);
            const subtype = sqlite3.capi.sqlite3_value_subtype(value);
            return [stmt.get(i), subtype];
          })
        );
      }
      const elapsed = performance.now() - start;
      dispatch({ type: "success", results: { rows, columns, elapsed } });
    } catch (error) {
      dispatch({
        type: "failure",
        error: { error: error as Error },
      });
    }
  }, [props.commit, props.db, props.lastSubmit, props.prepareStatement]);

  let body;
  let footer;
  if (state.loading) body = <div>Loading...</div>;
  else if (state.results) {
    const { columns, rows, elapsed } = state.results;
    footer = (
      <span>
        {rows.length}
        {" row" + (rows.length > 1 ? "s" : "")}, {columns.length}
        {" column" + (columns.length > 1 ? "s" : "")} in{" "}
        {prettyMilliseconds(elapsed, { millisecondsDecimalDigits: 2 })}
      </span>
    );
    body = (
      <div className="swt-table">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                {row.map((value) => (
                  <TableCell value={value[0]} subtype={value[1]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else
    body = (
      <div className="swt-error">
        <span>{state.error!.error.message}</span>
      </div>
    );

  return (
    <div>
      {body}
      <div className="swt-results-footer">
        <div>{footer}</div>
        <div style="display: flex; align-items: center; justify-contents: space-around; grid-gap: 10px;">
          <div>{props.footer}</div>
        </div>
      </div>
    </div>
  );
}

function Copy() {
  return (
    <button style="background: none; padding: 1px 4px; margin: 0; border: 1px solid #c3c3c4; border-radius: 4px; cursor: pointer;">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        fill="currentColor"
        class="bi bi-copy"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
        />
      </svg>
    </button>
  );
}
function Info() {
  return (
    <button style="background: none; padding: 1px 4px; margin: 0; border: 1px solid #c3c3c4; border-radius: 4px; cursor: pointer;">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        fill="currentColor"
        class="bi bi-info-circle"
        viewBox="0 0 16 16"
      >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
      </svg>
    </button>
  );
}
