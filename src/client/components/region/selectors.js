/**
 * Pure selectors over the workspace and session snapshots.
 *
 * Every function here takes the data it needs instead of closing over component
 * state, so the visibility and ordering rules can be reasoned about on their own.
 */
import { foldersOf, sessionIdsOf } from '../../store.js'

// Hidden: subagent runs, and blank sessions other than the one currently open.
export function sessionVisible(sessionId, summary, currentMainId) {
  if (!summary || summary.origin === 'subagent') return false
  if (summary.blank && sessionId !== currentMainId) return false
  return true
}

export function visibleSessions(scope, workspace) {
  return sessionIdsOf(workspace).filter(
    (sessionId) =>
      !scope.archivedIds.has(sessionId) &&
      !scope.deletedIds.has(sessionId) &&
      sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId),
  )
}

// Folder names from the root down, as shown in the move submenus.
export function folderPathLabel(folders, folderId, t) {
  const names = []
  let cursor = folders.find((folder) => folder.id === folderId)
  let guard = 0
  while (cursor && guard < 20) {
    names.unshift(cursor.name || t('folder.untitled'))
    cursor = cursor.parentId ? folders.find((folder) => folder.id === cursor.parentId) : null
    guard += 1
  }
  return names.join(' / ')
}

// The folder a session belongs to; without a placement record it sits at its own root.
export function folderOfSession(scope, sessionId, wsKey) {
  const placement = scope.placements[sessionId]
  if (!placement || placement.workspaceId !== wsKey || !placement.folderId) return null
  return foldersOf(scope.store, wsKey).some((folder) => folder.id === placement.folderId)
    ? placement.folderId
    : null
}

// Sessions rendered here: own sessions that stayed, plus sessions moved in from elsewhere.
export function sessionsFor(scope, wsKey, workspace) {
  const result = []
  const seen = new Set()
  for (const sessionId of visibleSessions(scope, workspace)) {
    const placement = scope.placements[sessionId]
    if (placement && placement.workspaceId && placement.workspaceId !== wsKey) continue
    result.push(sessionId)
    seen.add(sessionId)
  }
  for (const sessionId of Object.keys(scope.placements)) {
    const placement = scope.placements[sessionId]
    if (!placement || placement.workspaceId !== wsKey || seen.has(sessionId)) continue
    if (scope.deletedIds.has(sessionId) || scope.archivedIds.has(sessionId)) continue
    if (!sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId)) continue
    result.push(sessionId)
    seen.add(sessionId)
  }
  // Blank sessions sort first, matching the built-in browser.
  const rank = (sessionId) =>
    scope.sessionsById[sessionId] && scope.sessionsById[sessionId].blank ? 0 : 1
  return result.sort((a, b) => rank(a) - rank(b))
}

export function timeOf(sessionsById, sessionId) {
  const summary = sessionsById[sessionId]
  if (!summary || !summary.updatedAt) return 0
  const value = typeof summary.updatedAt === 'number' ? summary.updatedAt : Date.parse(summary.updatedAt)
  return Number.isFinite(value) ? value : 0
}

// An unchecked workspace stays flat: newest first, with no folders or drag handles.
export function flatSessions(scope, workspace) {
  return sessionIdsOf(workspace)
    .filter(
      (sessionId) =>
        !scope.archivedIds.has(sessionId) &&
        !scope.deletedIds.has(sessionId) &&
        sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId),
    )
    .sort((a, b) => timeOf(scope.sessionsById, b) - timeOf(scope.sessionsById, a))
}

// A folder plus everything below it; used to keep a folder out of its own subtree.
export function subtreeIds(folders, folderId) {
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
