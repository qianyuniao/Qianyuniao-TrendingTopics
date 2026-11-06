// Post-build step: expose the bundled Nitro worker as a Cloudflare Pages
// Functions catch-all so the server-side API (/api/*) actually runs on Pages.
//
// Cloudflare Pages (Git-connected) only runs Pages Functions from a `functions/`
// directory in the build output — a single `_worker.js` file is NOT picked up by
// Git builds. So we emit `functions/[[path]].js`.
//
// IMPORTANT: we PRE-BUNDLE the Nitro worker (rollup) into that single file so it
// is fully self-contained. If instead we `import` the worker (e.g.
// `../_worker.js/index.js`), Cloudflare's own Pages Functions esbuild step tries
// to resolve/bundle the huge Nitro worker and the build fails. Pre-bundling here
// avoids that entirely.
//
// The Vite/Nitro build (with CF_PAGES=1, set automatically by Cloudflare Pages)
// emits the worker as a *directory*: dist/output/public/_worker.js/index.js (+chunks).
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"
import { rollup } from "rollup"

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

// Temp entry that wraps the Nitro worker as a Pages Functions request handler.
const entry = join(pub, "_fn-entry.mjs")
writeFileSync(
  entry,
  `import worker from ${JSON.stringify(workerEntry)};\n`
  + `export const onRequest = async (ctx) => worker.fetch(ctx.request, ctx.env, ctx);\n`,
)

const outFile = join(fdir, "[[path]].js")
mkdirSync(fdir, { recursive: true })

console.log("[make-functions] bundling Nitro worker into", outFile)
const bundle = await rollup({
  input: entry,
  onwarn(warning, warn) {
    // Bundled deps (unenv polyfills) can trigger these; not fatal.
    if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "EVAL") return
    warn(warning)
  },
})
await bundle.write({
  file: outFile,
  format: "es",
  inlineDynamicImports: true,
  exports: "named",
})
await bundle.close()

// Cleanup: the temp entry and the original _worker.js directory are no longer needed
// (the function file is now self-contained).
rmSync(entry, { force: true })
rmSync(join(pub, "_worker.js"), { recursive: true, force: true })

const sizeKb = Math.round(existsSync(outFile) ? statSync(outFile).size / 1024 : 0)

console.log(`[make-functions] wrote self-contained Pages Function: ${outFile} (${sizeKb} KB)`)
