import { cp, mkdir, readdir, rename, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Host half of the Workspace Tree plugin.
 *
 * DeepSeek Harness exposes no session deletion API: `sessionPersistence` is
 * append-only and `sessionController` only archives. A real delete therefore
 * has to touch the filesystem, so this half owns a small, exact-path HTTP
 * surface:
 *
 * - move the session directory into `<DSH_HOME>/session-trash`
 * - drop the session projection cache so the session does not reappear
 * - pick a model for a freshly created session
 * - report and empty the trash directory
 */

const DELETE_ROUTE = '/workspace-tree/sessions/delete'
const MODEL_ROUTE = '/workspace-tree/sessions/model'
const TRASH_ROUTE = '/workspace-tree/trash'
const TRASH_CLEAR_ROUTE = '/workspace-tree/trash/clear'

/** Canonical session id: `session-<uuid>`. */
const SESSION_ID = /^session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Upper bound for request bodies; every route here accepts one session id. */
const MAX_BODY = 4096

export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: DELETE_ROUTE,
      handler: (req, res) => handleDelete(ctx, req, res),
    }),
  )
  // A blank session created from the sidebar has no model yet, and sending the
  // first prompt fails without one. The Host picks one from the account catalog.
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: MODEL_ROUTE,
      handler: (req, res) => handleModel(ctx, req, res),
    }),
  )
  // Both routes operate on the single trash directory owned by this plugin.
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: TRASH_ROUTE,
      handler: (req, res) => handleTrashList(req, res),
    }),
  )
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: TRASH_CLEAR_ROUTE,
      handler: (req, res) => handleTrashClear(req, res),
    }),
  )
}

/**
 * Move one session out of the active store.
 *
 * @param ctx - the plugin context, used for the live session lookup.
 * @param req - incoming request carrying `{ sessionId }`.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
async function handleDelete(ctx, req, res) {
  if (!guard(req, res)) return undefined
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' })
  let body
  try {
    body = await readJson(req)
  } catch {
    return send(res, 400, { ok: false, error: 'bad-body' })
  }
  const sessionId = body && body.sessionId
  if (typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)) {
    return send(res, 400, { ok: false, error: 'bad-session-id' })
  }
  const home = process.env.DSH_HOME
  if (!home) return send(res, 500, { ok: false, error: 'missing-dsh-home' })
  // An open session keeps appending to its log; removing the directory under it
  // breaks the current page, so the caller has to close the session first.
  if (isOpen(ctx, sessionId)) return send(res, 409, { ok: false, error: 'session-open' })
  let source
  try {
    source = await findSessionDir(sessionsRoot(ctx, home), sessionId)
  } catch {
    return send(res, 500, { ok: false, error: 'scan-failed' })
  }
  if (!source) return send(res, 404, { ok: false, error: 'not-found' })
  const target = join(home, 'session-trash', sessionId + '-' + Date.now())
  try {
    await mkdir(join(home, 'session-trash'), { recursive: true })
    await moveDirectory(source, target)
  } catch {
    return send(res, 500, { ok: false, error: 'move-failed' })
  }
  // The cache is derived data: a stale entry costs a rebuild, a failed cleanup
  // must not turn a successful move into an error response.
  const cacheRemoved = await purgeProjectionCache(home, sessionId)
  return send(res, 200, { ok: true, movedTo: target, cacheRemoved })
}

/**
 * Select a model for a session that has none yet.
 *
 * @param ctx - the plugin context, used to reach `sessionController`.
 * @param req - incoming request carrying `{ sessionId }`.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
async function handleModel(ctx, req, res) {
  if (!guard(req, res)) return undefined
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method-not-allowed' })
  let body
  try {
    body = await readJson(req)
  } catch {
    return send(res, 400, { ok: false, error: 'bad-body' })
  }
  const sessionId = body && body.sessionId
  if (typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)) {
    return send(res, 400, { ok: false, error: 'bad-session-id' })
  }
  const controller = ctx.get('sessionController')
  if (!controller || typeof controller.selectModel !== 'function') {
    return send(res, 500, { ok: false, error: 'missing-session-controller' })
  }
  let pick
  try {
    pick = await pickModel(controller)
  } catch {
    return send(res, 500, { ok: false, error: 'catalog-failed' })
  }
  if (!pick) return send(res, 500, { ok: false, error: 'no-model' })
  let result
  try {
    result = await controller.selectModel({
      sessionId,
      provider: pick.provider,
      model: pick.model,
    })
  } catch (error) {
    const message = error && error.message ? String(error.message) : 'select-failed'
    return send(res, 500, { ok: false, error: 'select-failed', message })
  }
  // `selectModel` reports a rejected selection in the result instead of throwing.
  if (result && result.ok === false) {
    const error = result.error || {}
    return send(res, 500, {
      ok: false,
      error: 'select-failed',
      message: error.message ? String(error.message) : 'select-failed',
    })
  }
  return send(res, 200, { ok: true, provider: pick.provider, model: pick.model })
}

/**
 * Pick the default model from the catalog, falling back to the first entry.
 *
 * @param controller - the session controller exposing `modelCatalog()`.
 * @returns `{ provider, model }`, or `null` when the catalog is empty.
 */
async function pickModel(controller) {
  const catalog = await controller.modelCatalog()
  const groups = catalog && Array.isArray(catalog.groups) ? catalog.groups : []
  const listed = []
  for (const group of groups) {
    const models = group && Array.isArray(group.models) ? group.models : []
    for (const item of models) {
      if (item && item.id) listed.push({ provider: group.id, model: item.id })
    }
  }
  const fallback = catalog && catalog.default
  const match =
    fallback &&
    listed.find((one) => one.provider === fallback.provider && one.model === fallback.model)
  return match || listed[0] || null
}

/**
 * Report the number and total size of the sessions waiting in the trash.
 *
 * @param req - incoming request, expected to be a GET.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
async function handleTrashList(req, res) {
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
async function handleTrashClear(req, res) {
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

/**
 * Sum the size of a directory tree without following symbolic links.
 *
 * @param root - absolute directory path.
 * @returns the total size in bytes; unreadable entries count as zero.
 */
async function directorySize(root) {
  let total = 0
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return total
  }
  for (const entry of entries) {
    // A symlink can point outside the trash or back into the tree; skip it.
    if (entry.isSymbolicLink()) continue
    const path = join(root, entry.name)
    if (entry.isDirectory()) {
      total += await directorySize(path)
      continue
    }
    try {
      total += (await stat(path)).size
    } catch {
      // A file that vanished between readdir and stat contributes nothing.
    }
  }
  return total
}

/**
 * Resolve the directory that holds the per-project session directories.
 *
 * The JSONL backend keeps its root configurable; fall back to the documented
 * default when the service is absent.
 *
 * @param ctx - the plugin context.
 * @param home - the resolved `DSH_HOME`.
 * @returns the absolute sessions root.
 */
function sessionsRoot(ctx, home) {
  const persistence = ctx.get('sessionPersistence')
  const root = persistence && typeof persistence.root === 'string' ? persistence.root : ''
  return root || join(home, 'sessions')
}

/**
 * Drop the projection cache entry that belongs to a removed session.
 *
 * @param home - the resolved `DSH_HOME`.
 * @param sessionId - the removed session id.
 * @returns whether the cache file was removed.
 */
async function purgeProjectionCache(home, sessionId) {
  const path = join(home, 'storages', 'session_projcache', 'sessions', sessionId + '.json')
  try {
    await rm(path, { force: true })
    return true
  } catch {
    return false
  }
}

/**
 * Move a directory, falling back to copy and remove across volumes.
 *
 * @param source - absolute source directory.
 * @param target - absolute destination directory.
 */
async function moveDirectory(source, target) {
  try {
    await rename(source, target)
  } catch (error) {
    // The trash may live on another volume, where rename fails with EXDEV.
    if (!error || error.code !== 'EXDEV') throw error
    await cp(source, target, { recursive: true })
    await rm(source, { recursive: true, force: true })
  }
}

/**
 * Find the on-disk directory of a session.
 *
 * Sessions live at `<root>/<project key>/<session id>`, so one readdir plus a
 * stat per project directory is enough.
 *
 * @param root - absolute sessions root.
 * @param sessionId - the session id to look for.
 * @returns the absolute session directory, or `null` when absent.
 */
async function findSessionDir(root, sessionId) {
  const entries = await readdir(root, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const candidate = join(root, entry.name, sessionId)
    try {
      if ((await stat(candidate)).isDirectory()) return candidate
    } catch {
      // This project directory holds no such session.
    }
  }
  return null
}

/**
 * Whether a session is currently loaded in this process.
 *
 * @param ctx - the plugin context.
 * @param sessionId - the session id to check.
 * @returns `true` when the session store reports a live session.
 */
function isOpen(ctx, sessionId) {
  const sessions = ctx.get('sessions')
  if (!sessions || typeof sessions.get !== 'function') return false
  try {
    return Boolean(sessions.get(sessionId))
  } catch {
    return false
  }
}

/**
 * Reject browser requests issued by another site.
 *
 * The web server applies no origin policy of its own; the desktop shell talks
 * to it from the app origin, so only explicit cross-site requests are refused.
 *
 * @param req - incoming request.
 * @param res - response used when the request is refused.
 * @returns `true` when the caller may continue.
 */
function guard(req, res) {
  const site = req.headers && req.headers['sec-fetch-site']
  if (site === 'cross-site') {
    send(res, 403, { ok: false, error: 'cross-site-request' })
    return false
  }
  return true
}

/**
 * Read a small JSON request body.
 *
 * @param req - incoming request.
 * @returns the parsed body.
 */
function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

/**
 * Write a JSON response.
 *
 * @param res - response to write to.
 * @param status - HTTP status code.
 * @param payload - JSON-serializable body.
 */
function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}
