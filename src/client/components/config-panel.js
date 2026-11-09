/**
 * The configuration block rendered on the plugin page.
 */
import { React, h } from '../platform.js'
import { saveSettings, useSettings, loadPrefixed, savePrefixed, workspaceKey, workspaceLabel, sessionIdsOf } from '../store.js'
import { prefixOf, formatBytes } from '../util.js'
import { renameSession } from '../session-service.js'
export function ConfigPanel(props) {
  const t = typeof props.t === 'function' ? props.t : (key) => key
  const wsState = props.useWorkspaces((state) => state)
  const settings = useSettings()
  const workspaces = React.useMemo(() => {
    const items = wsState && Array.isArray(wsState.items) ? wsState.items : []
    return items.filter((item) => item && workspaceKey(item))
  }, [wsState])
  const disabled = Array.isArray(settings && settings.disabled) ? settings.disabled : []
  const [trash, setTrash] = React.useState({ state: 'loading', count: 0, bytes: 0 })
  const [clearing, setClearing] = React.useState(false)
  const sessState = props.useSessions((state) => state)
  const sessionsById = (sessState && sessState.byId) || {}
  const [naming, setNaming] = React.useState({ state: 'idle', done: 0, total: 0 })
  const [pending, setPending] = React.useState(() => Object.keys(loadPrefixed()).length)

  const loadTrash = React.useCallback(() => {
    setTrash({ state: 'loading', count: 0, bytes: 0 })
    fetch('/workspace-tree/trash')
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.ok === false) throw new Error((data && data.error) || 'trash-failed')
        setTrash({ state: 'ready', count: data.count || 0, bytes: data.bytes || 0 })
      })
      .catch((error) => {
        console.warn('[workspace-tree] load trash failed', error)
        setTrash({ state: 'error', count: 0, bytes: 0 })
      })
  }, [])

  React.useEffect(() => {
    loadTrash()
  }, [loadTrash])

  const toggleWorkspace = (wsKey, checked) => {
    const next = disabled.filter((id) => id !== wsKey)
    if (!checked) next.push(wsKey)
    saveSettings({ disabled: next })
  }

  // Grouping disappears with the plugin, so record workspace names in titles first.
  const prefixAll = () => {
    const service = props.sessions
    if (!service || typeof service.using !== 'function') return
    if (!window.confirm(t('config.namesConfirm'))) return
    const targets = []
    for (const workspace of workspaces) {
      if (disabled.includes(workspaceKey(workspace))) continue
      const prefix = prefixOf(workspace)
      for (const sessionId of sessionIdsOf(workspace)) {
        const summary = sessionsById[sessionId]
        if (!summary || summary.blank || !summary.title) continue
        if (summary.origin === 'subagent') continue
        if (summary.title.startsWith(prefix)) continue
        targets.push({ sessionId, prefix, title: prefix + summary.title })
      }
    }
    if (!targets.length) {
      setNaming({ state: 'done', done: 0, total: 0 })
      return
    }
    setNaming({ state: 'running', done: 0, total: targets.length })
    ;(async () => {
      const map = loadPrefixed()
      let done = 0
      let failed = 0
      for (const target of targets) {
        try {
          await renameSession(service, target.sessionId, target.title)
          map[target.sessionId] = target.prefix
          done += 1
          setNaming({ state: 'running', done, total: targets.length })
        } catch (error) {
          failed += 1
          console.warn('[workspace-tree] prefix session title failed', target.sessionId, error)
        }
      }
      savePrefixed(map)
      setPending(Object.keys(map).length)
      setNaming({ state: failed ? 'error' : 'done', done, total: targets.length })
    })()
  }

  const clearTrash = () => {
    if (!window.confirm(t('config.trashConfirm'))) return
    setClearing(true)
    fetch('/workspace-tree/trash/clear', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.ok === false) throw new Error((data && data.error) || 'clear-failed')
        setClearing(false)
        loadTrash()
      })
      .catch((error) => {
        setClearing(false)
        console.warn('[workspace-tree] clear trash failed', error)
        window.alert(t('config.trashFailed'))
      })
  }

  const trashText =
    trash.state === 'loading'
      ? t('config.trashLoading')
      : trash.state === 'error'
        ? t('config.trashFailed')
        : trash.count
          ? t('config.trashCount')
              .replace('{n}', String(trash.count))
              .replace('{size}', formatBytes(trash.bytes))
          : t('config.trashEmpty')

  return h(
    'div',
    { className: 'wsf-config' },
    h(
      'div',
      { className: 'wsf-config-section' },
      h('div', { className: 'wsf-config-title' }, t('config.workspaces')),
      h('div', { className: 'wsf-config-hint' }, t('config.workspacesHint')),
      workspaces.length
        ? h(
            'div',
            { className: 'wsf-config-list' },
            workspaces.map((workspace) => {
              const key = workspaceKey(workspace)
              const checked = !disabled.includes(key)
              return h(
                'label',
                { key: 'ws:' + key, className: 'wsf-config-row' },
                h('input', {
                  type: 'checkbox',
                  checked,
                  onChange: (event) => toggleWorkspace(key, event.target.checked),
                }),
                h('span', { className: 'wsf-config-name' }, workspaceLabel(workspace)),
                h('span', { className: 'wsf-config-path' }, workspace.path || ''),
              )
            }),
          )
        : h('div', { className: 'wsf-config-hint' }, t('config.workspacesEmpty')),
    ),
    h(
      'div',
      { className: 'wsf-config-section' },
      h('div', { className: 'wsf-config-title' }, t('config.names')),
      h('div', { className: 'wsf-config-hint' }, t('config.namesHint')),
      pending
        ? h(
            'div',
            { className: 'wsf-config-hint' },
            t('config.namesPending').replace('{n}', String(pending)),
          )
        : null,
      naming.state === 'running'
        ? h(
            'div',
            { className: 'wsf-config-hint' },
            t('config.namesRunning')
              .replace('{done}', String(naming.done))
              .replace('{total}', String(naming.total)),
          )
        : naming.state === 'done'
          ? h(
              'div',
              { className: 'wsf-config-hint' },
              t('config.namesDone').replace('{n}', String(naming.done)),
            )
          : naming.state === 'error'
            ? h('div', { className: 'wsf-config-hint' }, t('config.namesFailed'))
            : null,
      h(
        'div',
        { className: 'wsf-config-actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'wsf-button',
            disabled: naming.state === 'running' || !workspaces.length,
            onClick: prefixAll,
          },
          t('config.namesButton'),
        ),
      ),
    ),
    h(
      'div',
      { className: 'wsf-config-section' },
      h('div', { className: 'wsf-config-title' }, t('config.trash')),
      h('div', { className: 'wsf-config-hint' }, trashText),
      h(
        'div',
        { className: 'wsf-config-actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'wsf-button',
            disabled: clearing || trash.state !== 'ready' || !trash.count,
            onClick: clearTrash,
          },
          clearing ? t('config.trashClearing') : t('config.trashClear'),
        ),
      ),
    ),
  )
}
