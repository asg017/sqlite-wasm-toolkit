import { createContext } from "preact";
import { Sqlite3Static } from "src/sqlite3.mjs";
export const SQLiteContext = createContext<Sqlite3Static | null>(null);
