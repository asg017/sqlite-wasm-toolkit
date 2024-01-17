import * as esbuild from "esbuild";
import { copyFileSync } from "node:fs";

async function main() {
  esbuild.buildSync({
    entryPoints: ["src/full.tsx", "src/plugin.tsx"],
    outdir: "dist",
    bundle: true,
    minify: true,
    format: "esm",
    loader: {
      ".woff": "dataurl",
      ".otf": "dataurl",
    },
  });
  copyFileSync("src/sqlite3.wasm", "dist/sqlite3.wasm");
}

main();
