import {
  Database,
  PreparedStatement,
  Sqlite3Static,
  SqlValue,
} from "src/sqlite3.mjs";

import { useEffect, useMemo, useReducer, useRef, useState } from "preact/hooks";
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
  const [showClipboard, setShowClipboard] = useState<boolean>(false);
  function onmousenter() {
    setShowClipboard(true);
  }
  function onmouseleave() {
    setShowClipboard(false);
  }
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
  return (
    <td onMouseEnter={onmousenter} onMouseLeave={onmouseleave}>
      <div className={"swt-cell-inner" + (showClipboard ? " active" : "")}>
        {inner}
      </div>
      {showClipboard && <CopyButton value={value} />}
    </td>
  );
}

function CopyButton(props: { value: SqlValue }) {
  const { value } = props;
  const [showMessage, setShowMessage] = useState<boolean>(false);
  return (
    <div className="swt-cell-copy cpy-msg">
      {showMessage ? (
        <div style="position: absolute; bottom: -.2rem; left: 50%; transform: translateX(-50%); font-size: .7rem;">
          Copied!
        </div>
      ) : null}
      <button
        onClick={() => {
          if (value === null) navigator.clipboard.writeText("");
          else navigator.clipboard.writeText(value.toString());
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 500);
        }}
      >
        📋
      </button>
    </div>
  );
}

// @ts-ignore
import { Inspector } from "@observablehq/inspector";

function InspectJson(props: { data: string }) {
  const parsed = useMemo(() => JSON.parse(props.data), [props.data]);
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
  sqlite3: Sqlite3Static;
  prepareStatement?: (statement: PreparedStatement) => void;
  footer: string;
}) {
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
            const value = props.sqlite3.capi.sqlite3_column_value(stmt, i);
            const subtype = props.sqlite3.capi.sqlite3_value_subtype(value);
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
        {" row" + (rows.length > 1 ? "s" : "")} in{" "}
        {prettyMilliseconds(elapsed, { millisecondsDecimalDigits: 2 })}
      </span>
    );
    body = (
      <div style="width: 100%;">
        <table className="swt-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th>
                  <div style="resize: horizontal;  overflow: auto;">
                    {column}
                  </div>
                </th>
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
      <div>
        <span style="font-family: monospace; padding: 4px 12px;">
          {state.error!.error.message}
        </span>
      </div>
    );

  return (
    <div>
      {body}
      <div style="border-top: 1px solid #cecece; display: flex; justify-content: space-between; font-size: 14px; padding: 2px 4px;font-style: italic;">
        <div>{props.footer}</div>
        <div style="text-align: right;">{footer}</div>
      </div>
    </div>
  );
}
