/**
 * Locale audit: every key defined in `src/client/i18n.js` must be referenced by
 * some source file, and every `t('…')` call must resolve to a defined key.
 *
 * Run with `npm run audit:i18n`. Exits non-zero on any finding, so CI (or a
 * pre-commit hook) can enforce it.
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = join(import.meta.dirname, '..')
const client = join(root, 'src', 'client')
const dictionary = join(client, 'i18n.js')

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (entry.name.endsWith('.js')) files.push(path)
  }
  return files
}

const files = await walk(client)
const sources = new Map()
for (const file of files) {
  sources.set(file, await readFile(file, 'utf8'))
}

const declared = sources.get(dictionary) ?? ''
const defined = [...declared.matchAll(/^\s+'([a-z]+\.[A-Za-z]+)':/gm)].map((match) => match[1])
const keys = [...new Set(defined)]

const usage = []
const literals = new Set()
for (const [file, source] of sources) {
  if (file === dictionary) continue
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  for (const match of text.matchAll(/\bt\(\s*'([^']+)'\s*\)/g)) {
    usage.push({ file: relative(root, file), key: match[1] })
  }
  // Keys can also reach `t` through a variable, e.g. a key chosen per error code.
  for (const match of text.matchAll(/'([a-z]+\.[A-Za-z]+)'/g)) literals.add(match[1])
}

const used = new Set([...usage.map((item) => item.key), ...literals])
const findings = []

for (const key of keys) {
  if (!used.has(key)) findings.push(`unused key: ${key}`)
}
for (const item of usage) {
  if (!keys.includes(item.key)) findings.push(`missing key: ${item.key} (${item.file})`)
}

if (findings.length === 0) {
  console.log(`i18n ok — ${keys.length} keys, ${usage.length} call sites`)
} else {
  for (const finding of findings) console.error(finding)
  process.exitCode = 1
}
