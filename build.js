import * as esbuild from "esbuild";
import { copyFileSync } from "node:fs";

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/full.tsx", "src/slim.tsx"],
    outdir: "dist",
    bundle: true,
    minify: true,
    format: "esm",
    loader: {
      ".woff": "dataurl",
      ".otf": "dataurl",
    },
  });

  await ctx.watch();
  copyFileSync("src/sqlite3.wasm", "dist/sqlite3.wasm");
}

main();
