#!/usr/bin/env node
/* ==========================================================================
   Health check for The Goblin's Guide. Zero dependencies.

   Usage:            node scripts/check.mjs
   Healthy output:   ends with the line "ALL CHECKS PASSED"
   Unhealthy:        prints "FAIL:" lines and exits with code 1

   Every Claude session must run this before committing. If it fails,
   fix the failure — never delete or weaken a check to make it pass.
   ========================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (msg) => console.log("  ok: " + msg);

function load(file, varName) {
  const src = readFileSync(join(ROOT, file), "utf8");
  return new Function(src + `; return ${varName};`)();
}

// ---- 1. curated data ----
let PUBS = [];
try {
  PUBS = load("js/data.js", "PUBS");
  if (PUBS.length < 100) fail(`js/data.js: only ${PUBS.length} entries (expected 100+)`);
  const seen = new Set();
  for (const p of PUBS) {
    const where = `js/data.js entry "${p.name}"`;
    if (!p.name || typeof p.name !== "string") fail(`${where}: bad name`);
    if (!["pub", "bar"].includes(p.type)) fail(`${where}: type must be "pub" or "bar"`);
    if (!(p.lat > 51.2 && p.lat < 51.75 && p.lng > -0.6 && p.lng < 0.4))
      fail(`${where}: coordinates outside Greater London`);
    if (!(p.rating >= 3.0 && p.rating <= 5.0)) fail(`${where}: rating must be 3.0–5.0`);
    if (!Array.isArray(p.keywords) || p.keywords.length < 1) fail(`${where}: needs keywords`);
    if (!p.desc) fail(`${where}: needs a desc`);
    if (!p.area) fail(`${where}: needs an area`);
    const key = p.name + "|" + p.area;
    if (seen.has(key)) fail(`${where}: duplicate name+area`);
    seen.add(key);
  }
  ok(`js/data.js: ${PUBS.length} curated entries, all fields valid`);
} catch (e) {
  fail("js/data.js failed to load/parse: " + e.message);
}

// ---- 2. OSM data ----
try {
  const OSM = load("js/osm-data.js", "OSM_PUBS");
  if (OSM.length < 3000)
    fail(`js/osm-data.js: only ${OSM.length} entries — a refresh probably failed part-way. ` +
         `Restore with: git checkout js/osm-data.js`);
  let bad = 0;
  for (const p of OSM) {
    if (!p.name || !p.lat || !p.lng || !["pub", "bar"].includes(p.type)) bad++;
  }
  if (bad) fail(`js/osm-data.js: ${bad} malformed entries`);
  ok(`js/osm-data.js: ${OSM.length} OSM entries, all well-formed`);
} catch (e) {
  fail("js/osm-data.js failed to load/parse: " + e.message);
}

// ---- 3. app.js parses ----
try {
  new Function(readFileSync(join(ROOT, "js/app.js"), "utf8"));
  ok("js/app.js: parses as valid JavaScript");
} catch (e) {
  fail("js/app.js has a syntax error: " + e.message);
}

// ---- 4. index.html references resolve ----
try {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith("http") && !u.startsWith("data:"));
  for (const r of refs) {
    if (!existsSync(join(ROOT, r))) fail(`index.html references missing file: ${r}`);
  }
  for (const needed of ["js/app.js", "js/data.js", "js/osm-data.js", "vendor/leaflet/leaflet.js"]) {
    if (!html.includes(needed)) fail(`index.html no longer includes ${needed}`);
  }
  ok(`index.html: all ${refs.length} local references exist`);
} catch (e) {
  fail("index.html check failed: " + e.message);
}

// ---- 5. required elements the JS depends on ----
try {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  for (const id of ["map", "search", "near-list", "plan-panel", "plan-area", "plan-radius",
                    "tabbar", "result-count", "legend", "locate-btn", "near-status", "plan-results"]) {
    if (!html.includes(`id="${id}"`)) fail(`index.html missing element id="${id}" that js/app.js requires`);
  }
  ok("index.html: all element ids required by app.js are present");
} catch (e) {
  fail("element id check failed: " + e.message);
}

// ---- verdict ----
console.log("");
if (failures.length) {
  for (const f of failures) console.error("FAIL: " + f);
  console.error(`\n${failures.length} CHECK(S) FAILED`);
  process.exit(1);
}
console.log("ALL CHECKS PASSED");
