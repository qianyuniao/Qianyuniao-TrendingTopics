// Post-build step: expose the bundled Nitro worker as a Cloudflare Pages
// Functions catch-all so the server-side API (/api/*) actually runs on Pages.
//
// The Vite/Nitro build (with CF_PAGES=1) emits the worker as
// dist/output/public/_worker.js (a file or a directory). This script drops a
// `functions/[[path]].js` next to it that forwards every request to the worker.
// Pages Functions compiles `functions/` and runs it for all routes.
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const pub = join(process.cwd(), "dist", "output", "public")
const fdir = join(pub, "functions")

if (!existsSync(join(pub, "_worker.js"))) {
  console.warn(
    "[make-functions] No _worker.js found in build output — skipping. "
    + "Run the build with CF_PAGES=1 (Cloudflare Pages sets this automatically).",
  )
  process.exit(0)
}

mkdirSync(fdir, { recursive: true })
const out = join(fdir, "[[path]].js")
writeFileSync(
  out,
  `import worker from "../_worker.js";

// Pages Functions catch-all: forward every request to the bundled Nitro worker.
// The worker serves static assets via its ASSETS binding and runs Nitro API
// routes (e.g. /api/hotboard) for everything else.
export const onRequest = async (ctx) => {
  return worker.fetch(ctx.request, ctx.env, ctx);
};
`,
)
console.log("[make-functions] wrote", out)
