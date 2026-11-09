/**
 * Folder tree and placement persistence, plus the shared settings store.
 */
import { React } from './platform.js'
import { STORE_KEY, LEGACY_KEY, SETTINGS_KEY, PREFIX_KEY } from './constants.js'
export function uid() {
  return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function normalizeStore(parsed) {
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

export function loadStore() {
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

export function saveStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch (error) {
    // When localStorage is unavailable, grouping falls back to in-memory state.
  }
}

// Grouping only applies to checked workspaces; settings and sidebar share this state.
export const settingsListeners = new Set()

export function loadSettings() {
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

export let settingsState = loadSettings()

export function saveSettings(next) {
  settingsState = next
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch (error) {
    // A failed write only loses the checkbox state on the next start, never a session.
  }
  for (const listener of settingsListeners) listener(next)
}

export function useSettings() {
  const [value, setValue] = React.useState(settingsState)
  React.useEffect(() => {
    settingsListeners.add(setValue)
    setValue(settingsState)
    return () => settingsListeners.delete(setValue)
  }, [])
  return value
}

// Prefixes added before an uninstall are recorded here, so a later load restores exactly those titles and never strips a marker the user typed.
export function loadPrefixed() {
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

export function savePrefixed(map) {
  try {
    window.localStorage.setItem(PREFIX_KEY, JSON.stringify(map))
  } catch (error) {
    // If the record cannot be stored, titles simply stay prefixed after reinstalling.
  }
}

export function workspaceKey(workspace) {
  return workspace.workspaceId || workspace.id || workspace.path || ''
}

export function workspaceLabel(workspace) {
  if (workspace.title) return workspace.title
  if (workspace.path) {
    const parts = String(workspace.path).split(/[\\/]/).filter(Boolean)
    return parts.length ? parts[parts.length - 1] : workspace.path
  }
  return workspaceKey(workspace)
}

export function sessionIdsOf(workspace) {
  return workspace && Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []
}

// The built-in row shows a compact relative time (5m, 3h); match that format.

export function foldersOf(store, wsKey) {
  const entry = store.byWorkspace[wsKey]
  return entry && Array.isArray(entry.folders) ? entry.folders : []
}
