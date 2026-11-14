/**
 * Filesystem layout of a DSH home: where sessions live, how a session is
 * moved into the trash, how the projection cache is dropped and how the trash is measured.
 */
import { cp, readdir, rename, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
/**
 * Sum the size of a directory tree without following symbolic links.
 *
 * @param root - absolute directory path.
 * @returns the total size in bytes; unreadable entries count as zero.
 */
export async function directorySize(root) {
  let total = 0
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return total
  }
  for (const entry of entries) {
    // A symlink can point outside the trash or back into the tree; skip it.
    if (entry.isSymbolicLink()) continue
    const path = join(root, entry.name)
    if (entry.isDirectory()) {
      total += await directorySize(path)
      continue
    }
    try {
      total += (await stat(path)).size
    } catch {
      // A file that vanished between readdir and stat contributes nothing.
    }
  }
  return total
}

/**
 * Resolve the directory that holds the per-project session directories.
 *
 * The JSONL backend keeps its root configurable; fall back to the documented
 * default when the service is absent.
 *
 * @param ctx - the plugin context.
 * @param home - the resolved `DSH_HOME`.
 * @returns the absolute sessions root.
 */
export function sessionsRoot(ctx, home) {
  const persistence = ctx.get('sessionPersistence')
  const root = persistence && typeof persistence.root === 'string' ? persistence.root : ''
  return root || join(home, 'sessions')
}

/**
 * Drop the projection cache entry that belongs to a removed session.
 *
 * @param home - the resolved `DSH_HOME`.
 * @param sessionId - the removed session id.
 * @returns whether the cache file was removed.
 */
export async function purgeProjectionCache(home, sessionId) {
  const path = join(home, 'storages', 'session_projcache', 'sessions', sessionId + '.json')
  try {
    await rm(path, { force: true })
    return true
  } catch {
    return false
  }
}

/**
 * Move a directory, falling back to copy and remove across volumes.
 *
 * @param source - absolute source directory.
 * @param target - absolute destination directory.
 */
export async function moveDirectory(source, target) {
  try {
    await rename(source, target)
  } catch (error) {
    // The trash may live on another volume, where rename fails with EXDEV.
    if (!error || error.code !== 'EXDEV') throw error
    await cp(source, target, { recursive: true })
    await rm(source, { recursive: true, force: true })
  }
}

/**
 * Find the on-disk directory of a session.
 *
 * Sessions live at `<root>/<project key>/<session id>`, so one readdir plus a
 * stat per project directory is enough.
 *
 * @param root - absolute sessions root.
 * @param sessionId - the session id to look for.
 * @returns the absolute session directory, or `null` when absent.
 */
export async function findSessionDir(root, sessionId) {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch (error) {
    // A missing sessions root means "no such session", not a failed scan.
    if (error && error.code === 'ENOENT') return null
    throw error
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const candidate = join(root, entry.name, sessionId)
    try {
      if ((await stat(candidate)).isDirectory()) return candidate
    } catch {
      // This project directory holds no such session.
    }
  }
  return null
}

