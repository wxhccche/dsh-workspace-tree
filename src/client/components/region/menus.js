/**
 * Context menu definitions for session and folder rows.
 *
 * Items are plain data plus icon elements, so the rows stay presentational and
 * the move targets can be derived from the current tree without touching state.
 */
import {
  h,
  IconArchiveOutlineRegular,
  IconEditOutlineRegular,
  IconFolderCloseRegular,
  IconFolderOpenRegular,
  IconPlusOutlineRegular,
  IconProjectAddOutlineRegular,
  IconTrashOutlineRegular
} from '../../platform.js'
import { foldersOf, workspaceKey, workspaceLabel } from '../../store.js'
import { folderPathLabel, subtreeIds } from './selectors.js'

// Built-in menu items (rename, copy id, fork, archive) plus folder and workspace moves.
export function sessionMenuItems(scope, wsKey, folderId, summary) {
  const t = scope.t
  const items = []
  if (!summary.blank) {
    items.push({ id: 'rename', label: t('session.rename'), icon: h(IconEditOutlineRegular) })
    items.push({ id: 'copy', label: t('session.copyId') })
    items.push({ id: 'fork', label: t('session.fork') })
    items.push({
      id: 'archive',
      label: t('session.archive'),
      icon: h(IconArchiveOutlineRegular),
      danger: true
    })
    // DSH only archives, so deletion is the Host half moving the session into the trash.
    items.push({
      id: 'delete',
      label: t('session.delete'),
      icon: h(IconTrashOutlineRegular),
      danger: true
    })
  }
  // Move targets live in a submenu so the top-level menu stays short.
  const folders = foldersOf(scope.store, wsKey)
  const moveTargets = []
  if (folderId) {
    moveTargets.push({ id: 'mv:', label: t('session.moveRoot'), icon: h(IconFolderOpenRegular) })
  }
  for (const folder of folders) {
    moveTargets.push({
      id: 'mv:' + folder.id,
      label: folderPathLabel(folders, folder.id, t),
      icon: h(IconFolderOpenRegular)
    })
  }
  for (const other of scope.workspaces) {
    const otherKey = workspaceKey(other)
    if (otherKey === wsKey) continue
    moveTargets.push({
      id: 'mvws:' + otherKey,
      label: workspaceLabel(other),
      icon: h(IconProjectAddOutlineRegular)
    })
  }
  if (moveTargets.length > 0) {
    items.push({
      id: 'move',
      label: t('session.moveTo'),
      icon: h(IconFolderOpenRegular),
      submenu: moveTargets
    })
  }
  return items
}

// Folder actions, with a move submenu that excludes the folder's own subtree.
export function folderMenuItems(scope, wsKey, folder) {
  const t = scope.t
  const folders = foldersOf(scope.store, wsKey)
  const blocked = subtreeIds(folders, folder.id)
  const items = [
    { id: 'child', label: t('folder.addChild'), icon: h(IconPlusOutlineRegular) },
    { id: 'rename', label: t('folder.rename'), icon: h(IconEditOutlineRegular) },
    { id: 'delete', label: t('folder.delete'), icon: h(IconTrashOutlineRegular), danger: true }
  ]
  const moveTargets = [
    { id: 'mvws:' + wsKey, label: t('folder.moveRoot'), icon: h(IconFolderCloseRegular) }
  ]
  for (const target of folders) {
    if (blocked.has(target.id)) continue
    moveTargets.push({
      id: 'mvf:' + target.id,
      label: folderPathLabel(folders, target.id, t),
      icon: h(IconFolderOpenRegular)
    })
  }
  for (const other of scope.workspaces) {
    const otherKey = workspaceKey(other)
    if (otherKey === wsKey) continue
    moveTargets.push({
      id: 'mvws:' + otherKey,
      label: workspaceLabel(other),
      icon: h(IconProjectAddOutlineRegular)
    })
  }
  items.push({
    id: 'move',
    label: t('folder.moveTo'),
    icon: h(IconFolderOpenRegular),
    submenu: moveTargets
  })
  return items
}
