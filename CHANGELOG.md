# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-09

First public release.

### Added

- Nested folders per workspace, with collapsible rows and inline renaming.
- Drag and drop for sessions and folders, including cross-workspace moves; a folder never accepts its own descendants.
- Session context menu with rename, copy session ID, fork, archive, delete and move targets.
- Keyboard support for rows: `Enter` and `Space` activate a row, `ArrowLeft` and `ArrowRight` collapse and expand folders, `F2` renames a session.
- Recoverable session deletion: the session directory is moved into `<DSH_HOME>/session-trash` instead of being erased.
- Plugin settings page with per-workspace opt-in, trash statistics and clearing, and title prefixes recorded before an uninstall.
- Model selection for newly created sessions, so a blank session can be used immediately.
- Documentation: `README.md`, `README.zh.md`, `docs/architecture.md`, `CHANGELOG.md`.

### Fixed

- Blank sessions displayed the untranslated key `session.new`; the string now exists in both locales.
- Sessions moved into another workspace's folder were still listed after archiving.
- A failed `selectModel` call was reported to the client as a success.
- A failed projection-cache cleanup was reported as a failed deletion even though the session directory had already moved.
- Trash listing and clearing disagreed about non-directory entries; both now operate on directories only.
- Symbolic links inside the trash were followed while measuring it.
- Session deletion now explains that a session must be closed first instead of showing a generic failure.
- `Session actions` was labelled `Move session`, and several strings were unused or missing.

## Earlier versions

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
