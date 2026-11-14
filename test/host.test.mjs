/**
 * Host-half regression tests.
 *
 * They drive the real route handlers through a stubbed plugin context, so the
 * filesystem contracts (trash layout, projection cache, validation) are covered
 * without starting DSH.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import test from 'node:test'

const SESSION = 'session-11111111-1111-1111-1111-111111111111'
const OTHER = 'session-22222222-2222-2222-2222-222222222222'

const loadRoutes = async (ctx) => {
  const { apply } = await import('../index.js')
  const routes = new Map()
  const effects = []
  apply({
    effect: (run) => {
      effects.push(run)
    },
    get: () => undefined,
    webServer: {
      register: (config) => {
        routes.set(config.path, config.handler)
        return { dispose() {} }
      }
    },
    ...ctx
  })
  for (const run of effects) run()
  return routes
}

const request = (method, body, headers = {}) => {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))])
  stream.method = method
  stream.headers = { 'sec-fetch-site': 'same-origin', ...headers }
  return stream
}

const response = () => {
  const res = {
    statusCode: 0,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      res.headers[name] = value
    },
    end(payload) {
      res.body = JSON.parse(payload)
    }
  }
  return res
}

const withHome = async (run) => {
  const home = await mkdtemp(join(tmpdir(), 'workspace-tree-'))
  process.env.DSH_HOME = home
  try {
    await run(home)
  } finally {
    delete process.env.DSH_HOME
    await rm(home, { recursive: true, force: true })
  }
}

const seedSession = async (home, sessionId) => {
  const project = join(home, 'sessions', '--tmp-project--')
  await mkdir(join(project, sessionId), { recursive: true })
  await writeFile(join(project, sessionId, 'events.jsonl'), '{"type":"session"}\n')
  const cache = join(home, 'storages', 'session_projcache', 'sessions')
  await mkdir(cache, { recursive: true })
  await writeFile(join(cache, sessionId + '.json'), '{"seq":1}')
}

test('delete moves a closed session into the trash and drops its cache', async () => {
  await withHome(async (home) => {
    await seedSession(home, SESSION)
    const routes = await loadRoutes({})
    const res = response()
    await routes.get('/workspace-tree/sessions/delete')(request('POST', { sessionId: SESSION }), res)

    assert.equal(res.statusCode, 200)
    assert.equal(res.body.ok, true)
    assert.equal(res.body.cacheRemoved, true)
    assert.ok(res.body.movedTo.startsWith(join(home, 'session-trash')))
    assert.ok(existsSync(res.body.movedTo))
    assert.equal(existsSync(join(home, 'sessions', '--tmp-project--', SESSION)), false)
    assert.equal(
      existsSync(join(home, 'storages', 'session_projcache', 'sessions', SESSION + '.json')),
      false
    )
  })
})

test('delete is not blocked by the live session store', async () => {
  await withHome(async (home) => {
    await seedSession(home, SESSION)
    // `ctx.sessions` only reports that the Host materialized the session at some
    // point, so a session the user merely looked at must still be deletable.
    const routes = await loadRoutes({
      get: (name) => (name === 'sessions' ? { get: () => ({ id: SESSION }) } : undefined),
    })
    const res = response()
    await routes.get('/workspace-tree/sessions/delete')(request('POST', { sessionId: SESSION }), res)

    assert.equal(res.statusCode, 200)
    assert.equal(res.body.ok, true)
    assert.equal(existsSync(join(home, 'sessions', '--tmp-project--', SESSION)), false)
  })
})

test('delete treats a session without a log as already gone', async () => {
  await withHome(async () => {
    const routes = await loadRoutes({})
    const handler = routes.get('/workspace-tree/sessions/delete')

    // A blank session lives in memory only until it materializes; with nothing
    // on disk there is nothing to move, and refusing would strand the row.
    const missing = response()
    await handler(request('POST', { sessionId: OTHER }), missing)
    assert.equal(missing.statusCode, 200)
    assert.equal(missing.body.ok, true)
    assert.equal(missing.body.missing, true)

    const malformed = response()
    await handler(request('POST', { sessionId: '../../etc/passwd' }), malformed)
    assert.equal(malformed.statusCode, 400)
    assert.equal(malformed.body.error, 'bad-session-id')

    const wrongMethod = response()
    await handler(request('GET', undefined), wrongMethod)
    assert.equal(wrongMethod.statusCode, 405)
  })
})

test('cross-site requests are refused', async () => {
  await withHome(async () => {
    const routes = await loadRoutes({})
    const res = response()
    await routes.get('/workspace-tree/sessions/delete')(
      request('POST', { sessionId: SESSION }, { 'sec-fetch-site': 'cross-site' }),
      res
    )
    assert.equal(res.statusCode, 403)
    assert.equal(res.body.error, 'cross-site-request')
  })
})

test('model route selects the catalog default and reports selection failures', async () => {
  await withHome(async () => {
    const selected = []
    const catalog = {
      default: { provider: 'p2', model: 'm2' },
      groups: [
        { id: 'p1', models: [{ id: 'm1' }] },
        { id: 'p2', models: [{ id: 'm2' }, { id: 'm3' }] }
      ]
    }
    const ok = await loadRoutes({
      get: (name) =>
        name === 'sessionController'
          ? {
              modelCatalog: async () => catalog,
              selectModel: async (input) => {
                selected.push(input)
                return { ok: true }
              }
            }
          : undefined
    })
    const res = response()
    await ok.get('/workspace-tree/sessions/model')(request('POST', { sessionId: SESSION }), res)
    assert.equal(res.statusCode, 200)
    assert.deepEqual(selected, [{ sessionId: SESSION, provider: 'p2', model: 'm2' }])

    const rejected = await loadRoutes({
      get: (name) =>
        name === 'sessionController'
          ? {
              modelCatalog: async () => catalog,
              selectModel: async () => ({ ok: false, error: { code: 'model-locked', message: 'locked' } })
            }
          : undefined
    })
    const failed = response()
    await rejected.get('/workspace-tree/sessions/model')(request('POST', { sessionId: SESSION }), failed)
    assert.equal(failed.statusCode, 500)
    assert.equal(failed.body.error, 'select-failed')
    assert.match(failed.body.message, /locked/)
  })
})

test('trash routes report and clear only directories', async () => {
  await withHome(async (home) => {
    const trash = join(home, 'session-trash')
    await mkdir(join(trash, SESSION + '-1'), { recursive: true })
    await writeFile(join(trash, SESSION + '-1', 'events.jsonl'), 'x'.repeat(10))
    await writeFile(join(trash, 'stray.txt'), 'keep me')

    const routes = await loadRoutes({})
    const listed = response()
    await routes.get('/workspace-tree/trash')(request('GET', undefined), listed)
    assert.equal(listed.statusCode, 200)
    assert.equal(listed.body.count, 1)
    assert.equal(listed.body.bytes, 10)

    const cleared = response()
    await routes.get('/workspace-tree/trash/clear')(request('POST', undefined), cleared)
    assert.equal(cleared.statusCode, 200)
    assert.equal(cleared.body.removed, 1)
    assert.deepEqual(await readdir(trash), ['stray.txt'])
  })
})
