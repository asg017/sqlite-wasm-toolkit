import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";
import libAssetsPlugin from "@laynezh/vite-plugin-lib-assets";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), libAssetsPlugin({ include: "**/*.wasm*" })],
  build: {},
  assetsInclude: ["**/*.woff", "**/*.otf"],
});
