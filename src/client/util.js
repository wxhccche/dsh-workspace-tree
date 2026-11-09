/**
 * Small formatting and naming helpers shared by the components.
 */
import { h } from './platform.js'
import { workspaceLabel } from './store.js'
export function rootNameOf(workspace) {
  const path = workspace && workspace.path ? String(workspace.path) : ''
  const parts = path.split(/[\\/]/).filter(Boolean)
  if (parts.length) return parts[parts.length - 1]
  return workspaceLabel(workspace)
}

export function prefixOf(workspace) {
  return '[' + rootNameOf(workspace) + '] '
}


export function shortTimeText(updatedAt) {
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


export function clsx(parts) {
  return parts.filter(Boolean).join(' ')
}

// A folder row mirrors the built-in session row; its actions live in the overflow menu.

export function formatBytes(bytes) {
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
