/**
 * Trash routes: report the size of <DSH_HOME>/session-trash and empty it.
 */
import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { guard, send } from '../http.js'
import { directorySize } from '../paths.js'
/**
 * Report the number and total size of the sessions waiting in the trash.
 *
 * @param req - incoming request, expected to be a GET.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
export async function handleTrashList(req, res) {
  if (!guard(req, res)) return undefined
  if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'method-not-allowed' })
  const home = process.env.DSH_HOME
  if (!home) return send(res, 500, { ok: false, error: 'missing-dsh-home' })
  const trash = join(home, 'session-trash')
  let entries
  try {
    entries = await readdir(trash, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === 'ENOENT') return send(res, 200, { ok: true, count: 0, bytes: 0 })
    return send(res, 500, { ok: false, error: 'scan-failed' })
  }
  let count = 0
  let bytes = 0
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    count += 1
    bytes += await directorySize(join(trash, entry.name))
  }
  return send(res, 200, { ok: true, count, bytes })
}

/**
 * Permanently remove every session directory in the trash.
 *
 * Only directories are touched, matching what `handleTrashList` counts; stray
 * files are left alone rather than reported as sessions.
 *
 * @param req - incoming request, expected to be a POST.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
export async function handleTrashClear(req, res) {
  if (!guard(req, res)) return undefined
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' })
  const home = process.env.DSH_HOME
  if (!home) return send(res, 500, { ok: false, error: 'missing-dsh-home' })
  const trash = join(home, 'session-trash')
  let entries
  try {
    entries = await readdir(trash, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === 'ENOENT') return send(res, 200, { ok: true, removed: 0 })
    return send(res, 500, { ok: false, error: 'scan-failed' })
  }
  let removed = 0
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      await rm(join(trash, entry.name), { recursive: true, force: true })
      removed += 1
    } catch {
      return send(res, 500, { ok: false, error: 'clear-failed', removed })
    }
  }
  return send(res, 200, { ok: true, removed })
}
