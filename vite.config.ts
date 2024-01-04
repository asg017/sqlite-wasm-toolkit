import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";
import libAssetsPlugin from "@laynezh/vite-plugin-lib-assets";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), libAssetsPlugin({ include: "**/*.wasm*" })],
  build: {
    lib: {
      entry: {
        full: new URL("./src/index.tsx", import.meta.url).pathname,
        slim: new URL("./src/index-min.tsx", import.meta.url).pathname,
      },
      name: "sqlite3-wasm-toolkit",
      fileName: (format, entryname) => `${entryname}.js`, //"sqlite3-wasm-toolkit",
      formats: ["es"],
    },
  },
  assetsInclude: ["**/*.woff", "**/*.otf"],
});
