/**
 * Client-half tests.
 *
 * The built bundle is executed outside DSH with stub platform modules, so these
 * tests catch unresolved imports, missing exports and render-time crashes. They
 * also pin the slot registration that replaces the built-in browser and the
 * visibility rules that decide which sessions appear under which workspace.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const root = join(import.meta.dirname, '..')
const noop = () => {}

const SESSION = {
  one: 'session-11111111-1111-1111-1111-111111111111',
  two: 'session-22222222-2222-2222-2222-222222222222',
  three: 'session-33333333-3333-3333-3333-333333333333',
  four: 'session-44444444-4444-4444-4444-444444444444',
  subagent: 'session-55555555-5555-5555-5555-555555555555',
  archived: 'session-99999999-9999-9999-9999-999999999999'
}

const reactStub = () => ({
  createElement: (type, props, ...children) => ({
    type,
    props: Object.assign({}, props, { children: children.flat(Infinity) })
  }),
  useState: (init) => [typeof init === 'function' ? init() : init, noop],
  useReducer: (reducer, init) => [typeof init === 'function' ? init() : init, noop],
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useRef: (init) => ({ current: init }),
  useEffect: noop,
  useLayoutEffect: noop,
  Fragment: 'fragment',
  Children: { toArray: (children) => [].concat(children) }
})

const icon = () => ({ type: 'icon', props: {} })
const primitivesStub = () => ({
  Menu: (props) => ({ type: 'menu', props }),
  IconEllipsisOutlineRegular: icon,
  IconFolderOpenRegular: icon,
  IconFolderCloseRegular: icon,
  IconTriangleRightFillRegular: icon,
  IconNewChatOutlineRegular: icon,
  IconPlusOutlineRegular: icon,
  IconEditOutlineRegular: icon,
  IconTrashOutlineRegular: icon,
  IconProjectAddOutlineRegular: icon,
  IconArchiveOutlineRegular: icon,
  writeClipboard: async () => {}
})

/** Seed the render state and execute the bundle; returns everything the plugin registered. */
const loadBundle = async () => {
  const entries = new Map([
    [
      'dsh.workspace-tree.store.v2',
      JSON.stringify({
        v: 2,
        byWorkspace: {
          w1: {
            folders: [
              { id: 'f1', name: 'Alpha folder', parentId: null },
              { id: 'f2', name: '', parentId: 'f1' }
            ]
          }
        },
        placements: {
          [SESSION.one]: { workspaceId: 'w1', folderId: 'f1' },
          [SESSION.two]: { workspaceId: 'w1', folderId: 'f1' },
          [SESSION.four]: { workspaceId: 'w1', folderId: 'f2' }
        }
      })
    ],
    ['dsh.workspace-tree.settings.v1', JSON.stringify({ disabled: ['w3'] })]
  ])

  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    localStorage: globalThis.localStorage
  }

  let registration = null
  globalThis.window = globalThis
  globalThis.document = {
    head: { appendChild: noop },
    createElement: () => ({ setAttribute: noop, remove: noop, textContent: '' })
  }
  globalThis.localStorage = {
    getItem: (key) => (entries.has(key) ? entries.get(key) : null),
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key)
  }
  globalThis.window.__ModuleLoader__ = {
    load(module) {
      registration = module
    }
  }

  const bundle = await readFile(join(root, 'client.js'), 'utf8')
  new Function(bundle)()

  assert.ok(registration, 'the bundle must register a module')
  const module = registration.factory((name) => {
    if (name === 'react') return reactStub()
    if (name === '@deepseek-ai/dsh-client-ui-primitives') return primitivesStub()
    throw new Error('unexpected require: ' + name)
  })

  const registrations = []
  const locales = new Map()
  module.apply({
    effect: (run) => {
      run()
    },
    locale: {
      register: (namespace, language, dictionary) => {
        locales.set(language, dictionary)
      }
    },
    slots: {
      inject: (name, register) => {
        register()
        return noop
      },
      register: (config, component) => {
        registrations.push({ config, component })
        return { dispose: noop }
      }
    },
    uiWorkspace: {},
    workspaces: {},
    sessions: {}
  })

  return { registration, module, registrations, locales }
}

const uiWorkspace = () => ({
  openSession: noop,
  connectWorkspace: () => SESSION.one,
  startSession: () => SESSION.one,
  forkSession: noop,
  archiveSession: async () => {},
  pickDirectory: async () => null,
  rename: async () => {}
})

const regionProps = () => {
  const now = Date.now()
  const workspaces = {
    items: [
      { id: 'w1', path: 'C:/work/alpha', name: 'alpha', sessionIds: [SESSION.one, SESSION.two, SESSION.four, SESSION.subagent, SESSION.archived] },
      { id: 'w2', path: 'C:/work/beta', name: 'beta', sessionIds: [] },
      { id: 'w3', path: 'C:/work/gamma', name: 'gamma', sessionIds: [SESSION.three] }
    ],
    archivedSessionIds: [SESSION.archived],
    summary: { retainedBy: { mainView: 1 } }
  }
  const sessions = {
    byId: {
      [SESSION.one]: { id: SESSION.one, title: 'Refactor the sidebar', updatedAt: now - 60_000, workspaceId: 'w1' },
      [SESSION.two]: { id: SESSION.two, title: '', blank: true, updatedAt: now - 5_000, workspaceId: 'w1', retainedBy: { mainView: 1 } },
      [SESSION.three]: { id: SESSION.three, title: 'Flat session', updatedAt: now - 120_000, workspaceId: 'w3' },
      [SESSION.four]: { id: SESSION.four, title: 'Child folder session', updatedAt: now - 30_000, cwd: 'C:/work/alpha', workspaceId: 'w1' },
      [SESSION.subagent]: { id: SESSION.subagent, title: 'Subagent run', origin: 'subagent', updatedAt: now - 1_000, workspaceId: 'w1' }
    }
  }
  return {
    t: (key) => key,
    wide: true,
    expandSidebar: noop,
    useWorkspaces: (selector) => selector(workspaces),
    useSessions: (selector) => selector(sessions),
    uiWorkspace: uiWorkspace(),
    workspaces: { create: async () => {}, rename: async () => {} },
    sessions: {
      using: (id, options, run) => run({ binding: { session: { rename: async () => ({ ok: true }) } } }),
      sessionStatus: {
        getSnapshot: () =>
          new Map([
            [SESSION.one, { running: true }],
            [SESSION.three, { running: false, completionUnread: true }]
          ]),
        subscribe: () => noop
      }
    }
  }
}

/** Depth-first walk over the stub element tree. */
const walk = (node, visit, depth = 0) => {
  if (!node || typeof node !== 'object') return
  visit(node, depth)
  for (const child of [].concat(node.props?.children ?? [])) walk(child, visit, depth + 1)
}

const collect = (tree, names) => {
  const found = []
  walk(tree, (node, depth) => {
    if (typeof node.type === 'function' && names.includes(node.type.name)) found.push({ name: node.type.name, props: node.props, depth })
  })
  return found
}

test('the bundle registers the plugin module and its slots', async () => {
  const { registration, module, registrations } = await loadBundle()

  assert.equal(registration.id, '@wxhccc/dsh-workspace-tree')
  assert.deepEqual(module.inject, ['slots', 'locale', 'uiWorkspace', 'workspaces', 'sessions'])
  assert.equal(typeof module.apply, 'function')

  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  assert.ok(browser, 'sidebar.workspaces must be registered')
  assert.equal(browser.config.priority, -1, 'must outrank the built-in browser at 0')

  const configKeys = registrations
    .filter((item) => item.config.name === 'plugins.bundle.config')
    .map((item) => item.config.key)
  assert.deepEqual(configKeys, ['@wxhccc/dsh-workspace-tree', 'workspace-tree'])
})

test('the locale dictionaries define the keys the region uses', async () => {
  const { locales } = await loadBundle()

  assert.equal(locales.get('en')['session.new'], 'New session')
  assert.equal(locales.get('zh')['session.new'], '新建会话')
  assert.equal(locales.get('en')['session.deleteBusy'], 'This session is running or open. Close it before deleting it.')
  assert.equal(locales.get('zh')['session.deleteBusy'], '该会话正在运行或已打开，请先关闭再删除。')
  assert.equal(locales.get('en')['session.running'], 'Running')
  assert.equal(locales.get('zh')['session.running'], '运行中')
  assert.equal(locales.get('en')['session.completed'], 'Completed')
  assert.equal(locales.get('zh')['session.completed'], '已完成')
})

test('the region renders folders, nested sessions and the flat fallback', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const tree = browser.component(regionProps())

  const folders = collect(tree, ['FolderRow'])
  assert.deepEqual(
    folders.map((row) => [row.props.folder.name || 'folder.untitled', row.props.depth]),
    [
      ['Alpha folder', 0],
      ['folder.untitled', 1]
    ]
  )

  const sessions = collect(tree, ['SessionRow'])
  const titles = sessions.map((row) => row.props.title)
  assert.deepEqual(
    sessions.map((row) => row.props.depth),
    [2, 1, 1, 0],
    'w1 sessions at folder depth, the blank session at workspace root, then the flat w3 session'
  )
  assert.ok(titles.includes('session.new'), 'a blank session falls back to the session.new key')
  assert.ok(titles.includes('Refactor the sidebar'))
  assert.ok(titles.includes('Child folder session'))
  assert.ok(titles.includes('Flat session'))
  assert.ok(!titles.includes('Subagent run'), 'subagent sessions are hidden')
  assert.ok(!titles.some((title) => title.includes('Archived')), 'archived sessions are hidden')

  const workspaces = collect(tree, ['WorkspaceRow'])
  assert.deepEqual(
    workspaces.map((row) => row.props.label),
    ['alpha', 'beta', 'gamma']
  )
})

test('session menus expose the actions and move targets', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const tree = browser.component(regionProps())

  const session = collect(tree, ['SessionRow']).find((row) => row.props.title === 'Refactor the sidebar')
  const ids = session.props.menuItems.map((item) => item.id)
  assert.deepEqual(ids, ['rename', 'copy', 'fork', 'archive', 'delete', 'move'])

  const move = session.props.menuItems.find((item) => item.id === 'move')
  const targets = move.submenu.map((item) => item.id)
  assert.ok(targets.includes('mv:'), 'the workspace root is a move target')
  assert.ok(targets.includes('mv:f1'))
  assert.ok(targets.some((id) => id.startsWith('mvws:')), 'other workspaces are move targets')

  const folder = collect(tree, ['FolderRow']).find((row) => row.props.depth === 0)
  const folderIds = folder.props.menuItems.map((item) => item.id)
  assert.deepEqual(folderIds, ['child', 'rename', 'delete', 'move'])
  const folderMove = folder.props.menuItems.find((item) => item.id === 'move')
  const folderTargets = folderMove.submenu.map((item) => item.id)
  assert.ok(!folderTargets.includes('mv:f1'), 'a folder never moves into itself')
  assert.ok(!folderTargets.includes('mv:f2'), 'a folder never moves into its descendants')
})

test('a running session refuses deletion in the client', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const tree = browser.component(regionProps())

  const running = collect(tree, ['SessionRow']).find((row) => row.props.title === 'Refactor the sidebar')
  const alerts = []
  const previousAlert = globalThis.alert
  globalThis.alert = (message) => alerts.push(message)
  try {
    running.props.onMenuSelect('delete')
  } finally {
    globalThis.alert = previousAlert
  }

  assert.deepEqual(alerts, ['session.deleteBusy'], 'the guard names the busy session, not a failed request')
})

test('a failed delete names its cause', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const tree = browser.component(regionProps())

  const idle = collect(tree, ['SessionRow']).find((row) => row.props.title === 'Child folder session')
  const alerts = []
  const previous = {
    alert: globalThis.alert,
    confirm: globalThis.confirm,
    fetch: globalThis.fetch,
    warn: console.warn
  }
  globalThis.alert = (message) => alerts.push(message)
  globalThis.confirm = () => true
  // An older build of the Host answers 409 session-open; the dialog has to say
  // so instead of repeating the generic failure.
  globalThis.fetch = async () => ({
    ok: false,
    status: 409,
    json: async () => ({ ok: false, error: 'session-open' })
  })
  console.warn = () => {}
  try {
    idle.props.onMenuSelect('delete')
    await new Promise((resolve) => setTimeout(resolve, 0))
  } finally {
    globalThis.alert = previous.alert
    globalThis.confirm = previous.confirm
    globalThis.fetch = previous.fetch
    console.warn = previous.warn
  }

  assert.deepEqual(alerts, ['session.deleteStale'], 'a stale Host build is named, not a generic failure')
})

test('the session rows carry the activity state', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const tree = browser.component(regionProps())

  const rows = collect(tree, ['SessionRow'])
  const byTitle = (title) => rows.find((row) => row.props.title === title)

  assert.equal(byTitle('Refactor the sidebar').props.state, 'running')
  assert.equal(byTitle('Refactor the sidebar').props.stateLabel, 'session.running')
  assert.equal(byTitle('Flat session').props.state, 'done')
  assert.equal(byTitle('Flat session').props.stateLabel, 'session.completed')
  assert.equal(byTitle('Child folder session').props.state, 'idle')
  assert.equal(byTitle('Child folder session').props.stateLabel, '')
})

test('the slot status prop wins over the service snapshot', async () => {
  const { registrations } = await loadBundle()
  const browser = registrations.find((item) => item.config.name === 'sidebar.workspaces')
  const props = regionProps()
  props.useSessionStatus = (select) =>
    select(new Map([[SESSION.one, { running: false, completionUnread: true }]]))
  const tree = browser.component(props)

  const rows = collect(tree, ['SessionRow'])
  const byTitle = (title) => rows.find((row) => row.props.title === title)

  assert.equal(byTitle('Refactor the sidebar').props.state, 'done', 'the slot hook replaced the running flag')
  assert.equal(byTitle('Child folder session').props.state, 'idle', 'sessions missing from the map stay idle')
})

test('the stylesheet defines the running and done states', async () => {
  const css = await readFile(join(root, 'client.js'), 'utf8')

  assert.ok(css.includes('.wsf-state--running'), 'the running state has a rule')
  assert.ok(css.includes('.wsf-state--done'), 'the done state has a rule')
  assert.ok(css.includes('@keyframes wsf-spin'), 'the spinner animates')
  assert.ok(css.includes('prefers-reduced-motion'), 'the spinner respects reduced motion')
  assert.ok(css.includes('.wsf-row--project .wsf-project-icon'), 'workspaces carry their own icon colour')
  assert.ok(css.includes('.wsf-workspace + .wsf-workspace'), 'workspaces are separated from each other')
  assert.ok(css.includes('.wsf-chevron { width: 12px; }'), 'the disclosure chevron is narrower than an icon slot')
  assert.ok(/\.wsf-row--project \.wsf-chevron \{[^}]*margin-inline-start: -4px/.test(css), 'the project chevron sits close to its icon')
})

test('the settings panel renders for both registration keys', async () => {
  const { registrations } = await loadBundle()
  const panels = registrations.filter((item) => item.config.name === 'plugins.bundle.config')
  assert.equal(panels.length, 2)

  const tree = panels[0].component({
    t: (key) => key,
    view: 'page',
    useWorkspaces: (selector) => selector({ items: [{ id: 'w1', name: 'alpha', path: 'C:/work/alpha', sessionIds: [] }] }),
    useSessions: (selector) => selector({ byId: {} }),
    sessions: { list: async () => [], observe: noop }
  })

  let nodes = 0
  walk(tree, () => {
    nodes += 1
  })
  assert.ok(nodes > 5, 'the panel renders content')
})
