/**
 * api.js — re-exports from client.js for backwards compatibility.
 * All pages that import { api } from "../api/api" continue to work.
 */
export { client as api } from "./client.js";
