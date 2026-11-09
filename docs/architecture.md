# Architecture

This document describes how Workspace Tree attaches to DSH, which private contracts it depends on, and how to verify a change. It is aimed at maintainers rather than users; see the [README](../README.md) for behaviour.

## Files

| File | Role |
|---|---|
| `client.js` | The whole user interface. Registers itself with `window.__ModuleLoader__.load({ id, factory(require) })`, builds the DOM with `React.createElement`, and loads `Menu`, the icons and `writeClipboard` from `@deepseek-ai/dsh-client-ui-primitives`. |
| `index.js` | Host half. A plain ESM module exporting `inject` and `apply`; registers four `webServer` routes. |
| `cordis.patch.yml` | Bundle patch: `- insert: - id: workspace-tree / name: '@local/workspace-tree'`. |
| `package.json` | `dsh.client.inject` lists the five client modules the bundle needs; `files` decides what is distributed. |
| `locale/{en,zh}.json` | Title and description shown in the plugin list. |
| `icon.svg` | Plugin icon. |
| `README.md`, `README.zh.md` | User documentation. |

## Slot takeover

```js
ctx.slots.inject('sidebar', () =>
  ctx.slots.register(
    {
      name: 'sidebar.workspaces',
      priority: -1,
      locale: NS,
      inject: () => ({
        uiWorkspace: ctx.uiWorkspace,
        workspaces: ctx.workspaces,
        sessions: ctx.sessions
      })
    },
    Region
  )
)
```

`sidebar.workspaces` is a single slot declared by `dsh-client-ui-sidebar` and rendered as `renderSlot('sidebar.workspaces', { wide, expandSidebar })`, so the component receives `wide` and `expandSidebar` in addition to the service props.

Three properties of the slot system matter here:

- **Priority is ascending.** A single slot renders the first occupant that has not abdicated, so the built-in browser at `priority: 0` is beaten by `-1`, not by a larger number.
- **Duplicate priorities throw.** A single slot has to be shadowed with a different priority.
- **A render error abdicates the entry.** When the component throws, the framework reports the error with `abdicate: true` and the sidebar silently falls back to the built-in browser. "The plugin stopped working" is therefore usually a rendering exception in the browser console, not a priority problem.

`ctx.slots.inject('sidebar', ...)` is kept as the dependency owner. Declaring the injection on `sidebar.workspaces` instead would make the registration depend on the slot it is registering into.

Data hooks are selector hooks and must be called with a selector: `props.useWorkspaces((state) => state)` returns `{ items }` with `workspaceId`, `title`, `path` and `sessionIds`; `props.useSessions((state) => state)` returns `{ byId }` of `SessionSummary`.

The configuration block is registered twice, under the package name and under the patch id, because the plugin page keys its slot entries by package name while the exact source is not part of the public contract:

```js
ctx.slots.inject('sidebar', () => {
  ctx.slots.register({ name: 'plugins.bundle.config', key: '@local/workspace-tree', ... }, ConfigPanel)
  ctx.slots.register({ name: 'plugins.bundle.config', key: 'workspace-tree', ... }, ConfigPanel)
})
```

`plugins.bundle.config` is a keyed, root-scoped slot, and `dsh-client-ui-plugin-manager` renders it with `view: 'page'`. There is no summary view, so the component does not branch on `view`.

## Host routes

`index.js` registers exact routes inside `ctx.effect(...)` so they are disposed with the plugin:

| Method | Path | Behaviour |
|---|---|---|
| `POST` | `/workspace-tree/sessions/delete` | Validates the session id, refuses live sessions with `409 session-open`, moves the session directory into `<DSH_HOME>/session-trash/<id>-<timestamp>`, then deletes the projection cache entry best-effort. |
| `POST` | `/workspace-tree/sessions/model` | Reads `sessionController.modelCatalog()`, prefers `catalog.default`, and calls `sessionController.selectModel({ sessionId, provider, model })`. |
| `GET` | `/workspace-tree/trash` | Recursively sums the directories in the trash. |
| `POST` | `/workspace-tree/trash/clear` | Removes every directory in the trash and reports how many were removed. |

Operational notes:

- Every handler first rejects requests whose `sec-fetch-site` header is `cross-site`, because the DSH web server applies no origin policy of its own and these routes modify files on disk.
- The session root is read from the persistence service when available (`ctx.get('sessionPersistence').root`) and otherwise falls back to `<DSH_HOME>/sessions`.
- The projection cache lives at `<DSH_HOME>/storages/session_projcache/sessions/<sessionId>.json`. Clearing it only removes disk state; the in-memory domain keeps its own copy, and a stale file is harmless. A failed cleanup therefore never fails a successful move.
- Session directories are looked up as `<root>/<projectKey>/<sessionId>`, where `projectKey` is the encoded working directory. Session ids contain only `[A-Za-z0-9._-]`, so the directory name equals the id.
- Request bodies are capped at 4 KiB and read with a size check before `JSON.parse`.

## Client state

| Key | Content |
|---|---|
| `dsh.workspace-tree.store.v2` | `{ v: 2, byWorkspace: { [wsKey]: { folders: [{ id, name, parentId }] } }, placements: { [sessionId]: { workspaceId, folderId } } }` |
| `dsh.workspace-tree.settings.v1` | `{ disabled: string[] }`, only workspaces that were unchecked |
| `dsh.workspace-tree.prefixed.v1` | `{ [sessionId]: '[folder] ' }`, written before an uninstall and replayed on the next load |
| `dsh.workspace-tree.folders.v1` | Legacy layout, migrated into `placements` on first load |

A placement record is dropped when it would be redundant, that is when the session sits at the root of its own workspace. `wsKey` is the workspace id.

`placements` serves two purposes: it records the folder a session was dragged into and it records a cross-workspace move. Neither affects DSH's own notion of ownership, which is derived from the session's working directory.

## Session visibility

The list follows the built-in rules:

- sessions with `origin === 'subagent'` are hidden;
- archived sessions are hidden;
- a blank session is shown only while it is the one currently open.

## DSH contracts in use

Client services:

- `uiWorkspace.openSession(sessionId)`, `connectWorkspace(workspaceId)`, `startSession(workspaceId)`, `forkSession(sessionId, onCreated, options)`, `archiveSession(sessionId, options)`, `pickDirectory()`
- `workspaces.create({ path })`, `workspaces.rename(workspaceId, title)`
- `sessions.using(sessionId, { source: 'workspaceOperation' }, (ref) => ref.binding.session.rename(title))`

Slot standard props: `useWorkspaces`, `useSessions`, `useSessionStatus`, plus `wide` and `expandSidebar`.

Primitives: `Menu` (items support one level of `submenu`), `writeClipboard`, `IconEllipsisOutlineRegular`, `IconFolderOpenRegular`, `IconFolderCloseRegular`, `IconTriangleRightFillRegular`, `IconNewChatOutlineRegular`, `IconPlusOutlineRegular`, `IconEditOutlineRegular`, `IconTrashOutlineRegular`, `IconArchiveOutlineRegular`, `IconProjectAddOutlineRegular`.

Host: `webServer.register({ kind: 'exact', path, handler })`, `sessions.get(id)` to detect live sessions, `sessionController.modelCatalog()` and `sessionController.selectModel()`.

Capabilities DSH does not expose, and which the plugin therefore works around:

- no delete API for sessions (hence the trash directory);
- no API to change a session's working directory or workspace;
- no client-side `sessions.list` or `sessions.create`;
- no `uiWorkspace.pinSession`; pinning lives in an internal controller only.

## Verifying a change

1. `npm run check` — `node --check` on both entry points; confirm the locale files still parse.
2. Reinstall the bundle: `plugin_manager remove_bundle` followed by `install_bundle` with the absolute directory. The result must report `application: "applied"` and `warnings: []`; installing again without removing first fails with `already-installed`.
3. Inspect the slot: `cordis_inspect_query` with platform `client`, provider `Slots`, method `listSubTree`, input `{ "root": "sidebar.workspaces" }`. The occupants should be `[{ priority: -1, active: true }, { priority: 0, active: false }]`.
4. Probe a route: `Invoke-WebRequest http://127.0.0.1:<port>/workspace-tree/trash`.
5. Ask the user to reload the page for interface behaviour. `active: true` only proves the entry did not abdicate; it does not prove the browser reloaded the new code.

## Known gaps

- The row does not reproduce the built-in status dot or hover card; that needs `useSessionStatus` together with the primitives hover card.
- Search, the archive view, pinning and the shipped nested workspace tree are gone with the replaced browser.
- Folders cannot be reordered among siblings, and workspaces cannot be removed from the sidebar.
- Styles are copied from the built-in `Rows` and `WorkspaceBrowser` CSS modules, with hash class names renamed to a `wsf-` prefix. Adjusting the look means copying from the CSS strings in `dsh-client-ui-workspace/lib/client.js`.
