import { useEffect, useRef } from "preact/hooks";
import { basicSetup, EditorView } from "codemirror";
import { sql, SQLDialect } from "@codemirror/lang-sql";
import { keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import {
  CompletionContext,
  CompletionResult,
  Completion,
  autocompletion,
} from "@codemirror/autocomplete";

// the SQLite dialect provided by Codemirror is a bit rough on the edges, so here's an improved version
const SQLite = SQLDialect.define({
  // Based on https://www.sqlite.org/lang_keywords.html based on likely keywords to be used in select queries
  // https://github.com/simonw/datasette/pull/1893#issuecomment-1316401895:
  keywords: `and as asc between by case cast count create current_date current_time current_timestamp desc distinct each else escape except exists explain filter first for from full generated group having if in index inner intersect into isnull join last left like limit not null or order outer over pragma primary query raise range regexp right rollback row select set table then to union unique using values view virtual when with where
    foreign key references temporary`,
  // https://www.sqlite.org/datatype3.html
  types:
    "null integer real text blob json jsonb boolean bool date datetime float",
  operatorChars: "*+-%<>!=&|/~",
  identifierQuotes: '`"',
  specialVar: "@:?$",
});

function autocompleteFor(
  completions: Completion[]
): (context: CompletionContext) => CompletionResult | null {
  return function (context) {
    let word = context.matchBefore(/\w*/);
    if (!word || (word.from == word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: completions,
    };
  };
}

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.meta, color: "#404740" },
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.heading, textDecoration: "underline", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  {
    tag: tags.keyword,
    color: "var(--swt-code-keyword)",
    fontFamily: "MonaspaceNeon-SemiBold",
  },
  {
    tag: [
      tags.atom,
      tags.bool,
      tags.url,
      tags.contentSeparator,
      tags.labelName,
    ],
    color: "#219",
  },
  { tag: tags.inserted, color: "#164" },
  { tag: tags.deleted, color: "#a11" },
  { tag: tags.literal, color: "var(--swt-code-literal)" },
  { tag: tags.string, color: "var(--swt-code-string)" },
  {
    tag: [tags.regexp, tags.escape, /*@__PURE__*/ tags.special(tags.string)],
    color: "red",
  },
  { tag: /*@__PURE__*/ tags.definition(tags.variableName), color: "#00f" },
  { tag: /*@__PURE__*/ tags.local(tags.variableName), color: "#30a" },
  { tag: [tags.typeName, tags.namespace], color: "var(--swt-code-types)" },
  { tag: tags.className, color: "#167" },
  {
    tag: [/*@__PURE__*/ tags.special(tags.variableName), tags.macroName],
    color: "#256",
  },
  {
    tag: [tags.special(tags.string)],
    color: "var(--swt-code-identifier)",
  },
  {
    tag: [tags.special(tags.name)],
    color: "var(--swt-code-params)",
  },
  { tag: /*@__PURE__*/ tags.definition(tags.propertyName), color: "#00c" },
  {
    tag: tags.comment,
    color: "var(--swt-code-comment)",
    fontFamily: "MonaspaceNeon-LightItalic",
  },
  { tag: tags.invalid, color: "#f00" },
]);

export function Editor(props: {
  initialCode: string;
  onCommit: (value: string) => void;
  extraCompletions?: Completion[];
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | undefined>(undefined);

  useEffect(() => {
    if (!editorRef.current) return;
    let extraCompletions;

    if (props.extraCompletions)
      extraCompletions = SQLite.language.data.of({
        autocomplete: autocompleteFor(props.extraCompletions),
      });

    const extensions = [
      keymap.of([
        {
          key: "Shift-Enter",
          run: function () {
            props.onCommit(view.state.doc.toString());
            return true;
          },
        },
      ]),
      basicSetup,
      EditorView.lineWrapping,
      sql({ dialect: SQLite }),
      syntaxHighlighting(myHighlightStyle),
    ];
    if (extraCompletions)
      extensions.push(
        extraCompletions,
        autocompletion({ selectOnOpen: false })
      );

    const view = new EditorView({
      parent: editorRef.current,
      doc: props.initialCode,
      extensions,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = undefined;
    };
  }, [editorRef]);

  return (
    <div className="swt-editor">
      <div style="position: relative;">
        <div ref={editorRef} />
        <div style="position: absolute; right: 4px; transform: translateY(-100%)">
          <button
            className="submit"
            onClick={() => {
              if (viewRef.current)
                props.onCommit(viewRef.current.state.doc.toString());
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
