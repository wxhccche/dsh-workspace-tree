/**
 * Rendering of the sidebar tree.
 *
 * The views receive one `scope` object (data plus actions) from the region and
 * stay free of state of their own, which keeps the container file about
 * behaviour and this file about markup.
 */
import { h, IconProjectAddOutlineRegular } from '../../platform.js'
import { foldersOf, workspaceKey, workspaceLabel } from '../../store.js'
import { shortTimeText } from '../../util.js'
import { FolderRow } from '../folder-row.js'
import { SessionRow } from '../session-row.js'
import { WorkspaceRow } from '../workspace-row.js'
import { flatSessions, folderOfSession, sessionsFor } from './selectors.js'
import { folderMenuItems, sessionMenuItems } from './menus.js'

export function renderSessionRow(scope, wsKey, sessionId, depth, folderId, options) {
  const t = scope.t
  const actions = scope.actions
  const movable = !options || options.movable !== false
  const summary = scope.sessionsById[sessionId] || {}
  const title = summary.blank ? t('session.new') : summary.title || t('session.untitled')
  return h(SessionRow, {
    key: 'session:' + sessionId,
    t,
    title,
    path: summary.cwd || sessionId,
    depth,
    selected: scope.currentMainId === sessionId,
    time: summary.blank ? '' : shortTimeText(summary.updatedAt),
    menuItems: sessionMenuItems(scope, wsKey, folderId, summary),
    editing:
      scope.editing && scope.editing.target === 'session' && scope.editing.sessionId === sessionId
        ? scope.editing
        : null,
    dragging: Boolean(
      scope.drag && scope.drag.kind === 'session' && scope.drag.sessionId === sessionId,
    ),
    onRename: () => actions.beginSessionEditing(sessionId, summary),
    onEditChange: (value) => {
      const current = scope.editingRef.current
      if (current) actions.beginEditing(Object.assign({}, current, { value }))
    },
    onEditCommit: actions.commitEditing,
    onEditCancel: actions.cancelEditing,
    onMenuSelect: (id) => {
      if (id === 'rename') actions.beginSessionEditing(sessionId, summary)
      else if (id === 'copy') actions.copySessionId(sessionId)
      else if (id === 'fork') actions.forkSession(sessionId)
      else if (id === 'archive') actions.archiveSession(sessionId)
      else if (id === 'delete') actions.deleteSession(sessionId)
      else if (id === 'mv:') actions.setPlacement(sessionId, wsKey, null)
      else if (id.indexOf('mvws:') === 0) {
        actions.setPlacement(sessionId, id.slice('mvws:'.length), null)
      } else if (id.indexOf('mv:') === 0) {
        actions.setPlacement(sessionId, wsKey, id.slice('mv:'.length))
      }
    },
    onOpen: () => actions.openSession(sessionId),
    movable,
    onDragStart: movable ? actions.beginDrag({ kind: 'session', sessionId, wsKey }) : undefined,
    onDragEnd: actions.endDrag
  })
}

export function renderFolder(scope, wsKey, folder, depth, sessions) {
  const t = scope.t
  const actions = scope.actions
  const folders = foldersOf(scope.store, wsKey)
  const children = folders.filter((item) => item.parentId === folder.id)
  const members = sessions.filter((sessionId) => folderOfSession(scope, sessionId, wsKey) === folder.id)
  const row = h(FolderRow, {
    key: 'folder:' + folder.id,
    t,
    folder,
    depth,
    collapsed: Boolean(scope.collapsed[folder.id]),
    editing: scope.editing && scope.editing.folderId === folder.id ? scope.editing : null,
    dropActive: scope.dropTarget === folder.id,
    dragging: Boolean(
      scope.drag && scope.drag.kind === 'folder' && scope.drag.folderId === folder.id,
    ),
    menuItems: folderMenuItems(scope, wsKey, folder),
    onNewSession: () => actions.startSessionInFolder(wsKey, folder.id),
    onToggle: () => actions.toggleFolder(folder.id),
    onDragStart: actions.beginDrag({ kind: 'folder', folderId: folder.id, wsKey }),
    onDragEnd: actions.endDrag,
    onDragOver: () => actions.setDropTarget(folder.id),
    onDragLeave: () =>
      actions.setDropTarget((prev) => (prev === folder.id ? null : prev)),
    onDrop: actions.dropOn(wsKey, folder.id),
    onEditChange: (value) => actions.beginEditing({ wsKey, folderId: folder.id, value }),
    onEditCommit: actions.commitEditing,
    onEditCancel: actions.cancelEditing,
    onMenuSelect: (id) => {
      if (id === 'child') actions.addFolder(wsKey, folder.id)
      else if (id === 'rename') {
        actions.beginEditing({ wsKey, folderId: folder.id, value: folder.name || '' })
      } else if (id === 'delete') actions.deleteFolder(wsKey, folder.id)
      else if (id.indexOf('mvf:') === 0) {
        actions.moveFolder(folder.id, wsKey, wsKey, id.slice('mvf:'.length))
      } else if (id.indexOf('mvws:') === 0) {
        actions.moveFolder(folder.id, wsKey, id.slice('mvws:'.length), null)
      }
    }
  })
  if (scope.collapsed[folder.id]) return [row]
  return [
    row,
    ...children.flatMap((child) => renderFolder(scope, wsKey, child, depth + 1, sessions)),
    ...members.map((sessionId) => renderSessionRow(scope, wsKey, sessionId, depth + 1, folder.id))
  ]
}

export function renderWorkspace(scope, workspace) {
  const t = scope.t
  const actions = scope.actions
  const wsKey = workspaceKey(workspace)
  const enabled = !scope.disabledWorkspaces.has(wsKey)
  const state = enabled ? foldersOf(scope.store, wsKey) : []
  const known = new Set(state.map((folder) => folder.id))
  const sessions = enabled ? sessionsFor(scope, wsKey, workspace) : []
  const flat = enabled ? [] : flatSessions(scope, workspace)
  // Sessions whose folder was deleted fall back to the workspace root.
  const rootSessions = enabled
    ? sessions.filter((sessionId) => {
        const folderId = folderOfSession(scope, sessionId, wsKey)
        return !folderId || !known.has(folderId)
      })
    : []
  const rootFolders = state.filter((folder) => !folder.parentId || !known.has(folder.parentId))
  const isDropRoot = scope.dropTarget === 'root:' + wsKey
  const collapsed = Boolean(scope.collapsed['ws:' + wsKey])
  return h(
    'div',
    { key: 'workspace:' + wsKey },
    h(WorkspaceRow, {
      t,
      label: workspaceLabel(workspace),
      path: workspace.path || wsKey,
      collapsed,
      editing:
        scope.editing && scope.editing.target === 'workspace' && scope.editing.workspaceId === wsKey
          ? scope.editing
          : null,
      dropActive: enabled && isDropRoot,
      onToggle: () => actions.toggleWorkspace(wsKey),
      onNewSession: () => actions.startSession(wsKey),
      onAddFolder: enabled ? () => actions.addFolder(wsKey, null) : null,
      onRename: () => actions.beginWorkspaceEditing(workspace),
      onEditChange: (value) => {
        const current = scope.editingRef.current
        if (current) actions.beginEditing(Object.assign({}, current, { value }))
      },
      onEditCommit: actions.commitEditing,
      onEditCancel: actions.cancelEditing,
      onDragOver: enabled ? () => actions.setDropTarget('root:' + wsKey) : () => undefined,
      onDragLeave: enabled
        ? () => actions.setDropTarget((prev) => (prev === 'root:' + wsKey ? null : prev))
        : () => undefined,
      onDrop: enabled ? actions.dropOn(wsKey, null) : () => undefined
    }),
    collapsed
      ? null
      : enabled
        ? h(
            'div',
            {
              className: 'wsf-list' + (isDropRoot ? ' wsf-list--drop' : ''),
              style: { flex: 'none', overflow: 'visible', paddingBottom: 0 },
              role: 'group',
              onDragOver: (event) => {
                event.preventDefault()
                actions.setDropTarget('root:' + wsKey)
              },
              onDrop: actions.dropOn(wsKey, null)
            },
            rootFolders.flatMap((folder) => renderFolder(scope, wsKey, folder, 0, sessions)),
            rootSessions.map((sessionId) => renderSessionRow(scope, wsKey, sessionId, 0, null)),
            !state.length && !sessions.length
              ? h('div', { className: 'wsf-empty' }, t('state.dropHint'))
              : null
          )
        : h(
            'div',
            {
              className: 'wsf-list',
              style: { flex: 'none', overflow: 'visible', paddingBottom: 0 },
              role: 'group'
            },
            flat.map((sessionId) =>
              renderSessionRow(scope, wsKey, sessionId, 0, null, { movable: false })
            ),
            flat.length ? null : h('div', { className: 'wsf-empty' }, t('state.empty'))
          )
  )
}

export function renderRegion(scope) {
  const t = scope.t
  const rail = scope.rail
  return h(
    'div',
    {
      className: 'wsf-root' + (rail ? ' wsf-root--rail' : ''),
      'data-workspace-tree': ''
    },
    h(
      'div',
      { className: 'wsf-header' },
      rail ? null : h('span', { className: 'wsf-header-label' }, t('section.title')),
      h(
        'div',
        { className: 'wsf-header-actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'wsf-icon-button',
            'aria-label': t('section.addWorkspace'),
            title: t('section.addWorkspace'),
            onClick: scope.actions.addWorkspace
          },
          h(IconProjectAddOutlineRegular, { size: rail ? 18 : 16 })
        )
      )
    ),
    h(
      'div',
      { className: 'wsf-list', role: 'tree' },
      scope.workspaces.length
        ? scope.workspaces.map((workspace) => renderWorkspace(scope, workspace))
        : h('div', { className: 'wsf-empty' }, t('state.noWorkspace'))
    )
  )
}
