/**
 * Session activity for the tree.
 *
 * The client session service publishes a per-session status map (`running`,
 * `completionUnread`, `pendingInteraction`); the built-in sidebar turns it into
 * state dots. The tree only needs two of those states, so this module keeps the
 * subscription and the reduction in one place.
 */
import { React } from './platform.js'

const EMPTY = new Map()

/**
 * Subscribe to the per-session status map.
 * @param {object} sessions The client session service, or anything else.
 * @returns {Map<string, object>} sessionId to `{ running, completionUnread }`.
 */
export function useSessionStatuses(sessions) {
  const store = sessions && sessions.sessionStatus
  const [statuses, setStatuses] = React.useState(() => (store ? store.getSnapshot() : EMPTY))
  React.useEffect(() => {
    if (!store || typeof store.subscribe !== 'function') {
      setStatuses(EMPTY)
      return undefined
    }
    setStatuses(store.getSnapshot() || EMPTY)
    return store.subscribe(() => setStatuses(store.getSnapshot() || EMPTY))
  }, [store])
  return statuses || EMPTY
}

/**
 * Reduce one session's status to the state the row shows.
 *
 * `running` wins over `done`, so a session that started again stops showing the
 * check. `done` stays until the finished run is opened, which is the same rule
 * the built-in session list follows.
 * @param {object} status The status entry, maybe undefined.
 * @param {object} summary The session summary, used when the map has no entry.
 * @returns {'running' | 'done' | 'idle'}
 */
export function sessionState(status, summary) {
  const running =
    status && typeof status.running === 'boolean'
      ? status.running
      : Boolean(summary && summary.running)
  if (running) return 'running'
  if (status && status.completionUnread === true) return 'done'
  return 'idle'
}
