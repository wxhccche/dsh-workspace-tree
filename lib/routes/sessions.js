/**
 * Session routes: a real delete for a closed session and a model selection for a
 * freshly created blank session.
 */
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { SESSION_ID, guard, readJson, send } from '../http.js'
import { sessionsRoot, purgeProjectionCache, moveDirectory, findSessionDir } from '../paths.js'
/**
 * Move one session out of the active store.
 *
 * @param ctx - the plugin context, used to resolve the persistence root.
 * @param req - incoming request carrying `{ sessionId }`.
 * @param res - response to write the JSON result to.
 * @returns the HTTP response, written in place.
 */
export async function handleDelete(ctx, req, res) {
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
  // Deletion is deliberately not gated on `ctx.sessions.get()`: that store only
  // says the Host has materialized the session at some point in this process, so
  // any session the user looked at once would stay "live" forever and become
  // undeletable. The client refuses to delete the running or currently open
  // session, which is the state that actually keeps appending to the log.
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
export async function handleModel(ctx, req, res) {
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
export async function pickModel(controller) {
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
