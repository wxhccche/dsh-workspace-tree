import { handleDelete, handleModel } from './lib/routes/sessions.js'
import { handleTrashClear, handleTrashList } from './lib/routes/trash.js'

/**
 * Host half of the Workspace Tree plugin.
 *
 * DeepSeek Harness exposes no session deletion API: `sessionPersistence` is
 * append-only and `sessionController` only archives. A real delete therefore
 * has to touch the filesystem, so this half owns a small, exact-path HTTP
 * surface:
 *
 * - move the session directory into `<DSH_HOME>/session-trash`
 * - drop the session projection cache so the session does not reappear
 * - pick a model for a freshly created session
 * - report and empty the trash directory
 *
 * This file is the composition root: route paths and registration live here,
 * the handlers live under `lib/routes`, and their filesystem and HTTP helpers
 * under `lib`.
 */
const DELETE_ROUTE = '/workspace-tree/sessions/delete'
const MODEL_ROUTE = '/workspace-tree/sessions/model'
const TRASH_ROUTE = '/workspace-tree/trash'
const TRASH_CLEAR_ROUTE = '/workspace-tree/trash/clear'

export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: DELETE_ROUTE,
      handler: (req, res) => handleDelete(ctx, req, res),
    }),
  )
  // A blank session created from the sidebar has no model yet, and sending the
  // first prompt fails without one. The Host picks one from the account catalog.
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: MODEL_ROUTE,
      handler: (req, res) => handleModel(ctx, req, res),
    }),
  )
  // Both routes operate on the single trash directory owned by this plugin.
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: TRASH_ROUTE,
      handler: (req, res) => handleTrashList(req, res),
    }),
  )
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: TRASH_CLEAR_ROUTE,
      handler: (req, res) => handleTrashClear(req, res),
    }),
  )
}
