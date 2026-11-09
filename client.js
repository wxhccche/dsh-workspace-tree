/**
 * Workspace Tree — client half.
 *
 * Takes over the `sidebar.workspaces` slot (a single slot, so a lower priority
 * wins over the built-in browser) and renders the same session list with
 * user-defined folders, drag and drop, and per-session context menus.
 *
 * It also contributes a configuration page through `plugins.bundle.config`,
 * where a workspace opts in to folders and where the trash created by the host
 * half can be inspected and cleared.
 *
 * Grouping is persisted in localStorage next to the app's own UI state, so
 * removing the plugin never touches session data on disk.
 */
window.__ModuleLoader__.load({
  id: '@local/workspace-tree',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    // Reuse the app's own menu and icons so rows match the built-in browser visuals.
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
    const Menu = primitives.Menu
    const IconEllipsisOutlineRegular = primitives.IconEllipsisOutlineRegular
    const IconFolderOpenRegular = primitives.IconFolderOpenRegular
    const IconFolderCloseRegular = primitives.IconFolderCloseRegular
    const IconTriangleRightFillRegular = primitives.IconTriangleRightFillRegular
    const IconNewChatOutlineRegular = primitives.IconNewChatOutlineRegular
    const IconPlusOutlineRegular = primitives.IconPlusOutlineRegular
    const IconEditOutlineRegular = primitives.IconEditOutlineRegular
    const IconTrashOutlineRegular = primitives.IconTrashOutlineRegular
    const IconProjectAddOutlineRegular = primitives.IconProjectAddOutlineRegular
    const IconArchiveOutlineRegular = primitives.IconArchiveOutlineRegular
    const writeClipboard = primitives.writeClipboard

    const NS = 'local.workspaceTree'
    const STORE_KEY = 'dsh.workspace-tree.store.v2'
    const LEGACY_KEY = 'dsh.workspace-tree.folders.v1'
    const SETTINGS_KEY = 'dsh.workspace-tree.settings.v1'
    const PREFIX_KEY = 'dsh.workspace-tree.prefixed.v1'

    const en = {
      'section.title': 'Workspaces',
      'section.addWorkspace': 'Add workspace',
      'section.newSession': 'New session',
      'section.addFolder': 'Add folder',
      'section.workspaceActions': 'Workspace actions',
      'workspace.rename': 'Rename workspace',
      'folder.addChild': 'Add subfolder',
      'folder.rename': 'Rename',
      'folder.delete': 'Delete',
      'folder.moveTo': 'Move to',
      'folder.moveRoot': 'Workspace root',
      'folder.untitled': 'New folder',
      'folder.placeholder': 'Folder name',
      'folder.actions': 'Folder actions',
      'folder.deleteConfirm':
        'Delete this folder? Sessions inside move back to the workspace root.',
      'session.new': 'New session',
      'session.untitled': 'Untitled session',
      'session.rename': 'Rename',
      'session.copyId': 'Copy session ID',
      'session.fork': 'Fork session',
      'session.archive': 'Archive session',
      'session.archiveConfirm': 'Archive this session?',
      'session.delete': 'Delete session',
      'session.deleteConfirm':
        'Delete this session? Its log moves to the DSH session trash instead of being erased.',
      'session.deleteFailed': 'Could not delete this session.',
      'session.deleteOpen': 'This session is open. Close it before deleting it.',
      'session.moveTo': 'Move to',
      'session.moveRoot': 'Workspace root',
      'session.actions': 'Session actions',
      'state.noWorkspace': 'No workspace yet.',
      'state.dropHint': 'Drag sessions or folders to group them.',
      'state.empty': 'No sessions yet.',
      'config.workspaces': 'Workspaces using this plugin',
      'config.workspacesHint':
        'Uncheck a workspace to show its sessions as a flat list, without folders or drag and drop.',
      'config.workspacesEmpty': 'No workspaces yet.',
      'config.names': 'Session titles before uninstalling',
      'config.namesHint':
        'Folder grouping lives in this plugin, so removing the plugin loses it. Put each workspace folder name in front of its session titles first; the plugin strips those prefixes again the next time it loads.',
      'config.namesButton': 'Add workspace names to titles',
      'config.namesConfirm':
        'Rename sessions in every enabled workspace, adding the workspace folder name as a prefix?',
      'config.namesRunning': 'Renaming {done}/{total}…',
      'config.namesDone': 'Renamed {n} sessions.',
      'config.namesFailed': 'Some sessions could not be renamed.',
      'config.namesPending': '{n} prefixed sessions will be restored on load.',
      'config.trash': 'Deleted sessions',
      'config.trashLoading': 'Checking the trash…',
      'config.trashFailed': 'Could not read the trash.',
      'config.trashEmpty': 'The trash is empty.',
      'config.trashCount': '{n} sessions in the trash ({size})',
      'config.trashClear': 'Empty the trash',
      'config.trashClearing': 'Emptying…',
      'config.trashConfirm': 'Delete every session in the trash permanently?',
    }

    const zh = {
      'section.title': '工作区',
      'section.addWorkspace': '添加工作区',
      'section.newSession': '新建会话',
      'section.addFolder': '添加目录',
      'section.workspaceActions': '工作区操作',
      'workspace.rename': '重命名工作区',
      'folder.addChild': '添加子目录',
      'folder.rename': '重命名',
      'folder.delete': '删除',
      'folder.moveTo': '移动到',
      'folder.moveRoot': '工作区根目录',
      'folder.untitled': '新目录',
      'folder.placeholder': '目录名称',
      'folder.actions': '目录操作',
      'folder.deleteConfirm': '删除该目录？其中的会话会移回工作区根目录。',
      'session.new': '新建会话',
      'session.untitled': '未命名会话',
      'session.rename': '重命名',
      'session.copyId': '复制会话 ID',
      'session.fork': 'Fork 会话',
      'session.archive': '归档会话',
      'session.archiveConfirm': '归档这个会话？',
      'session.delete': '删除会话',
      'session.deleteConfirm': '删除这个会话？日志会移到 DSH 的 session-trash，不会彻底抹掉。',
      'session.deleteFailed': '无法删除该会话。',
      'session.deleteOpen': '该会话正在使用中，请先关闭再删除。',
      'session.moveTo': '移动到',
      'session.moveRoot': '工作区根目录',
      'session.actions': '会话操作',
      'state.noWorkspace': '还没有工作区。',
      'state.dropHint': '把会话或目录拖到目标位置即可分组。',
      'state.empty': '还没有会话。',
      'config.workspaces': '应用插件的工作区',
      'config.workspacesHint': '取消勾选后，该工作区退化为平铺会话列表：不分目录，也不能拖拽。',
      'config.workspacesEmpty': '还没有工作区。',
      'config.names': '卸载前的会话名',
      'config.namesHint':
        '目录分组存在插件自己这里，移除插件后分组就没了。先把工作区目录名加到会话标题前面；下次加载插件时会自动去掉这些前缀。',
      'config.namesButton': '给启用工作区的会话加前缀',
      'config.namesConfirm': '给所有启用工作区的会话标题加上工作区目录名前缀？',
      'config.namesRunning': '正在重命名 {done}/{total}…',
      'config.namesDone': '已重命名 {n} 个会话。',
      'config.namesFailed': '部分会话重命名失败。',
      'config.namesPending': '{n} 个带前缀的会话会在加载时还原。',
      'config.trash': '已删除会话',
      'config.trashLoading': '正在检查回收目录…',
      'config.trashFailed': '读取回收目录失败。',
      'config.trashEmpty': '回收目录是空的。',
      'config.trashCount': '回收目录里有 {n} 个会话（{size}）',
      'config.trashClear': '清空回收目录',
      'config.trashClearing': '正在清空…',
      'config.trashConfirm': '彻底删除回收目录里的所有会话？',
    }

    // Row height, indentation and hover colors mirror the built-in sidebar (the Rows and
    // WorkspaceBrowser style modules); hash-named CSS modules become wsf-* classes.
    const css = `
.wsf-root {
  --dsh-session-list-edge-inset: var(--dsh-sidebar-inline-padding, 8px);
  --dsh-session-list-scrollbar-width: 5px;
  --dsh-session-list-scrollbar-offset: 2px;
  box-sizing: border-box;
  min-height: 0;
  padding-right: var(--dsh-session-list-edge-inset);
  flex-direction: column;
  flex: 1;
  display: flex;
  color: var(--dsw-alias-label-primary);
}
.wsf-root--rail { padding-right: 0; }
.wsf-header {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-md);
  height: 36px;
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  margin-right: -4px;
  margin-bottom: 4px;
  padding-left: 4px;
  display: flex;
  overflow: hidden;
}
.wsf-header-label {
  white-space: nowrap;
  min-width: 0;
  max-width: 45%;
  flex: none;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wsf-header-actions {
  flex: none;
  align-items: center;
  gap: 4px;
  display: flex;
  overflow: hidden;
  margin-left: auto;
}
.wsf-icon-button {
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
  width: 28px;
  height: 28px;
  color: var(--dsw-alias-label-secondary);
  background: 0 0;
  border: none;
  flex: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
}
.wsf-icon-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.wsf-icon-button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary);
  outline-offset: -2px;
}
.wsf-list {
  min-height: 0;
  margin-left: -4px;
  margin-right: var(--dsh-session-list-scrollbar-offset);
  padding-left: 4px;
  padding-right: calc(var(--dsh-session-list-edge-inset) - var(--dsh-session-list-scrollbar-width) - var(--dsh-session-list-scrollbar-offset));
  scrollbar-gutter: stable;
  flex: 1;
  padding-bottom: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wsf-list--drop { background: var(--dsw-alias-interactive-bg-hover); border-radius: var(--dsw-radius-md); }
.wsf-row {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-md);
  padding: 0 8px;
  padding-inline-start: calc(8px + var(--wsf-indent, 0px) + var(--dsh-workspace-indent, 0px));
  cursor: pointer;
  user-select: none;
  color: var(--dsw-alias-label-primary);
  align-items: center;
  gap: 6px;
  display: flex;
}
.wsf-row:hover,
.wsf-row--menu { background: var(--dsw-alias-interactive-bg-hover); }
.wsf-row:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary);
  outline-offset: -2px;
}
.wsf-row--project { height: 34px; }
.wsf-row--session { gap: 0; height: 32px; }
.wsf-row--drop {
  background: var(--dsw-alias-interactive-bg-hover);
  outline: 1px dashed var(--dsw-alias-state-business-primary);
  outline-offset: -1px;
}
.wsf-row--dragging { opacity: 0.45; }
.wsf-slot {
  width: 16px;
  height: 20px;
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  justify-content: center;
  align-items: center;
  display: inline-flex;
}
.wsf-row--project .wsf-chevron { display: none; color: var(--dsw-alias-label-caption); }
.wsf-row--project:hover .wsf-chevron { display: inline-flex; }
.wsf-row--project:hover .wsf-folder { display: none; }
.wsf-arrow { transition: transform 0.15s var(--ds-ease-in-out); }
.wsf-arrow--open { transform: rotate(90deg); }
.wsf-text { flex-direction: column; flex: 1; gap: 2px; min-width: 0; display: flex; }
.wsf-row--session .wsf-text { flex-direction: row; flex: 1; align-items: center; }
.wsf-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
}
.wsf-row--session .wsf-title { margin: 0 6px 0 4px; flex: 1; }
.wsf-time {
  flex: none;
  margin-right: 6px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}
.wsf-row--session:hover .wsf-time { display: none; }
.wsf-row--selected { background: var(--dsw-alias-interactive-bg-hover); }
.wsf-actions { flex: none; align-items: center; gap: 15px; display: none; }
.wsf-row:hover .wsf-actions,
.wsf-row--menu .wsf-actions { display: inline-flex; }
.wsf-action {
  border-radius: var(--dsw-radius-xs);
  cursor: pointer;
  width: 16px;
  height: 16px;
  color: var(--dsw-alias-label-tertiary);
  background: 0 0;
  border: none;
  flex: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
}
.wsf-action:hover { color: var(--dsw-alias-label-primary); }
.wsf-input {
  box-sizing: border-box;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-button-elevated-fill);
  min-width: 0;
  width: 100%;
  color: inherit;
  outline: none;
  padding: 0 2px;
  font-size: 14px;
  line-height: 20px;
}
.wsf-empty { color: var(--dsw-alias-label-tertiary); padding: 16px 12px; font-size: 13px; }
.wsf-config { display: flex; flex-direction: column; gap: 16px; }
.wsf-config-section { display: flex; flex-direction: column; gap: 8px; }
.wsf-config-title { font-size: 14px; line-height: 20px; color: var(--dsw-alias-label-primary); }
.wsf-config-hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.wsf-config-list { display: flex; flex-direction: column; gap: 2px; }
.wsf-config-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
}
.wsf-config-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.wsf-config-name { font-size: 13px; line-height: 18px; color: var(--dsw-alias-label-primary); }
.wsf-config-path {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.wsf-config-actions { display: flex; gap: 8px; }
.wsf-button {
  padding: 4px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
}
.wsf-button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.wsf-button:disabled { color: var(--dsw-alias-label-tertiary); cursor: default; }
@media (prefers-reduced-motion: reduce) { .wsf-arrow { transition: none; } }
`

    function uid() {
      return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    }

    function normalizeStore(parsed) {
      const empty = { v: 2, byWorkspace: {}, placements: {} }
      if (!parsed || typeof parsed !== 'object') return empty
      const byWorkspace = {}
      const raw = parsed.byWorkspace
      if (raw && typeof raw === 'object') {
        for (const key of Object.keys(raw)) {
          const entry = raw[key]
          if (!entry || !Array.isArray(entry.folders)) continue
          byWorkspace[key] = {
            folders: entry.folders
              .filter((folder) => folder && folder.id)
              .map((folder) => ({
                id: String(folder.id),
                name: typeof folder.name === 'string' ? folder.name : '',
                parentId: folder.parentId ? String(folder.parentId) : null,
              })),
          }
        }
      }
      const placements = {}
      // v1 stored ownership per workspace in 'assigned'; v2 keeps one global placements map.
      for (const key of Object.keys(byWorkspace)) {
        const legacyAssigned = raw[key] && raw[key].assigned
        if (!legacyAssigned || typeof legacyAssigned !== 'object') continue
        for (const sessionId of Object.keys(legacyAssigned)) {
          const folderId = legacyAssigned[sessionId]
          if (folderId) placements[sessionId] = { workspaceId: key, folderId: String(folderId) }
        }
      }
      if (parsed.placements && typeof parsed.placements === 'object') {
        for (const sessionId of Object.keys(parsed.placements)) {
          const placement = parsed.placements[sessionId]
          if (!placement || !placement.workspaceId) continue
          placements[sessionId] = {
            workspaceId: String(placement.workspaceId),
            folderId: placement.folderId ? String(placement.folderId) : null,
          }
        }
      }
      return { v: 2, byWorkspace, placements }
    }

    function loadStore() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY)
        if (raw) return normalizeStore(JSON.parse(raw))
        const legacy = window.localStorage.getItem(LEGACY_KEY)
        if (legacy) return normalizeStore(JSON.parse(legacy))
      } catch (error) {
        return { v: 2, byWorkspace: {}, placements: {} }
      }
      return { v: 2, byWorkspace: {}, placements: {} }
    }

    function saveStore(store) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
      } catch (error) {
        // When localStorage is unavailable, grouping falls back to in-memory state.
      }
    }

    // Grouping only applies to checked workspaces; settings and sidebar share this state.
    const settingsListeners = new Set()

    function loadSettings() {
      try {
        const raw = window.localStorage.getItem(SETTINGS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          const disabled = Array.isArray(parsed && parsed.disabled)
            ? parsed.disabled.filter((id) => typeof id === 'string')
            : []
          return { disabled }
        }
      } catch (error) {
        return { disabled: [] }
      }
      return { disabled: [] }
    }

    let settingsState = loadSettings()

    function saveSettings(next) {
      settingsState = next
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      } catch (error) {
        // A failed write only loses the checkbox state on the next start, never a session.
      }
      for (const listener of settingsListeners) listener(next)
    }

    function useSettings() {
      const [value, setValue] = React.useState(settingsState)
      React.useEffect(() => {
        settingsListeners.add(setValue)
        setValue(settingsState)
        return () => settingsListeners.delete(setValue)
      }, [])
      return value
    }

    // Prefixes added before an uninstall are recorded here, so a later load restores exactly those titles and never strips a marker the user typed.
    function loadPrefixed() {
      try {
        const raw = window.localStorage.getItem(PREFIX_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        const result = {}
        if (parsed && typeof parsed === 'object') {
          for (const sessionId of Object.keys(parsed)) {
            if (typeof parsed[sessionId] === 'string') result[sessionId] = parsed[sessionId]
          }
        }
        return result
      } catch (error) {
        return {}
      }
    }

    function savePrefixed(map) {
      try {
        window.localStorage.setItem(PREFIX_KEY, JSON.stringify(map))
      } catch (error) {
        // If the record cannot be stored, titles simply stay prefixed after reinstalling.
      }
    }

    function rootNameOf(workspace) {
      const path = workspace && workspace.path ? String(workspace.path) : ''
      const parts = path.split(/[\\/]/).filter(Boolean)
      if (parts.length) return parts[parts.length - 1]
      return workspaceLabel(workspace)
    }

    function prefixOf(workspace) {
      return '[' + rootNameOf(workspace) + '] '
    }

    async function renameSession(service, sessionId, title) {
      const result = await service.using(sessionId, { source: 'workspaceOperation' }, (reference) =>
        reference.binding.session.rename(title),
      )
      if (result && result.ok === false) throw new Error('rename failed: ' + sessionId)
      return true
    }

    function workspaceKey(workspace) {
      return workspace.workspaceId || workspace.id || workspace.path || ''
    }

    function workspaceLabel(workspace) {
      if (workspace.title) return workspace.title
      if (workspace.path) {
        const parts = String(workspace.path).split(/[\\/]/).filter(Boolean)
        return parts.length ? parts[parts.length - 1] : workspace.path
      }
      return workspaceKey(workspace)
    }

    function sessionIdsOf(workspace) {
      return workspace && Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []
    }

    // The built-in row shows a compact relative time (5m, 3h); match that format.
    function shortTimeText(updatedAt) {
      if (!updatedAt) return ''
      const value = typeof updatedAt === 'number' ? updatedAt : Date.parse(updatedAt)
      if (!Number.isFinite(value)) return ''
      const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000))
      if (minutes < 1) return 'now'
      if (minutes < 60) return minutes + 'm'
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return hours + 'h'
      return Math.floor(hours / 24) + 'd'
    }

    function foldersOf(store, wsKey) {
      const entry = store.byWorkspace[wsKey]
      return entry && Array.isArray(entry.folders) ? entry.folders : []
    }

    function clsx(parts) {
      return parts.filter(Boolean).join(' ')
    }

    // A folder row mirrors the built-in session row; its actions live in the overflow menu.
    function FolderRow(props) {
      const { t, folder, depth, collapsed, editing, dropActive, dragging, menuItems } = props
      const [menuOpen, setMenuOpen] = React.useState(false)
      const name = folder.name || t('folder.untitled')
      return h(
        'div',
        {
          className: clsx([
            'wsf-row',
            'wsf-row--project',
            menuOpen && 'wsf-row--menu',
            dropActive && 'wsf-row--drop',
            dragging && 'wsf-row--dragging',
          ]),
          style: { '--wsf-indent': 8 + depth * 14 + 'px' },
          role: 'treeitem',
          tabIndex: 0,
          'aria-expanded': !collapsed,
          onKeyDown: (event) => {
            // Menu buttons and the rename input sit inside the row; only row-level keys are handled.
            if (event.target !== event.currentTarget) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              props.onToggle()
            } else if (event.key === 'ArrowRight' && collapsed) {
              event.preventDefault()
              props.onToggle()
            } else if (event.key === 'ArrowLeft' && !collapsed) {
              event.preventDefault()
              props.onToggle()
            }
          },
          draggable: !editing,
          onClick: () => {
            if (!editing) props.onToggle()
          },
          onDragStart: props.onDragStart,
          onDragEnd: props.onDragEnd,
          onDragOver: (event) => {
            event.preventDefault()
            event.stopPropagation()
            props.onDragOver(event)
          },
          onDragLeave: props.onDragLeave,
          onDrop: props.onDrop,
        },
        h(
          'span',
          { className: 'wsf-slot wsf-folder' },
          h(collapsed ? IconFolderCloseRegular : IconFolderOpenRegular),
        ),
        h(
          'span',
          { className: 'wsf-slot wsf-chevron' },
          h(IconTriangleRightFillRegular, {
            className: clsx(['wsf-arrow', !collapsed && 'wsf-arrow--open']),
          }),
        ),
        h(
          'span',
          { className: 'wsf-text' },
          editing
            ? h('input', {
                className: 'wsf-input',
                autoFocus: true,
                value: editing.value,
                placeholder: t('folder.placeholder'),
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    props.onEditCommit()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    props.onEditCancel()
                  }
                },
              })
            : h('span', { className: 'wsf-title', title: name }, name),
        ),
        h(
          'span',
          { className: 'wsf-actions' },
          h(Menu, {
            open: menuOpen,
            onClose: () => setMenuOpen(false),
            items: menuItems,
            onSelect: (id) => {
              setMenuOpen(false)
              props.onMenuSelect(id)
            },
            portal: true,
            closeOnPointerLeave: true,
            anchor: h(
              'button',
              {
                type: 'button',
                className: 'wsf-action',
                'aria-label': t('folder.actions'),
                title: t('folder.actions'),
                onClick: (event) => {
                  event.stopPropagation()
                  setMenuOpen((open) => !open)
                },
              },
              h(IconEllipsisOutlineRegular),
            ),
          }),
          props.onNewSession
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'wsf-action',
                  'aria-label': t('section.newSession'),
                  title: t('section.newSession'),
                  style: { width: 20, height: 20 },
                  onClick: (event) => {
                    event.stopPropagation()
                    props.onNewSession()
                  },
                },
                h(IconNewChatOutlineRegular),
              )
            : null,
        ),
      )
    }

    function SessionRow(props) {
      const { t, title, depth, dropActive, dragging, menuItems, editing, selected, time } = props
      const [menuOpen, setMenuOpen] = React.useState(false)
      return h(
        'div',
        {
          className: clsx([
            'wsf-row',
            'wsf-row--session',
            menuOpen && 'wsf-row--menu',
            dropActive && 'wsf-row--drop',
            dragging && 'wsf-row--dragging',
            selected && 'wsf-row--selected',
          ]),
          style: { '--wsf-indent': 8 + depth * 14 + 'px' },
          role: 'treeitem',
          tabIndex: 0,
          'aria-selected': Boolean(selected),
          title: props.path || title,
          draggable: props.movable !== false && !editing,
          onClick: props.onOpen,
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              props.onOpen()
            } else if (event.key === 'F2') {
              event.preventDefault()
              props.onRename()
            }
          },
          onDragStart: props.onDragStart,
          onDragEnd: props.onDragEnd,
        },
        h(
          'span',
          { className: 'wsf-text' },
          editing
            ? h('input', {
                className: 'wsf-input',
                autoFocus: true,
                value: editing.value,
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    props.onEditCommit()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    props.onEditCancel()
                  }
                },
              })
            : h(
                'span',
                {
                  className: 'wsf-title',
                  onDoubleClick: (event) => {
                    event.stopPropagation()
                    props.onRename()
                  },
                },
                title,
              ),
        ),
        time ? h('span', { className: 'wsf-time' }, time) : null,
        h(
          'span',
          { className: 'wsf-actions' },
          h(Menu, {
            open: menuOpen,
            onClose: () => setMenuOpen(false),
            items: menuItems,
            onSelect: (id) => {
              setMenuOpen(false)
              props.onMenuSelect(id)
            },
            portal: true,
            closeOnPointerLeave: true,
            anchor: h(
              'button',
              {
                type: 'button',
                className: 'wsf-action',
                'aria-label': t('session.actions'),
                title: t('session.actions'),
                onClick: (event) => {
                  event.stopPropagation()
                  setMenuOpen((open) => !open)
                },
              },
              h(IconEllipsisOutlineRegular),
            ),
          }),
        ),
      )
    }

    function Region(props) {
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
      const sessionVisible = (sessionId, summary) => {
        if (!summary || summary.origin === 'subagent') return false
        if (summary.blank && sessionId !== currentMainId) return false
        return true
      }
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

      const subtreeIds = (folders, folderId) => {
        const remove = new Set([folderId])
        let grew = true
        while (grew) {
          grew = false
          for (const folder of folders) {
            if (!remove.has(folder.id) && folder.parentId && remove.has(folder.parentId)) {
              remove.add(folder.id)
              grew = true
            }
          }
        }
        return remove
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

      const visibleSessions = (workspace) =>
        sessionIdsOf(workspace).filter(
          (id) =>
            !archivedIds.has(id) &&
            !deletedIds.has(id) &&
            sessionVisible(id, sessionsById[id]),
        )

      const folderPathLabel = (folders, folderId) => {
        const names = []
        let cursor = folders.find((folder) => folder.id === folderId)
        let guard = 0
        while (cursor && guard < 20) {
          names.unshift(cursor.name || t('folder.untitled'))
          cursor = cursor.parentId
            ? folders.find((folder) => folder.id === cursor.parentId)
            : null
          guard += 1
        }
        return names.join(' / ')
      }

      // The folder a session belongs to; without a placement record it sits at its own root.
      const folderOfSession = (sessionId, wsKey) => {
        const placement = placements[sessionId]
        if (!placement || placement.workspaceId !== wsKey || !placement.folderId) return null
        return foldersOf(store, wsKey).some((folder) => folder.id === placement.folderId)
          ? placement.folderId
          : null
      }

      // Sessions rendered here: own sessions that stayed, plus sessions moved in from elsewhere.
      const sessionsFor = (wsKey, workspace) => {
        const result = []
        const seen = new Set()
        for (const sessionId of visibleSessions(workspace)) {
          const placement = placements[sessionId]
          if (placement && placement.workspaceId && placement.workspaceId !== wsKey) continue
          result.push(sessionId)
          seen.add(sessionId)
        }
        for (const sessionId of Object.keys(placements)) {
          const placement = placements[sessionId]
          if (!placement || placement.workspaceId !== wsKey || seen.has(sessionId)) continue
          if (deletedIds.has(sessionId) || archivedIds.has(sessionId)) continue
          if (!sessionVisible(sessionId, sessionsById[sessionId])) continue
          result.push(sessionId)
          seen.add(sessionId)
        }
        // Blank sessions sort first, matching the built-in browser.
        const rank = (sessionId) => (sessionsById[sessionId] && sessionsById[sessionId].blank ? 0 : 1)
        return result.sort((a, b) => rank(a) - rank(b))
      }

      // Built-in menu items (rename, copy id, fork, archive) plus folder and workspace moves.
      const sessionMenuItems = (wsKey, folderId, summary, sessionId) => {
        const items = []
        if (!summary.blank) {
          items.push({ id: 'rename', label: t('session.rename'), icon: h(IconEditOutlineRegular) })
          items.push({ id: 'copy', label: t('session.copyId') })
          items.push({ id: 'fork', label: t('session.fork') })
          items.push({
            id: 'archive',
            label: t('session.archive'),
            icon: h(IconArchiveOutlineRegular),
            danger: true,
          })
          // DSH only archives, so deletion is the Host half moving the session into the trash.
          items.push({
            id: 'delete',
            label: t('session.delete'),
            icon: h(IconTrashOutlineRegular),
            danger: true,
          })
        }
        // Move targets live in a submenu so the top-level menu stays short.
        const folders = foldersOf(store, wsKey)
        const moveTargets = []
        if (folderId) {
          moveTargets.push({
            id: 'mv:',
            label: t('session.moveRoot'),
            icon: h(IconFolderOpenRegular),
          })
        }
        for (const folder of folders) {
          moveTargets.push({
            id: 'mv:' + folder.id,
            label: folderPathLabel(folders, folder.id),
            icon: h(IconFolderOpenRegular),
          })
        }
        for (const other of workspaces) {
          const otherKey = workspaceKey(other)
          if (otherKey === wsKey) continue
          moveTargets.push({
            id: 'mvws:' + otherKey,
            label: workspaceLabel(other),
            icon: h(IconProjectAddOutlineRegular),
          })
        }
        if (moveTargets.length > 0) {
          items.push({
            id: 'move',
            label: t('session.moveTo'),
            icon: h(IconFolderOpenRegular),
            submenu: moveTargets,
          })
        }
        return items
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

      const renderSessionRow = (wsKey, workspace, sessionId, depth, folderId, options) => {
        const movable = !options || options.movable !== false
        const summary = sessionsById[sessionId] || {}
        const title = summary.blank ? t('session.new') : summary.title || t('session.untitled')
        const menuItems = sessionMenuItems(wsKey, folderId, summary, sessionId)
        return h(SessionRow, {
          key: 'session:' + sessionId,
          t,
          title,
          path: summary.cwd || sessionId,
          depth,
          selected: currentMainId === sessionId,
          time: summary.blank ? '' : shortTimeText(summary.updatedAt),
          menuItems,
          editing:
            editing && editing.target === 'session' && editing.sessionId === sessionId
              ? editing
              : null,
          dragging: Boolean(drag && drag.kind === 'session' && drag.sessionId === sessionId),
          onRename: () => beginSessionEditing(sessionId, summary),
          onEditChange: (value) => {
            const current = editingRef.current
            if (current) beginEditing(Object.assign({}, current, { value }))
          },
          onEditCommit: commitEditing,
          onEditCancel: cancelEditing,
          onMenuSelect: (id) => {
            if (id === 'rename') beginSessionEditing(sessionId, summary)
            else if (id === 'copy') copySessionId(sessionId)
            else if (id === 'fork') forkSession(sessionId)
            else if (id === 'archive') archiveSession(sessionId)
            else if (id === 'delete') deleteSession(sessionId)
            else if (id === 'mv:') setPlacement(sessionId, wsKey, null)
            else if (id.indexOf('mvws:') === 0) {
              setPlacement(sessionId, id.slice('mvws:'.length), null)
            } else if (id.indexOf('mv:') === 0) {
              setPlacement(sessionId, wsKey, id.slice('mv:'.length))
            }
          },
          onOpen: () => openSession(sessionId),
          movable,
          onDragStart: movable ? beginDrag({ kind: 'session', sessionId, wsKey }) : undefined,
          onDragEnd: endDrag,
        })
      }

      const renderFolder = (wsKey, workspace, folder, depth, sessions) => {
        const folders = foldersOf(store, wsKey)
        const children = folders.filter((item) => item.parentId === folder.id)
        const members = sessions.filter((id) => folderOfSession(id, wsKey) === folder.id)
        const isEditing = editing && editing.folderId === folder.id
        const isCollapsed = Boolean(collapsed[folder.id])
        const menuItems = [
          { id: 'child', label: t('folder.addChild'), icon: h(IconPlusOutlineRegular) },
          { id: 'rename', label: t('folder.rename'), icon: h(IconEditOutlineRegular) },
          { id: 'delete', label: t('folder.delete'), icon: h(IconTrashOutlineRegular), danger: true },
        ]
        // Same for folder moves; a folder never lists its own subtree as a target.
        const siblings = foldersOf(store, wsKey)
        const blocked = subtreeIds(siblings, folder.id)
        const folderTargets = [
          { id: 'mvws:' + wsKey, label: t('folder.moveRoot'), icon: h(IconFolderCloseRegular) },
        ]
        for (const target of siblings) {
          if (blocked.has(target.id)) continue
          folderTargets.push({
            id: 'mvf:' + target.id,
            label: folderPathLabel(siblings, target.id),
            icon: h(IconFolderOpenRegular),
          })
        }
        for (const other of workspaces) {
          const otherKey = workspaceKey(other)
          if (otherKey === wsKey) continue
          folderTargets.push({
            id: 'mvws:' + otherKey,
            label: workspaceLabel(other),
            icon: h(IconProjectAddOutlineRegular),
          })
        }
        menuItems.push({
          id: 'move',
          label: t('folder.moveTo'),
          icon: h(IconFolderOpenRegular),
          submenu: folderTargets,
        })
        const row = h(FolderRow, {
          key: 'folder:' + folder.id,
          t,
          folder,
          depth,
          collapsed: isCollapsed,
          editing: isEditing ? editing : null,
          dropActive: dropTarget === folder.id,
          dragging: Boolean(drag && drag.kind === 'folder' && drag.folderId === folder.id),
          menuItems,
          onNewSession: () => startSessionInFolder(wsKey, folder.id),
          onToggle: () => toggleFolder(folder.id),
          onDragStart: beginDrag({ kind: 'folder', folderId: folder.id, wsKey }),
          onDragEnd: endDrag,
          onDragOver: () => setDropTarget(folder.id),
          onDragLeave: () => setDropTarget((prev) => (prev === folder.id ? null : prev)),
          onDrop: dropOn(wsKey, folder.id),
          onEditChange: (value) => beginEditing({ wsKey, folderId: folder.id, value }),
          onEditCommit: commitEditing,
          onEditCancel: cancelEditing,
          onMenuSelect: (id) => {
            if (id === 'child') addFolder(wsKey, folder.id)
            else if (id === 'rename') beginEditing({ wsKey, folderId: folder.id, value: folder.name || '' })
            else if (id === 'delete') deleteFolder(wsKey, folder.id)
            else if (id.indexOf('mvf:') === 0) {
              moveFolder(folder.id, wsKey, wsKey, id.slice('mvf:'.length))
            } else if (id.indexOf('mvws:') === 0) {
              moveFolder(folder.id, wsKey, id.slice('mvws:'.length), null)
            }
          },
        })
        if (isCollapsed) return [row]
        return [
          row,
          ...children.map((child) => renderFolder(wsKey, workspace, child, depth + 1, sessions)),
          ...members.map((sessionId) =>
            renderSessionRow(wsKey, workspace, sessionId, depth + 1, folder.id),
          ),
        ]
      }

      const timeOf = (sessionId) => {
        const summary = sessionsById[sessionId]
        if (!summary || !summary.updatedAt) return 0
        const value =
          typeof summary.updatedAt === 'number'
            ? summary.updatedAt
            : Date.parse(summary.updatedAt)
        return Number.isFinite(value) ? value : 0
      }

      // An unchecked workspace stays flat: newest first, with no folders or drag handles.
      const flatSessions = (workspace) =>
        sessionIdsOf(workspace)
          .filter(
            (sessionId) =>
              !archivedIds.has(sessionId) &&
              !deletedIds.has(sessionId) &&
              sessionVisible(sessionId, sessionsById[sessionId]),
          )
          .sort((a, b) => timeOf(b) - timeOf(a))

      const renderWorkspace = (workspace) => {
        const wsKey = workspaceKey(workspace)
        const enabled = !disabledWorkspaces.has(wsKey)
        const state = enabled ? foldersOf(store, wsKey) : []
        const known = new Set(state.map((folder) => folder.id))
        const sessions = enabled ? sessionsFor(wsKey, workspace) : []
        const flat = enabled ? [] : flatSessions(workspace)
        const rootSessions = enabled
          ? sessions.filter((sessionId) => {
              const folderId = folderOfSession(sessionId, wsKey)
              return !folderId || !known.has(folderId)
            })
          : []
        const rootFolders = state.filter((folder) => !folder.parentId || !known.has(folder.parentId))
        const isDropRoot = dropTarget === 'root:' + wsKey
        return h(
          'div',
          { key: 'workspace:' + wsKey },
          h(WorkspaceRow, {
            t,
            label: workspaceLabel(workspace),
            path: workspace.path || wsKey,
            collapsed: Boolean(collapsed['ws:' + wsKey]),
            editing:
              editing && editing.target === 'workspace' && editing.workspaceId === wsKey
                ? editing
                : null,
            dropActive: enabled && isDropRoot,
            onToggle: () =>
              setCollapsed((prev) =>
                Object.assign({}, prev, { ['ws:' + wsKey]: !prev['ws:' + wsKey] }),
              ),
            onNewSession: () => startSession(wsKey),
            onAddFolder: enabled ? () => addFolder(wsKey, null) : null,
            onRename: () => beginWorkspaceEditing(workspace),
            onEditChange: (value) => {
              const current = editingRef.current
              if (current) beginEditing(Object.assign({}, current, { value }))
            },
            onEditCommit: commitEditing,
            onEditCancel: cancelEditing,
            onDragOver: enabled ? () => setDropTarget('root:' + wsKey) : () => undefined,
            onDragLeave: enabled
              ? () => setDropTarget((prev) => (prev === 'root:' + wsKey ? null : prev))
              : () => undefined,
            onDrop: enabled ? dropOn(wsKey, null) : () => undefined,
          }),
          collapsed['ws:' + wsKey]
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
                      setDropTarget('root:' + wsKey)
                    },
                    onDrop: dropOn(wsKey, null),
                  },
                  rootFolders.flatMap((folder) => renderFolder(wsKey, workspace, folder, 0, sessions)),
                  rootSessions.map((sessionId) =>
                    renderSessionRow(wsKey, workspace, sessionId, 0, null),
                  ),
                  !state.length && !sessions.length
                    ? h('div', { className: 'wsf-empty' }, t('state.dropHint'))
                    : null,
                )
              : h(
                  'div',
                  {
                    className: 'wsf-list',
                    style: { flex: 'none', overflow: 'visible', paddingBottom: 0 },
                    role: 'group',
                  },
                  flat.map((sessionId) =>
                    renderSessionRow(wsKey, workspace, sessionId, 0, null, { movable: false }),
                  ),
                  flat.length ? null : h('div', { className: 'wsf-empty' }, t('state.empty')),
                ),
        )
      }

      const rail = props.wide === false
      return h(
        'div',
        {
          className: 'wsf-root' + (rail ? ' wsf-root--rail' : ''),
          'data-workspace-tree': '',
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
                onClick: addWorkspace,
              },
              h(IconProjectAddOutlineRegular, { size: rail ? 18 : 16 }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'wsf-list', role: 'tree' },
          workspaces.length
            ? workspaces.map((workspace) => renderWorkspace(workspace))
            : h('div', { className: 'wsf-empty' }, t('state.noWorkspace')),
        ),
      )
    }

    // Workspace row, matching the built-in project row: icon, chevron, title, actions.
    function WorkspaceRow(props) {
      const { t, label, collapsed, dropActive, editing } = props
      const [menuOpen, setMenuOpen] = React.useState(false)
      const items = [
        { id: 'rename', label: t('workspace.rename'), icon: h(IconEditOutlineRegular) },
      ]
      if (props.onAddFolder) {
        items.push({ id: 'folder', label: t('section.addFolder'), icon: h(IconFolderOpenRegular) })
      }
      return h(
        'div',
        {
          className: clsx([
            'wsf-row',
            'wsf-row--project',
            menuOpen && 'wsf-row--menu',
            dropActive && 'wsf-row--drop',
          ]),
          role: 'treeitem',
          'aria-expanded': !collapsed,
          'aria-level': 1,
          title: props.path,
          onClick: () => {
            if (!editing) props.onToggle()
          },
          onDragOver: (event) => {
            event.preventDefault()
            event.stopPropagation()
            props.onDragOver()
          },
          onDragLeave: props.onDragLeave,
          onDrop: props.onDrop,
        },
        h(
          'span',
          { className: 'wsf-slot wsf-folder' },
          h(collapsed ? IconFolderCloseRegular : IconFolderOpenRegular),
        ),
        h(
          'span',
          { className: 'wsf-slot wsf-chevron' },
          h(IconTriangleRightFillRegular, {
            className: clsx(['wsf-arrow', !collapsed && 'wsf-arrow--open']),
          }),
        ),
        h(
          'span',
          { className: 'wsf-text' },
          editing
            ? h('input', {
                className: 'wsf-input',
                autoFocus: true,
                value: editing.value,
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    props.onEditCommit()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    props.onEditCancel()
                  }
                },
              })
            : h('span', { className: 'wsf-title' }, label),
        ),
        h(
          'span',
          { className: 'wsf-actions' },
          h(Menu, {
            open: menuOpen,
            onClose: () => setMenuOpen(false),
            items,
            onSelect: (id) => {
              setMenuOpen(false)
              if (id === 'rename') props.onRename()
              else if (id === 'folder') props.onAddFolder()
            },
            portal: true,
            closeOnPointerLeave: true,
            anchor: h(
              'button',
              {
                type: 'button',
                className: 'wsf-action',
                'aria-label': t('section.workspaceActions'),
                title: t('section.workspaceActions'),
                onClick: (event) => {
                  event.stopPropagation()
                  setMenuOpen((open) => !open)
                },
              },
              h(IconEllipsisOutlineRegular),
            ),
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'wsf-action',
              'aria-label': t('section.newSession'),
              title: t('section.newSession'),
              style: { width: 20, height: 20 },
              onClick: (event) => {
                event.stopPropagation()
                props.onNewSession()
              },
            },
            h(IconNewChatOutlineRegular),
          ),
        ),
      )
    }

    function formatBytes(bytes) {
      if (!bytes) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      let value = bytes
      let index = 0
      while (value >= 1024 && index < units.length - 1) {
        value /= 1024
        index += 1
      }
      return (index === 0 ? String(value) : value.toFixed(1)) + ' ' + units[index]
    }

    // Configuration block for the plugin page: enabled workspaces, trash size and clearing.
    function ConfigPanel(props) {
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

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'en', en), 'workspace-tree locale en')
      ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'workspace-tree locale zh')
      ctx.effect(() => {
        const element = document.createElement('style')
        element.setAttribute('data-workspace-tree', '')
        element.textContent = css
        document.head.appendChild(element)
        return () => {
          element.remove()
        }
      }, 'workspace-tree styles')
      // priority -1 ranks below the built-in browser; a single slot renders the lowest priority.
      ctx.slots.inject('sidebar', () =>
        ctx.slots.register(
          {
            name: 'sidebar.workspaces',
            priority: -1,
            locale: NS,
            inject: () => ({
              uiWorkspace: ctx.uiWorkspace,
              workspaces: ctx.workspaces,
              sessions: ctx.sessions,
            }),
          },
          Region,
        ),
      )
      // Plugin page: render this configuration on the plugin's own page under Plugins.
      // The page keys entries by package name, but register the patch id as well to be safe.
      for (const key of ['@local/workspace-tree', 'workspace-tree']) {
        ctx.slots.inject('plugins.bundle.config', () =>
          ctx.slots.register(
            { name: 'plugins.bundle.config', key, locale: NS, inject: () => ({ sessions: ctx.sessions }) },
            ConfigPanel,
          ),
        )
      }
    }

    return {
      inject: ['slots', 'locale', 'uiWorkspace', 'workspaces', 'sessions'],
      apply,
    }
  },
})
