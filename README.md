# Workspace Tree

A DSH Web UI plugin that organizes sidebar sessions into nested, user-defined folders.

DSH ships a sidebar that lists every workspace together with its sessions. Workspace Tree replaces that browser with the same visual language — identical row height, indentation, hover colors and 16 px icon buttons — and adds a folder tree below each workspace: create folders and subfolders, drag sessions into them, move a folder to another workspace, and delete sessions into a recoverable trash.

[中文文档](./README.zh.md)

## Features

- **Nested folders per workspace.** Any depth, collapsible, with an inline rename field.
- **Drag and drop.** Sessions move into folders, onto another workspace, or back to a workspace root; folders can be re-parented, and a folder moved to another workspace carries its sessions with it. A folder never accepts its own descendants.
- **Session actions in place.** Rename by double-click or `F2`, copy session ID, fork, archive, delete, and move to a folder or workspace through a submenu.
- **Keyboard accessible rows.** Every row is focusable and responds to `Enter` / `Space`; folders also respond to `ArrowLeft` and `ArrowRight` to collapse and expand.
- **Recoverable deletion.** DSH has no delete API, so the host half moves the session directory into `<DSH_HOME>/session-trash` instead of erasing it.
- **Opt-in per workspace.** A workspace that is not enabled falls back to a flat, newest-first session list with no folders and no drag handles.
- **Plugin settings page.** Enable workspaces, inspect and clear the trash, and — before uninstalling — prefix session titles with the workspace name so the grouping is still readable afterwards.
- **Automatic restore.** Prefixes recorded on uninstall are stripped again the next time the plugin loads.

## Requirements

- DSH with the Web UI (`dsh.client.platform` is `web`).
- A sidebar that exposes the `sidebar.workspaces` slot, which the browser plugin of DSH provides.
- Node.js 22 or newer for development and syntax checks.

## Installation

### From GitHub

```sh
dsh plugin install github:wxhccche/dsh-workspace-tree
```

### From a local checkout

```sh
git clone git@github.com:wxhccche/dsh-workspace-tree.git
dsh plugin install /absolute/path/to/dsh-workspace-tree
```

The package name is `dsh-workspace-tree`, the same as the repository, so the client module id, the bundle patch and the plugin page key all resolve to one identifier. The plugin needs no build at install time: `client.js` is shipped pre-built.

### Reloading after a change

The client bundle is loaded when the profile starts. After editing `client.js`, remove and reinstall the bundle, then reload the page:

```text
plugin_manager remove_bundle  target: dsh-workspace-tree
plugin_manager install_bundle target: <absolute path to the plugin directory>
```

## Usage

### Workspace rows

The row shows the workspace name with a folder icon and a chevron. The `...` menu contains **Add folder** and **Rename workspace**; the `+` button at the end creates a session in that workspace.

### Folder rows

The `...` menu contains **Add subfolder**, **Rename**, **Delete** and **Move to**. Deleting a folder removes its whole subtree; sessions inside it return to the workspace root instead of disappearing. The `+` button creates a blank session directly inside the folder.

### Session rows

Click to open, double-click the title to rename, drag to regroup. The `...` menu contains **Rename**, **Copy session ID**, **Fork**, **Archive**, **Delete** and **Move to**. Blank sessions only expose the menu while they are the one currently open.

### Drag and drop

| Dragged | Dropped on | Result |
|---|---|---|
| Session | Folder row | Session joins that folder |
| Session | Workspace row or empty area | Session moves to that workspace root |
| Folder | Folder row | Folder becomes a subfolder of the target |
| Folder | Workspace row or empty area | Folder moves to that workspace root |

### Plugin settings page

Open **Settings → Plugins → Workspace Tree**. The page contains three blocks:

- **Workspaces using this plugin** — a checkbox per workspace. Unchecking one turns that workspace into a flat list.
- **Deleted sessions** — the number of sessions and the disk space held by `<DSH_HOME>/session-trash`, plus a button that empties it.
- **Session names before uninstalling** — adds a `[<workspace folder>] ` prefix to the title of every session in an enabled workspace, so the grouping stays readable after the plugin is removed.

## Configuration

The plugin has no `Config` schema; all state lives in the browser, next to the app's own UI state.

| `localStorage` key | Content |
|---|---|
| `dsh.workspace-tree.store.v2` | `{ v: 2, byWorkspace: { [wsKey]: { folders: [{ id, name, parentId }] } }, placements: { [sessionId]: { workspaceId, folderId } } }` |
| `dsh.workspace-tree.settings.v1` | `{ disabled: string[] }` — only workspaces that were unchecked |
| `dsh.workspace-tree.prefixed.v1` | `{ [sessionId]: "[folder] " }` — prefixes added before uninstall |
| `dsh.workspace-tree.folders.v1` | Legacy v1 layout, read once and migrated into `placements` |

`placements` carries both "inside a folder" and "moved to another workspace". A session's real workspace is still derived by DSH from its working directory; deleting the record returns the session to its own root.

## HTTP API

The host half (`index.js`) registers four exact routes on the DSH web server. All of them answer with JSON and require a `same-origin` request; requests marked `sec-fetch-site: cross-site` are rejected with `403 cross-site-request`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/workspace-tree/sessions/delete` | Moves a session directory into `<DSH_HOME>/session-trash/<id>-<timestamp>` and drops its projection cache. Returns `409 session-open` while the session is live. |
| `POST` | `/workspace-tree/sessions/model` | Selects a model for a new session, preferring `catalog.default` and otherwise the first available entry. |
| `GET` | `/workspace-tree/trash` | Returns `{ ok, count, bytes }` for the trash directory. |
| `POST` | `/workspace-tree/trash/clear` | Deletes every directory inside the trash. Returns `{ ok, removed }`. |

Request bodies are limited to 4 KiB and session identifiers must match `/^session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`.

Error responses carry a stable code: `method-not-allowed`, `bad-body`, `bad-session-id`, `missing-dsh-home`, `missing-session-controller`, `session-open`, `not-found`, `scan-failed`, `move-failed`, `catalog-failed`, `no-model`, `select-failed`, `clear-failed`, `cross-site-request`.

## How it works

Workspace Tree registers a replacement for the `sidebar.workspaces` slot. Single slots render the first occupant in ascending priority order, so the plugin registers with `priority: -1` and wins over the built-in browser at `0`. Rendering data comes from the slot's selector hooks, `props.useWorkspaces((state) => state)` and `props.useSessions((state) => state)`.

A configuration block is contributed through the keyed slot `plugins.bundle.config`, registered once under the package name and once under the patch id.

See [docs/architecture.md](./docs/architecture.md) for the full contract: which DSH services are used, how the session and projection-cache paths are derived, and how to verify a change.

## Limitations

- Replacing the built-in browser also removes its search box, archive view, pinning and the shipped nested workspace tree. The plugin provides the session list, grouping and the session actions listed above.
- Grouping and cross-workspace moves are rendering state in `localStorage`. They are not written back to session files, are not synchronised across browsers, and never change a session's working directory.
- Deleting a session hides it locally until the page is reloaded; the trash directory is never pruned automatically.
- A session is refused for deletion while it is open. Close it first and try again.
- The row does not reproduce the built-in status dot or hover card.

## Development

```sh
npm install      # installs esbuild, the only dev dependency
npm run build    # bundles src/client into client.js
npm run check    # syntax, Host regression tests and locale audit
npm test         # Host regression tests only
```

| Path | Purpose |
|---|---|
| `index.js` | Host entry point: route table, registration and `apply`. |
| `client.js` | Generated browser bundle. Committed, so installing needs no build step; never edit it by hand. |
| `src/client/` | Client sources: entry, locale dictionaries, styles, store, components, and the `Region` selectors. |
| `lib/` | Host helpers (`http`, `paths`) and the route handlers. |
| `build.mjs` | esbuild wrapper that wraps the bundle in a `window.__ModuleLoader__.load` factory. |
| `test/host.test.mjs` | Route-level tests that run against a temporary `DSH_HOME`. |
| `test/client.test.mjs` | Renders the built bundle outside DSH with stub platform modules and pins slot registration, locale keys and row visibility. |
| `scripts/audit-i18n.mjs` | Fails on unused or missing locale keys. |

The client bundle registers itself through `window.__ModuleLoader__.load({ id, factory(require) })` and builds its DOM with `React.createElement`. DSH's module loader only resolves whole bundles, so the sources are bundled with esbuild into a single file rather than split at runtime. The host half is a plain ESM module exporting `inject` and `apply`, which registers routes with `ctx.webServer.register(...)` inside `ctx.effect(...)` so they are disposed with the plugin.

Formatting follows the repository `.prettierrc`: no semicolons, single quotes, no trailing commas.

## License

[MIT](./LICENSE) © 2026 wxhccche
