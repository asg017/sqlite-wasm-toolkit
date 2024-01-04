src/vendor/sqlite3.mjs:
	cp src/sqlite-wasm-3440000/jswasm/sqlite3-bundler-friendly.mjs $@

src/vendor/sqlite3.wasm:
	cp src/sqlite-wasm-3440000/jswasm/sqlite3.wasm $@

src/sqlite3-opfs-async-proxy.js:
	cp src/sqlite-wasm-3440000/jswasm/sqlite3-opfs-async-proxy.js $@

all: src/vendor/sqlite3.mjs src/vendor/sqlite3.wasm src/sqlite3-opfs-async-proxy.js
