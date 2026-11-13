# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-13

### Added

- Activity icons on session rows: a blue spinner while the agent is working and a green check when a turn finished and its result has not been opened yet.
- `src/client/session-status.js` reads the per-session status map through the slot's `useSessionStatus` prop and falls back to the client session service snapshot; `src/client/components/session-state-icon.js` draws both states as text-free SVG so they inherit `currentColor` and work in both themes.

### Changed

- Workspace rows use the workspace-tree icon, a semibold label, and extra space between workspaces, so they are distinguishable from folder rows at a glance. The chevron keeps its place instead of swapping with the icon on hover, which also removes the layout shift.
- The disclosure chevron is 12px wide instead of sharing the 16px icon slot, and the workspace chevron is pulled 4px towards its icon, so the arrow no longer sits in its own column. The npm manifest carries a wider keyword set for discovery.

## [1.0.0] - 2026-11-09

First release published to npm as `@wxhccc/dsh-workspace-tree`. The 0.x versions below were local iterations that never left this machine, so the numbering starts at 1.0.0.

### Added

- Nested folders per workspace, with collapsible rows and inline renaming.
- Drag and drop for sessions and folders, including cross-workspace moves; a folder never accepts its own descendants.
- Session context menu with rename, copy session ID, fork, archive, delete and move targets.
- Keyboard support for rows: `Enter` and `Space` activate a row, `ArrowLeft` and `ArrowRight` collapse and expand folders, `F2` renames a session.
- Recoverable session deletion: the session directory is moved into `<DSH_HOME>/session-trash` instead of being erased.
- Plugin settings page with per-workspace opt-in, trash statistics and clearing, and title prefixes recorded before an uninstall.
- Model selection for newly created sessions, so a blank session can be used immediately.
- Client sources under `src/client`: locale dictionaries, styles, store, helpers, the row components, and a `Region` layer (`selectors`, `menus`, `views`) that keeps the component itself to state and handlers.
- `build.mjs`, an esbuild wrapper that bundles `src/client` into the committed `client.js`, because DSH's module loader cannot resolve relative client bundles.
- Host sources under `lib`: `http` and `paths` helpers plus `routes/sessions` and `routes/trash`; `index.js` is now only a composition root.
- `test/host.test.mjs`, six route-level regression tests that run against a temporary `DSH_HOME` with `node --test`.
- `test/client.test.mjs`, five bundle-level tests that render the region with stub platform modules and pin slot registration, locale keys, row visibility and menu targets.
- `scripts/audit-i18n.mjs` and the `build`, `test` and `audit:i18n` scripts; `npm run check` runs all of them, and `prepublishOnly` runs it before publishing.
- Documentation: `README.md`, `README.zh.md`, `docs/architecture.md`, `CHANGELOG.md`.

### Changed

- The package is scoped as `@wxhccc/dsh-workspace-tree` and published publicly (`publishConfig.access`). The client module id, the bundle patch name and the plugin page key all come from the package name: `build.mjs` reads it from `package.json` and replaces `__PACKAGE_NAME__` in the client sources.
- The plugin needs no build step at install time; `client.js` ships pre-built in the tarball and in the repository.

### Fixed

- Blank sessions displayed the untranslated key `session.new`; the string now exists in both locales.
- Sessions moved into another workspace's folder were still listed after archiving.
- A failed `selectModel` call was reported to the client as a success.
- A failed projection-cache cleanup was reported as a failed deletion even though the session directory had already moved.
- A missing `<DSH_HOME>/sessions` directory was reported as `scan-failed` instead of `not-found` when deleting a session.
- Trash listing and clearing disagreed about non-directory entries; both now operate on directories only.
- Symbolic links inside the trash were followed while measuring it.
- Session deletion now explains that a session must be closed first instead of showing a generic failure.
- `Session actions` was labelled `Move session`, and several strings were unused or missing.

## Earlier versions

These versions were local iterations of the same plugin before it became a published project.

| Version | Change |
|---|---|
| 0.5.2 | Select a model for a new session from the model catalog. |
| 0.5.1 | Create a session inside a folder from the folder row. |
| 0.5.0 | Prefix session titles before uninstalling and restore them on the next load. |
| 0.4.5 – 0.4.6 | Configuration block: workspace opt-in and trash clearing. |
| 0.4.4 | Session deletion into `session-trash`. |
| 0.4.3 | Move targets collected into a submenu. |
| 0.4.2 | Session rename, copy ID, fork, archive and relative time restored. |
| 0.4.1 | Workspace renaming; blank sessions hidden following the built-in rules. |
| 0.4.0 | Folder dragging and cross-workspace moves (store v2, `placements`). |
| 0.3.0 | Built-in visual language; actions collected into the `...` menu. |
| 0.1 – 0.2 | Replaced the standalone folder panel with the `sidebar.workspaces` slot. |
