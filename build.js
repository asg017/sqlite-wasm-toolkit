import * as esbuild from "esbuild";
import { copyFileSync } from "node:fs";
esbuild.buildSync({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  minify: true,
  format: "esm",
  outdir: "dist",
  loader: {
    ".woff": "dataurl",
    ".otf": "dataurl",
  },
});
copyFileSync("src/sqlite3.wasm", "dist/sqlite3.wasm");
