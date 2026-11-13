/**
 * Session activity for the tree.
 *
 * The status of a session is a map from session id to
 * `{ running, completionUnread, pendingInteraction }`. The sidebar slot hands
 * it to its occupants as the standard `useSessionStatus` prop; the client
 * session service exposes the same snapshot object, which is used when the
 * prop is missing (for example in tests or in an older shell).
 *
 * The built-in browser reduces the map with `running ?? summary.running` and
 * `completionUnread === true`; the tree keeps those two rules so the icons
 * mean the same thing.
 */
import { React } from './platform.js'

const EMPTY = new Map()

/**
 * Select the whole snapshot; the status map is already the shape the tree needs.
 * @param {Map<string, object>} snapshot The status map published by the shell.
 * @returns {Map<string, object>} The same map, or an empty one.
 */
function selectAll(snapshot) {
  return snapshot || EMPTY
}

/**
 * Subscribe to the status map through the client session service.
 * @param {object} sessions The client session service, or anything else.
 * @returns {Map<string, object>} sessionId to `{ running, completionUnread }`.
 */
function useServiceStatuses(sessions) {
  const store = sessions && sessions.sessionStatus
  const [statuses, setStatuses] = React.useState(() => (store ? store.getSnapshot() || EMPTY : EMPTY))
  React.useEffect(() => {
    if (!store || typeof store.subscribe !== 'function') {
      setStatuses(EMPTY)
      return undefined
    }
    setStatuses(store.getSnapshot() || EMPTY)
    const unsubscribe = store.subscribe(() => setStatuses(store.getSnapshot() || EMPTY))
    return typeof unsubscribe === 'function' ? unsubscribe : undefined
  }, [store])
  return statuses || EMPTY
}

/**
 * Read the per-session status map.
 *
 * The slot prop wins because it is the documented contract; the service is the
 * fallback, and an absent status source degrades to an empty map, which leaves
 * every row without an icon instead of failing to render.
 * @param {object} props The slot props of the region.
 * @returns {Map<string, object>} sessionId to `{ running, completionUnread }`.
 */
export function useSessionStatuses(props) {
  const viaSlot = props && typeof props.useSessionStatus === 'function' ? props.useSessionStatus : null
  const viaService = useServiceStatuses(viaSlot ? null : props && props.sessions)
  const fromSlot = viaSlot ? viaSlot(selectAll) : null
  return fromSlot || viaService || EMPTY
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
