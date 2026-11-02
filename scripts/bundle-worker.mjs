// Post-build step: Cloudflare Pages (Git-connected) only runs a worker when the
// build output contains a SINGLE-FILE `_worker.js`. Nitro's cloudflare-pages
// preset emits `_worker.js` as a *directory* (index.js + chunks), which Pages
// does NOT activate — so /api/* falls back to the SPA HTML and the frontend
// crashes. This script bundles that directory into one `_worker.js` file that
// Pages will run as the Pages Function.
//
// If CF_PAGES is not set during the build (so Nitro produced a node-server
// output instead), this script is a no-op.
import { existsSync, renameSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"
import { rollup } from "rollup"

const pub = join(process.cwd(), "dist", "output", "public")
const workerDir = join(pub, "_worker.js")
const workerEntry = join(workerDir, "index.js")
const bundleFile = join(pub, "_worker.bundle.mjs")
const workerFile = join(pub, "_worker.js")

if (!existsSync(workerEntry)) {
  console.warn(
    "[bundle-worker] No _worker.js/index.js found in build output — skipping. "
    + "Run the build with CF_PAGES=1 (Cloudflare Pages sets this automatically).",
  )
  process.exit(0)
}

console.log("[bundle-worker] bundling", workerEntry)
const bundle = await rollup({
  input: workerEntry,
  onwarn(warning, warn) {
    // Bundled deps (unenv polyfills) can trigger these; not fatal.
    if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "EVAL") return
    warn(warning)
  },
})
await bundle.write({
  file: bundleFile,
  format: "es",
  inlineDynamicImports: true,
  exports: "named",
})
await bundle.close()

// Replace the `_worker.js` directory with the single-file worker.
rmSync(workerDir, { recursive: true, force: true })
renameSync(bundleFile, workerFile)

// Remove any functions/ dir — the single _worker.js is what Pages will run.
rmSync(join(pub, "functions"), { recursive: true, force: true })

const sizeKb = Math.round(existsSync(workerFile) ? (statSync(workerFile).size / 1024) : 0)
console.log(`[bundle-worker] wrote single-file worker: ${workerFile} (${sizeKb} KB)`)
