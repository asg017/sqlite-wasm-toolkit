import * as esbuild from "esbuild";
import { copyFileSync } from "node:fs";

async function main() {
  const result = esbuild.buildSync({
    entryPoints: ["src/full.tsx", "src/plugin.tsx"],
    outdir: "dist",
    bundle: true,
    minify: true,
    format: "esm",
    loader: {
      ".woff": "dataurl",
      ".woff2": "dataurl",
      ".otf": "dataurl",
    },
    jsxFactory: "h",
    jsxFragment: "Fragment",
    treeShaking: false,
  });
  console.log(result);
  copyFileSync("src/sqlite3.wasm", "dist/sqlite3.wasm");
}

main();
