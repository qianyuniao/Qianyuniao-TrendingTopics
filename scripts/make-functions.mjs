// Post-build step: expose the bundled Nitro worker as a Cloudflare Pages
// Functions catch-all so the server-side API (/api/*) actually runs on Pages.
//
// Cloudflare Pages (Git-connected) only runs Pages Functions from a `functions/`
// directory in the build output — a single `_worker.js` file is NOT picked up by
// Git builds (that mode is for `wrangler pages deploy`). So we drop a
// `functions/[[path]].js` that forwards every request to the Nitro worker.
//
// The Vite/Nitro build (with CF_PAGES=1) emits the worker as a *directory*:
//   dist/output/public/_worker.js/index.js  (+ chunks/)
// We must import the entry FILE (`_worker.js/index.js`), NOT the directory — a
// directory import fails esbuild and breaks the Pages Functions build.
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const pub = join(process.cwd(), "dist", "output", "public")
const workerEntry = join(pub, "_worker.js", "index.js")
const fdir = join(pub, "functions")

if (!existsSync(workerEntry)) {
  console.warn(
    "[make-functions] No _worker.js/index.js found in build output — skipping. "
    + "Run the build with CF_PAGES=1 (Cloudflare Pages sets this automatically).",
  )
  process.exit(0)
}

mkdirSync(fdir, { recursive: true })
const out = join(fdir, "[[path]].js")
writeFileSync(
  out,
  `import worker from "../_worker.js/index.js";

// Pages Functions catch-all: forward every request to the bundled Nitro worker.
// The worker serves static assets via its ASSETS binding and runs Nitro API
// routes (e.g. /api/hotboard) for everything else.
export const onRequest = async (ctx) => {
  return worker.fetch(ctx.request, ctx.env, ctx);
};
`,
)
console.log("[make-functions] wrote", out)
