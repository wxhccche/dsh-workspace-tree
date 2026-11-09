/**
 * The sidebar region that replaces the built-in workspace browser.
 *
 * This file owns the component's state and event handlers; the tree it renders
 * comes from `./region/views.js`, and the data rules it follows from
 * `./region/selectors.js` and `./region/menus.js`.
 */
import { React, writeClipboard } from '../platform.js'
import {
  uid,
  loadStore,
  saveStore,
  useSettings,
  loadPrefixed,
  savePrefixed,
  workspaceKey,
  sessionIdsOf,
  foldersOf
} from '../store.js'
import { renameSession } from '../session-service.js'
import { subtreeIds } from './region/selectors.js'
import { renderRegion } from './region/views.js'

export function Region(props) {
  const t = typeof props.t === 'function' ? props.t : (key) => key
  const wsState = props.useWorkspaces((state) => state)
  const sessState = props.useSessions((state) => state)
  const settings = useSettings()
  const disabledWorkspaces = React.useMemo(() => {
    const list = Array.isArray(settings && settings.disabled) ? settings.disabled : []
    return new Set(list)
  }, [settings])

  const workspaces = React.useMemo(() => {
    const items = wsState && Array.isArray(wsState.items) ? wsState.items : []
    return items.filter((item) => item && workspaceKey(item))
  }, [wsState])
  const sessionsById = (sessState && sessState.byId) || {}
  const archivedIds = React.useMemo(() => {
    const raw = (wsState && wsState.archivedSessionIds) || []
    return new Set(Array.isArray(raw) ? raw : [])
  }, [wsState])
  // Only the blank session that is currently open is listed, as in the built-in browser.
  const currentMainId = React.useMemo(() => {
    for (const id of Object.keys(sessionsById)) {
      const summary = sessionsById[id]
      if (summary && summary.retainedBy && (summary.retainedBy.mainView || 0) > 0) return id
    }
    return null
  }, [sessionsById])
  // True ownership of each session, used to decide when a placement record can be dropped.
  const ownerOfSession = React.useMemo(() => {
    const owner = {}
    for (const workspace of workspaces) {
      for (const sessionId of sessionIdsOf(workspace)) owner[sessionId] = workspaceKey(workspace)
    }
    return owner
  }, [workspaces])

  const [store, setStore] = React.useState(loadStore)
  const [collapsed, setCollapsed] = React.useState({})
  const [editing, setEditing] = React.useState(null)
  // Blur fires after Escape, so a ref decides whether the edit was already cancelled.
  const editingRef = React.useRef(null)
  const [drag, setDrag] = React.useState(null)
  const [dropTarget, setDropTarget] = React.useState(null)
  // The session is gone from disk while the snapshot still lists it; hide it locally.
  const [deletedIds, setDeletedIds] = React.useState(() => new Set())

  React.useEffect(() => {
    saveStore(store)
  }, [store])

  // After a reinstall, strip the prefixes recorded before the previous uninstall.
  // A bracketed marker the user typed is not in that record and stays untouched.
  const strippedRef = React.useRef(false)
  React.useEffect(() => {
    if (strippedRef.current) return
    const service = props.sessions
    if (!service || typeof service.using !== 'function') return
    const map = loadPrefixed()
    const entries = Object.keys(map)
    if (!entries.length) return
    strippedRef.current = true
    let failed = 0
    ;(async () => {
      for (const sessionId of entries) {
        const prefix = map[sessionId]
        const summary = sessionsById[sessionId]
        if (!summary || typeof summary.title !== 'string' || !summary.title.startsWith(prefix)) {
          delete map[sessionId]
          continue
        }
        const next = summary.title.slice(prefix.length).trim()
        if (!next) continue
        try {
          await renameSession(service, sessionId, next)
          delete map[sessionId]
        } catch (error) {
          failed += 1
          console.warn('[workspace-tree] restore session title failed', sessionId, error)
        }
      }
      savePrefixed(map)
      if (failed) strippedRef.current = false
    })()
  }, [sessionsById, props.sessions])

  const placements = store.placements || {}

  const writeStore = (next) => {
    setStore((prev) => Object.assign({}, prev, next(prev)))
  }

  const addFolder = (wsKey, parentId) => {
    const id = uid()
    writeStore((prev) => {
      const byWorkspace = Object.assign({}, prev.byWorkspace)
      byWorkspace[wsKey] = {
        folders: foldersOf(prev, wsKey).concat({ id, name: '', parentId: parentId || null }),
      }
      return { byWorkspace }
    })
    setCollapsed((prev) => Object.assign({}, prev, { [id]: false }))
    beginEditing({ wsKey, folderId: id, value: '' })
  }

  const beginEditing = (next) => {
    editingRef.current = next
    setEditing(next)
  }

  const beginWorkspaceEditing = (workspace) => {
    const title = workspaceLabel(workspace)
    beginEditing({
      target: 'workspace',
      workspaceId: workspaceKey(workspace),
      title,
      value: title,
    })
  }

  const beginSessionEditing = (sessionId, summary) => {
    const title = summary.blank ? '' : summary.title || ''
    beginEditing({ target: 'session', sessionId, title, value: title })
  }

  const commitEditing = () => {
    const current = editingRef.current
    if (!current) return
    editingRef.current = null
    setEditing(null)
    const name = current.value.trim()
    if (current.target === 'session') {
      const service = props.sessions
      if (!name || name === current.title) return
      if (!service || typeof service.using !== 'function') return
      Promise.resolve(
        service.using(current.sessionId, { source: 'workspaceOperation' }, (reference) =>
          reference.binding.session.rename(name),
        ),
      )
        .then((result) => {
          if (result && result.ok === false) {
            console.warn('[workspace-tree] rename session failed', result.error)
          }
        })
        .catch((error) => {
          console.warn('[workspace-tree] rename session failed', error)
        })
      return
    }
    if (current.target === 'workspace') {
      const controller = props.workspaces
      if (!name || name === current.title) return
      if (!controller || typeof controller.rename !== 'function') return
      Promise.resolve(controller.rename(current.workspaceId, name)).catch((error) => {
        console.error('[workspace-tree] rename workspace failed', error)
      })
      return
    }
    writeStore((prev) => {
      const byWorkspace = Object.assign({}, prev.byWorkspace)
      const folders = foldersOf(prev, current.wsKey)
      byWorkspace[current.wsKey] = {
        folders: name
          ? folders.map((folder) =>
              folder.id === current.folderId ? Object.assign({}, folder, { name }) : folder,
            )
          : folders.filter((folder) => folder.id !== current.folderId),
      }
      return { byWorkspace }
    })
  }

  const cancelEditing = () => {
    const current = editingRef.current
    if (!current) return
    editingRef.current = null
    setEditing(null)
    if (current.target === 'workspace' || current.target === 'session') return
    // Cancelling a new folder before naming it drops the empty folder.
    writeStore((prev) => {
      const byWorkspace = Object.assign({}, prev.byWorkspace)
      const folders = foldersOf(prev, current.wsKey)
      byWorkspace[current.wsKey] = {
        folders: folders.filter((folder) => folder.id !== current.folderId || folder.name),
      }
      return { byWorkspace }
    })
  }


  const deleteFolder = (wsKey, folderId) => {
    if (typeof window.confirm === 'function' && !window.confirm(t('folder.deleteConfirm'))) {
      return
    }
    writeStore((prev) => {
      const folders = foldersOf(prev, wsKey)
      const remove = subtreeIds(folders, folderId)
      const byWorkspace = Object.assign({}, prev.byWorkspace)
      byWorkspace[wsKey] = {
        folders: folders.filter((folder) => !remove.has(folder.id)),
      }
      // Members fall back to the workspace root; sessions moved in from another workspace stay.
      const nextPlacements = Object.assign({}, prev.placements)
      for (const sessionId of Object.keys(nextPlacements)) {
        const placement = nextPlacements[sessionId]
        if (!placement || !remove.has(placement.folderId)) continue
        if (placement.workspaceId === ownerOfSession[sessionId]) delete nextPlacements[sessionId]
        else nextPlacements[sessionId] = { workspaceId: placement.workspaceId, folderId: null }
      }
      return { byWorkspace, placements: nextPlacements }
    })
  }

  const setPlacement = (sessionId, wsKey, folderId) => {
    writeStore((prev) => {
      const folders = foldersOf(prev, wsKey)
      const known = folderId && folders.some((folder) => folder.id === folderId)
      const nextPlacements = Object.assign({}, prev.placements)
      if (ownerOfSession[sessionId] === wsKey && !known) {
        // Back at its own workspace root, so no placement record is needed.
        delete nextPlacements[sessionId]
      } else {
        nextPlacements[sessionId] = { workspaceId: wsKey, folderId: known ? folderId : null }
      }
      return { placements: nextPlacements }
    })
  }

  const moveFolder = (folderId, fromWsKey, toWsKey, parentId) => {
    writeStore((prev) => {
      const fromFolders = foldersOf(prev, fromWsKey)
      if (!fromFolders.some((folder) => folder.id === folderId)) return {}
      const remove = subtreeIds(fromFolders, folderId)
      if (parentId && remove.has(parentId)) return {}
      const moved = fromFolders.filter((folder) => remove.has(folder.id))
      const byWorkspace = Object.assign({}, prev.byWorkspace)
      const remaining = fromFolders.filter((folder) => !remove.has(folder.id))
      byWorkspace[fromWsKey] = { folders: remaining }
      const targetFolders =
        fromWsKey === toWsKey ? remaining.slice() : foldersOf(prev, toWsKey).slice()
      if (parentId && !targetFolders.some((folder) => folder.id === parentId)) return {}
      byWorkspace[toWsKey] = {
        folders: targetFolders.concat(
          moved.map((folder) =>
            folder.id === folderId
              ? Object.assign({}, folder, { parentId: parentId || null })
              : folder,
          ),
        ),
      }
      // Sessions inside the folder follow it to the other workspace.
      const nextPlacements = Object.assign({}, prev.placements)
      for (const sessionId of Object.keys(nextPlacements)) {
        const placement = nextPlacements[sessionId]
        if (placement && remove.has(placement.folderId)) {
          nextPlacements[sessionId] = Object.assign({}, placement, { workspaceId: toWsKey })
        }
      }
      return { byWorkspace, placements: nextPlacements }
    })
  }

  const toggleFolder = (folderId) => {
    setCollapsed((prev) => Object.assign({}, prev, { [folderId]: !prev[folderId] }))
  }

  const readDragged = (event) => {
    if (drag) return drag
    try {
      const raw = event.dataTransfer.getData('text/plain')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed && (parsed.sessionId || parsed.folderId)) return parsed
    } catch (error) {
      return null
    }
    return null
  }

  const dropOn = (wsKey, folderId) => (event) => {
    event.preventDefault()
    event.stopPropagation()
    const dragged = readDragged(event)
    if (dragged) {
      if (dragged.kind === 'folder' && dragged.folderId) {
        moveFolder(dragged.folderId, dragged.wsKey, wsKey, folderId)
      } else if (dragged.sessionId) {
        setPlacement(dragged.sessionId, wsKey, folderId)
      }
    }
    setDrag(null)
    setDropTarget(null)
  }

  const beginDrag = (payload) => (event) => {
    try {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', JSON.stringify(payload))
    } catch (error) {
      // Some environments restrict dataTransfer, so drag state lives in the component.
    }
    setDrag(payload)
  }

  const endDrag = () => {
    setDrag(null)
    setDropTarget(null)
  }

  const openSession = (sessionId) => {
    if (props.uiWorkspace && typeof props.uiWorkspace.openSession === 'function') {
      props.uiWorkspace.openSession(sessionId)
    }
    // Expand the rail sidebar, otherwise the content switches while the sidebar stays collapsed.
    if (props.wide === false && typeof props.expandSidebar === 'function') {
      props.expandSidebar()
    }
  }

  const startSession = (wsKey) => {
    const ui = props.uiWorkspace
    if (!ui) return
    // connectWorkspace returns the session id, which is needed to select a model.
    if (typeof ui.connectWorkspace === 'function') {
      Promise.resolve(ui.connectWorkspace(wsKey))
        .then((sessionId) => {
          if (!sessionId) return
          openSession(sessionId)
          ensureSessionModel(sessionId)
        })
        .catch(() => {})
      return
    }
    if (typeof ui.startSession === 'function') {
      ui.startSession(wsKey)
    }
  }

  // A fresh session has no model and sending would fail, so let the Host pick one.
  // The controller may not be ready yet, so retry once after a short delay.
  const ensureSessionModel = (sessionId) => {
    const call = () =>
      fetch('/workspace-tree/sessions/model', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.ok)
        .catch(() => false)
    call().then((ok) => {
      if (ok) return
      window.setTimeout(call, 800)
    })
  }

  // The + on a folder row takes the workspace's blank session, records the folder, then opens it.
  const startSessionInFolder = (wsKey, folderId) => {
    const ui = props.uiWorkspace
    if (!ui) return
    if (typeof ui.connectWorkspace !== 'function') {
      startSession(wsKey)
      return
    }
    Promise.resolve(ui.connectWorkspace(wsKey))
      .then((sessionId) => {
        if (!sessionId) return
        setPlacement(sessionId, wsKey, folderId)
        openSession(sessionId)
        ensureSessionModel(sessionId)
      })
      .catch(() => {})
  }

  const addWorkspace = () => {
    const ui = props.uiWorkspace
    const controller = props.workspaces
    if (!ui || !controller) return
    Promise.resolve(ui.pickDirectory())
      .then((path) => (path ? controller.create({ path }) : null))
      .catch(() => {})
  }


  const copySessionId = (sessionId) => {
    const write =
      typeof writeClipboard === 'function'
        ? () => writeClipboard(sessionId)
        : () => navigator.clipboard.writeText(sessionId)
    Promise.resolve(write()).catch((error) => {
      console.warn('[workspace-tree] copy session id failed', error)
    })
  }

  const archiveSession = (sessionId) => {
    const service = props.uiWorkspace
    if (!service || typeof service.archiveSession !== 'function') return
    if (typeof window.confirm === 'function' && !window.confirm(t('session.archiveConfirm'))) {
      return
    }
    Promise.resolve(service.archiveSession(sessionId, { stopActivity: true })).catch((error) => {
      console.warn('[workspace-tree] archive session failed', error)
    })
  }

  const deleteSession = (sessionId) => {
    if (typeof window.confirm === 'function' && !window.confirm(t('session.deleteConfirm'))) {
      return
    }
    Promise.resolve(
      fetch('/workspace-tree/sessions/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json().then((payload) => ({ response, payload })))
        .then(({ response, payload }) => {
          if (!response.ok || !payload || payload.ok !== true) {
            const code = (payload && payload.error) || 'delete-failed'
            const error = new Error(code)
            error.code = code
            throw error
          }
        }),
    )
      .then(() => {
        setDeletedIds((prev) => {
          const next = new Set(prev)
          next.add(sessionId)
          return next
        })
        writeStore((prev) => {
          if (!prev.placements || !prev.placements[sessionId]) return {}
          const placementsNext = Object.assign({}, prev.placements)
          delete placementsNext[sessionId]
          return { placements: placementsNext }
        })
      })
      .catch((error) => {
        console.warn('[workspace-tree] delete session failed', error)
        if (typeof window.alert !== 'function') return
        const key = error && error.code === 'session-open' ? 'session.deleteOpen' : 'session.deleteFailed'
        window.alert(t(key))
      })
  }

  const forkSession = (sessionId) => {
    const service = props.uiWorkspace
    if (!service || typeof service.forkSession !== 'function') return
    Promise.resolve(service.forkSession(sessionId, undefined, { allowMigration: false })).catch(
      (error) => {
        console.warn('[workspace-tree] fork session failed', error)
      },
    )
  }

  // Everything the views need, in one place: data on the object, behaviour under actions.
  const scope = {
    t,
    store,
    workspaces,
    sessionsById,
    currentMainId,
    archivedIds,
    deletedIds,
    placements,
    collapsed,
    editing,
    drag,
    dropTarget,
    editingRef,
    disabledWorkspaces,
    rail: props.wide === false,
    actions: {
      addFolder,
      addWorkspace,
      archiveSession,
      beginDrag,
      beginEditing,
      beginSessionEditing,
      beginWorkspaceEditing,
      cancelEditing,
      commitEditing,
      copySessionId,
      deleteFolder,
      deleteSession,
      dropOn,
      endDrag,
      forkSession,
      moveFolder,
      openSession,
      setDropTarget,
      setPlacement,
      startSession,
      startSessionInFolder,
      toggleFolder,
      toggleWorkspace: (wsKey) =>
        setCollapsed((prev) =>
          Object.assign({}, prev, { ['ws:' + wsKey]: !prev['ws:' + wsKey] }),
        )
    }
  }

  return renderRegion(scope)
}
