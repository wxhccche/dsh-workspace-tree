/**
 * Transport helpers shared by every route: request validation, a bounded body
 * reader and a JSON writer.
 */
/** Canonical session id: `session-<uuid>`. */
export const SESSION_ID = /^session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Upper bound for request bodies; every route here accepts one session id. */
export const MAX_BODY = 4096

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
export function guard(req, res) {
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
export function readJson(req) {
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
export function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}
