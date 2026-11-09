/**
 * Builds the browser half of the plugin.
 *
 * DSH loads a plugin's client code as one classic script through
 * `window.__ModuleLoader__`, and that loader cannot follow ES module imports
 * between files of a plugin. The sources therefore live in `src/client` and are
 * bundled here into the single `client.js` that the package ships.
 *
 * React and the DSH UI primitives stay external: the loader resolves them to
 * the instances the app already runs.
 */
import { build } from 'esbuild'
import { readFile, writeFile } from 'node:fs/promises'

const ENTRY = 'src/client/index.js'
const OUTPUT = 'client.js'

// The module id must match the package name: DSH resolves the client bundle of
// a plugin by that name, and the config slot is keyed by it as well.
const pkg = JSON.parse(await readFile('package.json', 'utf8'))

const result = await build({
  entryPoints: [ENTRY],
  bundle: true,
  format: 'iife',
  globalName: '__workspaceTree',
  platform: 'browser',
  target: ['chrome110'],
  external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
  define: { __PACKAGE_NAME__: JSON.stringify(pkg.name) },
  legalComments: 'none',
  write: false
})

const bundle = result.outputFiles[0].text.trimEnd()
const indented = bundle
  .split('\n')
  .map((line) => (line.length > 0 ? `      ${line}` : line))
  .join('\n')

const output = `/* Generated from src/client by build.mjs — do not edit directly. */
window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory(require) {
${indented}

    return __workspaceTree
  },
})
`

await writeFile(OUTPUT, output, 'utf8')

const bytes = Buffer.byteLength(output)
console.log(`built ${OUTPUT} (${bytes} bytes)`)
