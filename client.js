/* Generated from src/client by build.mjs — do not edit directly. */
window.__ModuleLoader__.load({
  id: "@wxhccc/dsh-workspace-tree",
  factory(require) {
      var __workspaceTree = (() => {
        var __create = Object.create;
        var __defProp = Object.defineProperty;
        var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
        var __getOwnPropNames = Object.getOwnPropertyNames;
        var __getProtoOf = Object.getPrototypeOf;
        var __hasOwnProp = Object.prototype.hasOwnProperty;
        var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
          get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
        }) : x)(function(x) {
          if (typeof require !== "undefined") return require.apply(this, arguments);
          throw Error('Dynamic require of "' + x + '" is not supported');
        });
        var __export = (target, all) => {
          for (var name in all)
            __defProp(target, name, { get: all[name], enumerable: true });
        };
        var __copyProps = (to, from, except, desc) => {
          if (from && typeof from === "object" || typeof from === "function") {
            for (let key of __getOwnPropNames(from))
              if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
          }
          return to;
        };
        var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
          // If the importer is in node compatibility mode or this is not an ESM
          // file that has been converted to a CommonJS file using a Babel-
          // compatible transform (i.e. "__esModule" has not been set), then set
          // "default" to the CommonJS "module.exports" for node compatibility.
          isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
          mod
        ));
        var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

        // src/client/index.js
        var index_exports = {};
        __export(index_exports, {
          apply: () => apply,
          inject: () => inject
        });

        // src/client/constants.js
        var NS = "local.workspaceTree";
        var STORE_KEY = "dsh.workspace-tree.store.v2";
        var LEGACY_KEY = "dsh.workspace-tree.folders.v1";
        var SETTINGS_KEY = "dsh.workspace-tree.settings.v1";
        var PREFIX_KEY = "dsh.workspace-tree.prefixed.v1";

        // src/client/i18n.js
        var en = {
          "section.title": "Workspaces",
          "section.addWorkspace": "Add workspace",
          "section.newSession": "New session",
          "section.addFolder": "Add folder",
          "section.workspaceActions": "Workspace actions",
          "workspace.rename": "Rename workspace",
          "folder.addChild": "Add subfolder",
          "folder.rename": "Rename",
          "folder.delete": "Delete",
          "folder.moveTo": "Move to",
          "folder.moveRoot": "Workspace root",
          "folder.untitled": "New folder",
          "folder.placeholder": "Folder name",
          "folder.actions": "Folder actions",
          "folder.deleteConfirm": "Delete this folder? Sessions inside move back to the workspace root.",
          "session.new": "New session",
          "session.untitled": "Untitled session",
          "session.rename": "Rename",
          "session.copyId": "Copy session ID",
          "session.fork": "Fork session",
          "session.archive": "Archive session",
          "session.archiveConfirm": "Archive this session?",
          "session.delete": "Delete session",
          "session.deleteConfirm": "Delete this session? Its log moves to the DSH session trash instead of being erased.",
          "session.deleteFailed": "Could not delete this session.",
          "session.deleteOpen": "This session is open. Close it before deleting it.",
          "session.moveTo": "Move to",
          "session.moveRoot": "Workspace root",
          "session.actions": "Session actions",
          "state.noWorkspace": "No workspace yet.",
          "state.dropHint": "Drag sessions or folders to group them.",
          "state.empty": "No sessions yet.",
          "config.workspaces": "Workspaces using this plugin",
          "config.workspacesHint": "Uncheck a workspace to show its sessions as a flat list, without folders or drag and drop.",
          "config.workspacesEmpty": "No workspaces yet.",
          "config.names": "Session titles before uninstalling",
          "config.namesHint": "Folder grouping lives in this plugin, so removing the plugin loses it. Put each workspace folder name in front of its session titles first; the plugin strips those prefixes again the next time it loads.",
          "config.namesButton": "Add workspace names to titles",
          "config.namesConfirm": "Rename sessions in every enabled workspace, adding the workspace folder name as a prefix?",
          "config.namesRunning": "Renaming {done}/{total}\u2026",
          "config.namesDone": "Renamed {n} sessions.",
          "config.namesFailed": "Some sessions could not be renamed.",
          "config.namesPending": "{n} prefixed sessions will be restored on load.",
          "config.trash": "Deleted sessions",
          "config.trashLoading": "Checking the trash\u2026",
          "config.trashFailed": "Could not read the trash.",
          "config.trashEmpty": "The trash is empty.",
          "config.trashCount": "{n} sessions in the trash ({size})",
          "config.trashClear": "Empty the trash",
          "config.trashClearing": "Emptying\u2026",
          "config.trashConfirm": "Delete every session in the trash permanently?"
        };
        var zh = {
          "section.title": "\u5DE5\u4F5C\u533A",
          "section.addWorkspace": "\u6DFB\u52A0\u5DE5\u4F5C\u533A",
          "section.newSession": "\u65B0\u5EFA\u4F1A\u8BDD",
          "section.addFolder": "\u6DFB\u52A0\u76EE\u5F55",
          "section.workspaceActions": "\u5DE5\u4F5C\u533A\u64CD\u4F5C",
          "workspace.rename": "\u91CD\u547D\u540D\u5DE5\u4F5C\u533A",
          "folder.addChild": "\u6DFB\u52A0\u5B50\u76EE\u5F55",
          "folder.rename": "\u91CD\u547D\u540D",
          "folder.delete": "\u5220\u9664",
          "folder.moveTo": "\u79FB\u52A8\u5230",
          "folder.moveRoot": "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55",
          "folder.untitled": "\u65B0\u76EE\u5F55",
          "folder.placeholder": "\u76EE\u5F55\u540D\u79F0",
          "folder.actions": "\u76EE\u5F55\u64CD\u4F5C",
          "folder.deleteConfirm": "\u5220\u9664\u8BE5\u76EE\u5F55\uFF1F\u5176\u4E2D\u7684\u4F1A\u8BDD\u4F1A\u79FB\u56DE\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55\u3002",
          "session.new": "\u65B0\u5EFA\u4F1A\u8BDD",
          "session.untitled": "\u672A\u547D\u540D\u4F1A\u8BDD",
          "session.rename": "\u91CD\u547D\u540D",
          "session.copyId": "\u590D\u5236\u4F1A\u8BDD ID",
          "session.fork": "Fork \u4F1A\u8BDD",
          "session.archive": "\u5F52\u6863\u4F1A\u8BDD",
          "session.archiveConfirm": "\u5F52\u6863\u8FD9\u4E2A\u4F1A\u8BDD\uFF1F",
          "session.delete": "\u5220\u9664\u4F1A\u8BDD",
          "session.deleteConfirm": "\u5220\u9664\u8FD9\u4E2A\u4F1A\u8BDD\uFF1F\u65E5\u5FD7\u4F1A\u79FB\u5230 DSH \u7684 session-trash\uFF0C\u4E0D\u4F1A\u5F7B\u5E95\u62B9\u6389\u3002",
          "session.deleteFailed": "\u65E0\u6CD5\u5220\u9664\u8BE5\u4F1A\u8BDD\u3002",
          "session.deleteOpen": "\u8BE5\u4F1A\u8BDD\u6B63\u5728\u4F7F\u7528\u4E2D\uFF0C\u8BF7\u5148\u5173\u95ED\u518D\u5220\u9664\u3002",
          "session.moveTo": "\u79FB\u52A8\u5230",
          "session.moveRoot": "\u5DE5\u4F5C\u533A\u6839\u76EE\u5F55",
          "session.actions": "\u4F1A\u8BDD\u64CD\u4F5C",
          "state.noWorkspace": "\u8FD8\u6CA1\u6709\u5DE5\u4F5C\u533A\u3002",
          "state.dropHint": "\u628A\u4F1A\u8BDD\u6216\u76EE\u5F55\u62D6\u5230\u76EE\u6807\u4F4D\u7F6E\u5373\u53EF\u5206\u7EC4\u3002",
          "state.empty": "\u8FD8\u6CA1\u6709\u4F1A\u8BDD\u3002",
          "config.workspaces": "\u5E94\u7528\u63D2\u4EF6\u7684\u5DE5\u4F5C\u533A",
          "config.workspacesHint": "\u53D6\u6D88\u52FE\u9009\u540E\uFF0C\u8BE5\u5DE5\u4F5C\u533A\u9000\u5316\u4E3A\u5E73\u94FA\u4F1A\u8BDD\u5217\u8868\uFF1A\u4E0D\u5206\u76EE\u5F55\uFF0C\u4E5F\u4E0D\u80FD\u62D6\u62FD\u3002",
          "config.workspacesEmpty": "\u8FD8\u6CA1\u6709\u5DE5\u4F5C\u533A\u3002",
          "config.names": "\u5378\u8F7D\u524D\u7684\u4F1A\u8BDD\u540D",
          "config.namesHint": "\u76EE\u5F55\u5206\u7EC4\u5B58\u5728\u63D2\u4EF6\u81EA\u5DF1\u8FD9\u91CC\uFF0C\u79FB\u9664\u63D2\u4EF6\u540E\u5206\u7EC4\u5C31\u6CA1\u4E86\u3002\u5148\u628A\u5DE5\u4F5C\u533A\u76EE\u5F55\u540D\u52A0\u5230\u4F1A\u8BDD\u6807\u9898\u524D\u9762\uFF1B\u4E0B\u6B21\u52A0\u8F7D\u63D2\u4EF6\u65F6\u4F1A\u81EA\u52A8\u53BB\u6389\u8FD9\u4E9B\u524D\u7F00\u3002",
          "config.namesButton": "\u7ED9\u542F\u7528\u5DE5\u4F5C\u533A\u7684\u4F1A\u8BDD\u52A0\u524D\u7F00",
          "config.namesConfirm": "\u7ED9\u6240\u6709\u542F\u7528\u5DE5\u4F5C\u533A\u7684\u4F1A\u8BDD\u6807\u9898\u52A0\u4E0A\u5DE5\u4F5C\u533A\u76EE\u5F55\u540D\u524D\u7F00\uFF1F",
          "config.namesRunning": "\u6B63\u5728\u91CD\u547D\u540D {done}/{total}\u2026",
          "config.namesDone": "\u5DF2\u91CD\u547D\u540D {n} \u4E2A\u4F1A\u8BDD\u3002",
          "config.namesFailed": "\u90E8\u5206\u4F1A\u8BDD\u91CD\u547D\u540D\u5931\u8D25\u3002",
          "config.namesPending": "{n} \u4E2A\u5E26\u524D\u7F00\u7684\u4F1A\u8BDD\u4F1A\u5728\u52A0\u8F7D\u65F6\u8FD8\u539F\u3002",
          "config.trash": "\u5DF2\u5220\u9664\u4F1A\u8BDD",
          "config.trashLoading": "\u6B63\u5728\u68C0\u67E5\u56DE\u6536\u76EE\u5F55\u2026",
          "config.trashFailed": "\u8BFB\u53D6\u56DE\u6536\u76EE\u5F55\u5931\u8D25\u3002",
          "config.trashEmpty": "\u56DE\u6536\u76EE\u5F55\u662F\u7A7A\u7684\u3002",
          "config.trashCount": "\u56DE\u6536\u76EE\u5F55\u91CC\u6709 {n} \u4E2A\u4F1A\u8BDD\uFF08{size}\uFF09",
          "config.trashClear": "\u6E05\u7A7A\u56DE\u6536\u76EE\u5F55",
          "config.trashClearing": "\u6B63\u5728\u6E05\u7A7A\u2026",
          "config.trashConfirm": "\u5F7B\u5E95\u5220\u9664\u56DE\u6536\u76EE\u5F55\u91CC\u7684\u6240\u6709\u4F1A\u8BDD\uFF1F"
        };

        // src/client/styles.js
        var css = `
      .wsf-root {
        --dsh-session-list-edge-inset: var(--dsh-sidebar-inline-padding, 8px);
        --dsh-session-list-scrollbar-width: 5px;
        --dsh-session-list-scrollbar-offset: 2px;
        box-sizing: border-box;
        min-height: 0;
        padding-right: var(--dsh-session-list-edge-inset);
        flex-direction: column;
        flex: 1;
        display: flex;
        color: var(--dsw-alias-label-primary);
      }
      .wsf-root--rail { padding-right: 0; }
      .wsf-header {
        box-sizing: border-box;
        border-radius: var(--dsw-radius-md);
        height: 36px;
        color: var(--dsw-alias-label-tertiary);
        flex: none;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
        margin-right: -4px;
        margin-bottom: 4px;
        padding-left: 4px;
        display: flex;
        overflow: hidden;
      }
      .wsf-header-label {
        white-space: nowrap;
        min-width: 0;
        max-width: 45%;
        flex: none;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wsf-header-actions {
        flex: none;
        align-items: center;
        gap: 4px;
        display: flex;
        overflow: hidden;
        margin-left: auto;
      }
      .wsf-icon-button {
        border-radius: var(--dsw-radius-sm);
        cursor: pointer;
        width: 28px;
        height: 28px;
        color: var(--dsw-alias-label-secondary);
        background: 0 0;
        border: none;
        flex: none;
        justify-content: center;
        align-items: center;
        padding: 0;
        display: inline-flex;
      }
      .wsf-icon-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .wsf-icon-button:focus-visible {
        outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary);
        outline-offset: -2px;
      }
      .wsf-list {
        min-height: 0;
        margin-left: -4px;
        margin-right: var(--dsh-session-list-scrollbar-offset);
        padding-left: 4px;
        padding-right: calc(var(--dsh-session-list-edge-inset) - var(--dsh-session-list-scrollbar-width) - var(--dsh-session-list-scrollbar-offset));
        scrollbar-gutter: stable;
        flex: 1;
        padding-bottom: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .wsf-list--drop { background: var(--dsw-alias-interactive-bg-hover); border-radius: var(--dsw-radius-md); }
      .wsf-row {
        box-sizing: border-box;
        border-radius: var(--dsw-radius-md);
        padding: 0 8px;
        padding-inline-start: calc(8px + var(--wsf-indent, 0px) + var(--dsh-workspace-indent, 0px));
        cursor: pointer;
        user-select: none;
        color: var(--dsw-alias-label-primary);
        align-items: center;
        gap: 6px;
        display: flex;
      }
      .wsf-row:hover,
      .wsf-row--menu { background: var(--dsw-alias-interactive-bg-hover); }
      .wsf-row:focus-visible {
        outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary);
        outline-offset: -2px;
      }
      .wsf-row--project { height: 34px; }
      .wsf-row--session { gap: 0; height: 32px; }
      .wsf-row--drop {
        background: var(--dsw-alias-interactive-bg-hover);
        outline: 1px dashed var(--dsw-alias-state-business-primary);
        outline-offset: -1px;
      }
      .wsf-row--dragging { opacity: 0.45; }
      .wsf-slot {
        width: 16px;
        height: 20px;
        color: var(--dsw-alias-label-tertiary);
        flex: none;
        justify-content: center;
        align-items: center;
        display: inline-flex;
      }
      .wsf-row--project .wsf-chevron { display: none; color: var(--dsw-alias-label-caption); }
      .wsf-row--project:hover .wsf-chevron { display: inline-flex; }
      .wsf-row--project:hover .wsf-folder { display: none; }
      .wsf-arrow { transition: transform 0.15s var(--ds-ease-in-out); }
      .wsf-arrow--open { transform: rotate(90deg); }
      .wsf-text { flex-direction: column; flex: 1; gap: 2px; min-width: 0; display: flex; }
      .wsf-row--session .wsf-text { flex-direction: row; flex: 1; align-items: center; }
      .wsf-title {
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
        font-size: 14px;
        line-height: 20px;
        overflow: hidden;
      }
      .wsf-row--session .wsf-title { margin: 0 6px 0 4px; flex: 1; }
      .wsf-time {
        flex: none;
        margin-right: 6px;
        color: var(--dsw-alias-label-tertiary);
        font-size: 12px;
        line-height: 20px;
        white-space: nowrap;
      }
      .wsf-row--session:hover .wsf-time { display: none; }
      .wsf-row--selected { background: var(--dsw-alias-interactive-bg-hover); }
      .wsf-actions { flex: none; align-items: center; gap: 15px; display: none; }
      .wsf-row:hover .wsf-actions,
      .wsf-row--menu .wsf-actions { display: inline-flex; }
      .wsf-action {
        border-radius: var(--dsw-radius-xs);
        cursor: pointer;
        width: 16px;
        height: 16px;
        color: var(--dsw-alias-label-tertiary);
        background: 0 0;
        border: none;
        flex: none;
        justify-content: center;
        align-items: center;
        padding: 0;
        display: inline-flex;
      }
      .wsf-action:hover { color: var(--dsw-alias-label-primary); }
      .wsf-input {
        box-sizing: border-box;
        border: 0.5px solid var(--dsw-alias-border-l4);
        border-radius: var(--dsw-radius-sm);
        background: var(--dsw-alias-button-elevated-fill);
        min-width: 0;
        width: 100%;
        color: inherit;
        outline: none;
        padding: 0 2px;
        font-size: 14px;
        line-height: 20px;
      }
      .wsf-empty { color: var(--dsw-alias-label-tertiary); padding: 16px 12px; font-size: 13px; }
      .wsf-config { display: flex; flex-direction: column; gap: 16px; }
      .wsf-config-section { display: flex; flex-direction: column; gap: 8px; }
      .wsf-config-title { font-size: 14px; line-height: 20px; color: var(--dsw-alias-label-primary); }
      .wsf-config-hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
      .wsf-config-list { display: flex; flex-direction: column; gap: 2px; }
      .wsf-config-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: var(--dsw-radius-sm);
        cursor: pointer;
      }
      .wsf-config-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .wsf-config-name { font-size: 13px; line-height: 18px; color: var(--dsw-alias-label-primary); }
      .wsf-config-path {
        font-size: 12px;
        line-height: 18px;
        color: var(--dsw-alias-label-tertiary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      .wsf-config-actions { display: flex; gap: 8px; }
      .wsf-button {
        padding: 4px 12px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: var(--dsw-radius-sm);
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        line-height: 20px;
        cursor: pointer;
      }
      .wsf-button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
      .wsf-button:disabled { color: var(--dsw-alias-label-tertiary); cursor: default; }
      @media (prefers-reduced-motion: reduce) { .wsf-arrow { transition: none; } }
      `;

        // src/client/platform.js
        var import_react = __toESM(__require("react"), 1);
        var import_dsh_client_ui_primitives = __require("@deepseek-ai/dsh-client-ui-primitives");
        var h = import_react.default.createElement;

        // src/client/store.js
        function uid() {
          return "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        }
        function normalizeStore(parsed) {
          const empty = { v: 2, byWorkspace: {}, placements: {} };
          if (!parsed || typeof parsed !== "object") return empty;
          const byWorkspace = {};
          const raw = parsed.byWorkspace;
          if (raw && typeof raw === "object") {
            for (const key of Object.keys(raw)) {
              const entry = raw[key];
              if (!entry || !Array.isArray(entry.folders)) continue;
              byWorkspace[key] = {
                folders: entry.folders.filter((folder) => folder && folder.id).map((folder) => ({
                  id: String(folder.id),
                  name: typeof folder.name === "string" ? folder.name : "",
                  parentId: folder.parentId ? String(folder.parentId) : null
                }))
              };
            }
          }
          const placements = {};
          for (const key of Object.keys(byWorkspace)) {
            const legacyAssigned = raw[key] && raw[key].assigned;
            if (!legacyAssigned || typeof legacyAssigned !== "object") continue;
            for (const sessionId of Object.keys(legacyAssigned)) {
              const folderId = legacyAssigned[sessionId];
              if (folderId) placements[sessionId] = { workspaceId: key, folderId: String(folderId) };
            }
          }
          if (parsed.placements && typeof parsed.placements === "object") {
            for (const sessionId of Object.keys(parsed.placements)) {
              const placement = parsed.placements[sessionId];
              if (!placement || !placement.workspaceId) continue;
              placements[sessionId] = {
                workspaceId: String(placement.workspaceId),
                folderId: placement.folderId ? String(placement.folderId) : null
              };
            }
          }
          return { v: 2, byWorkspace, placements };
        }
        function loadStore() {
          try {
            const raw = window.localStorage.getItem(STORE_KEY);
            if (raw) return normalizeStore(JSON.parse(raw));
            const legacy = window.localStorage.getItem(LEGACY_KEY);
            if (legacy) return normalizeStore(JSON.parse(legacy));
          } catch (error) {
            return { v: 2, byWorkspace: {}, placements: {} };
          }
          return { v: 2, byWorkspace: {}, placements: {} };
        }
        function saveStore(store) {
          try {
            window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
          } catch (error) {
          }
        }
        var settingsListeners = /* @__PURE__ */ new Set();
        function loadSettings() {
          try {
            const raw = window.localStorage.getItem(SETTINGS_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              const disabled = Array.isArray(parsed && parsed.disabled) ? parsed.disabled.filter((id) => typeof id === "string") : [];
              return { disabled };
            }
          } catch (error) {
            return { disabled: [] };
          }
          return { disabled: [] };
        }
        var settingsState = loadSettings();
        function saveSettings(next) {
          settingsState = next;
          try {
            window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
          } catch (error) {
          }
          for (const listener of settingsListeners) listener(next);
        }
        function useSettings() {
          const [value, setValue] = import_react.default.useState(settingsState);
          import_react.default.useEffect(() => {
            settingsListeners.add(setValue);
            setValue(settingsState);
            return () => settingsListeners.delete(setValue);
          }, []);
          return value;
        }
        function loadPrefixed() {
          try {
            const raw = window.localStorage.getItem(PREFIX_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            const result = {};
            if (parsed && typeof parsed === "object") {
              for (const sessionId of Object.keys(parsed)) {
                if (typeof parsed[sessionId] === "string") result[sessionId] = parsed[sessionId];
              }
            }
            return result;
          } catch (error) {
            return {};
          }
        }
        function savePrefixed(map) {
          try {
            window.localStorage.setItem(PREFIX_KEY, JSON.stringify(map));
          } catch (error) {
          }
        }
        function workspaceKey(workspace) {
          return workspace.workspaceId || workspace.id || workspace.path || "";
        }
        function workspaceLabel2(workspace) {
          if (workspace.title) return workspace.title;
          if (workspace.path) {
            const parts = String(workspace.path).split(/[\\/]/).filter(Boolean);
            return parts.length ? parts[parts.length - 1] : workspace.path;
          }
          return workspaceKey(workspace);
        }
        function sessionIdsOf(workspace) {
          return workspace && Array.isArray(workspace.sessionIds) ? workspace.sessionIds : [];
        }
        function foldersOf(store, wsKey) {
          const entry = store.byWorkspace[wsKey];
          return entry && Array.isArray(entry.folders) ? entry.folders : [];
        }

        // src/client/session-service.js
        async function renameSession(service, sessionId, title) {
          const result = await service.using(
            sessionId,
            { source: "workspaceOperation" },
            (reference) => reference.binding.session.rename(title)
          );
          if (result && result.ok === false) throw new Error("rename failed: " + sessionId);
          return true;
        }

        // src/client/components/region/selectors.js
        function sessionVisible(sessionId, summary, currentMainId) {
          if (!summary || summary.origin === "subagent") return false;
          if (summary.blank && sessionId !== currentMainId) return false;
          return true;
        }
        function visibleSessions(scope, workspace) {
          return sessionIdsOf(workspace).filter(
            (sessionId) => !scope.archivedIds.has(sessionId) && !scope.deletedIds.has(sessionId) && sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId)
          );
        }
        function folderPathLabel(folders, folderId, t) {
          const names = [];
          let cursor = folders.find((folder) => folder.id === folderId);
          let guard = 0;
          while (cursor && guard < 20) {
            names.unshift(cursor.name || t("folder.untitled"));
            cursor = cursor.parentId ? folders.find((folder) => folder.id === cursor.parentId) : null;
            guard += 1;
          }
          return names.join(" / ");
        }
        function folderOfSession(scope, sessionId, wsKey) {
          const placement = scope.placements[sessionId];
          if (!placement || placement.workspaceId !== wsKey || !placement.folderId) return null;
          return foldersOf(scope.store, wsKey).some((folder) => folder.id === placement.folderId) ? placement.folderId : null;
        }
        function sessionsFor(scope, wsKey, workspace) {
          const result = [];
          const seen = /* @__PURE__ */ new Set();
          for (const sessionId of visibleSessions(scope, workspace)) {
            const placement = scope.placements[sessionId];
            if (placement && placement.workspaceId && placement.workspaceId !== wsKey) continue;
            result.push(sessionId);
            seen.add(sessionId);
          }
          for (const sessionId of Object.keys(scope.placements)) {
            const placement = scope.placements[sessionId];
            if (!placement || placement.workspaceId !== wsKey || seen.has(sessionId)) continue;
            if (scope.deletedIds.has(sessionId) || scope.archivedIds.has(sessionId)) continue;
            if (!sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId)) continue;
            result.push(sessionId);
            seen.add(sessionId);
          }
          const rank = (sessionId) => scope.sessionsById[sessionId] && scope.sessionsById[sessionId].blank ? 0 : 1;
          return result.sort((a, b) => rank(a) - rank(b));
        }
        function timeOf(sessionsById, sessionId) {
          const summary = sessionsById[sessionId];
          if (!summary || !summary.updatedAt) return 0;
          const value = typeof summary.updatedAt === "number" ? summary.updatedAt : Date.parse(summary.updatedAt);
          return Number.isFinite(value) ? value : 0;
        }
        function flatSessions(scope, workspace) {
          return sessionIdsOf(workspace).filter(
            (sessionId) => !scope.archivedIds.has(sessionId) && !scope.deletedIds.has(sessionId) && sessionVisible(sessionId, scope.sessionsById[sessionId], scope.currentMainId)
          ).sort((a, b) => timeOf(scope.sessionsById, b) - timeOf(scope.sessionsById, a));
        }
        function subtreeIds(folders, folderId) {
          const remove = /* @__PURE__ */ new Set([folderId]);
          let grew = true;
          while (grew) {
            grew = false;
            for (const folder of folders) {
              if (!remove.has(folder.id) && folder.parentId && remove.has(folder.parentId)) {
                remove.add(folder.id);
                grew = true;
              }
            }
          }
          return remove;
        }

        // src/client/util.js
        function rootNameOf(workspace) {
          const path = workspace && workspace.path ? String(workspace.path) : "";
          const parts = path.split(/[\\/]/).filter(Boolean);
          if (parts.length) return parts[parts.length - 1];
          return workspaceLabel2(workspace);
        }
        function prefixOf(workspace) {
          return "[" + rootNameOf(workspace) + "] ";
        }
        function shortTimeText(updatedAt) {
          if (!updatedAt) return "";
          const value = typeof updatedAt === "number" ? updatedAt : Date.parse(updatedAt);
          if (!Number.isFinite(value)) return "";
          const minutes = Math.max(0, Math.floor((Date.now() - value) / 6e4));
          if (minutes < 1) return "now";
          if (minutes < 60) return minutes + "m";
          const hours = Math.floor(minutes / 60);
          if (hours < 24) return hours + "h";
          return Math.floor(hours / 24) + "d";
        }
        function clsx(parts) {
          return parts.filter(Boolean).join(" ");
        }
        function formatBytes(bytes) {
          if (!bytes) return "0 B";
          const units = ["B", "KB", "MB", "GB"];
          let value = bytes;
          let index = 0;
          while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index += 1;
          }
          return (index === 0 ? String(value) : value.toFixed(1)) + " " + units[index];
        }

        // src/client/components/folder-row.js
        function FolderRow(props) {
          const { t, folder, depth, collapsed, editing, dropActive, dragging, menuItems } = props;
          const [menuOpen, setMenuOpen] = import_react.default.useState(false);
          const name = folder.name || t("folder.untitled");
          return h(
            "div",
            {
              className: clsx([
                "wsf-row",
                "wsf-row--project",
                menuOpen && "wsf-row--menu",
                dropActive && "wsf-row--drop",
                dragging && "wsf-row--dragging"
              ]),
              style: { "--wsf-indent": 8 + depth * 14 + "px" },
              role: "treeitem",
              tabIndex: 0,
              "aria-expanded": !collapsed,
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  props.onToggle();
                } else if (event.key === "ArrowRight" && collapsed) {
                  event.preventDefault();
                  props.onToggle();
                } else if (event.key === "ArrowLeft" && !collapsed) {
                  event.preventDefault();
                  props.onToggle();
                }
              },
              draggable: !editing,
              onClick: () => {
                if (!editing) props.onToggle();
              },
              onDragStart: props.onDragStart,
              onDragEnd: props.onDragEnd,
              onDragOver: (event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onDragOver(event);
              },
              onDragLeave: props.onDragLeave,
              onDrop: props.onDrop
            },
            h(
              "span",
              { className: "wsf-slot wsf-folder" },
              h(collapsed ? import_dsh_client_ui_primitives.IconFolderCloseRegular : import_dsh_client_ui_primitives.IconFolderOpenRegular)
            ),
            h(
              "span",
              { className: "wsf-slot wsf-chevron" },
              h(import_dsh_client_ui_primitives.IconTriangleRightFillRegular, {
                className: clsx(["wsf-arrow", !collapsed && "wsf-arrow--open"])
              })
            ),
            h(
              "span",
              { className: "wsf-text" },
              editing ? h("input", {
                className: "wsf-input",
                autoFocus: true,
                value: editing.value,
                placeholder: t("folder.placeholder"),
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    props.onEditCommit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    props.onEditCancel();
                  }
                }
              }) : h("span", { className: "wsf-title", title: name }, name)
            ),
            h(
              "span",
              { className: "wsf-actions" },
              h(import_dsh_client_ui_primitives.Menu, {
                open: menuOpen,
                onClose: () => setMenuOpen(false),
                items: menuItems,
                onSelect: (id) => {
                  setMenuOpen(false);
                  props.onMenuSelect(id);
                },
                portal: true,
                closeOnPointerLeave: true,
                anchor: h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-action",
                    "aria-label": t("folder.actions"),
                    title: t("folder.actions"),
                    onClick: (event) => {
                      event.stopPropagation();
                      setMenuOpen((open) => !open);
                    }
                  },
                  h(import_dsh_client_ui_primitives.IconEllipsisOutlineRegular)
                )
              }),
              props.onNewSession ? h(
                "button",
                {
                  type: "button",
                  className: "wsf-action",
                  "aria-label": t("section.newSession"),
                  title: t("section.newSession"),
                  style: { width: 20, height: 20 },
                  onClick: (event) => {
                    event.stopPropagation();
                    props.onNewSession();
                  }
                },
                h(import_dsh_client_ui_primitives.IconNewChatOutlineRegular)
              ) : null
            )
          );
        }

        // src/client/components/session-row.js
        function SessionRow(props) {
          const { t, title, depth, dropActive, dragging, menuItems, editing, selected, time } = props;
          const [menuOpen, setMenuOpen] = import_react.default.useState(false);
          return h(
            "div",
            {
              className: clsx([
                "wsf-row",
                "wsf-row--session",
                menuOpen && "wsf-row--menu",
                dropActive && "wsf-row--drop",
                dragging && "wsf-row--dragging",
                selected && "wsf-row--selected"
              ]),
              style: { "--wsf-indent": 8 + depth * 14 + "px" },
              role: "treeitem",
              tabIndex: 0,
              "aria-selected": Boolean(selected),
              title: props.path || title,
              draggable: props.movable !== false && !editing,
              onClick: props.onOpen,
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  props.onOpen();
                } else if (event.key === "F2") {
                  event.preventDefault();
                  props.onRename();
                }
              },
              onDragStart: props.onDragStart,
              onDragEnd: props.onDragEnd
            },
            h(
              "span",
              { className: "wsf-text" },
              editing ? h("input", {
                className: "wsf-input",
                autoFocus: true,
                value: editing.value,
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    props.onEditCommit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    props.onEditCancel();
                  }
                }
              }) : h(
                "span",
                {
                  className: "wsf-title",
                  onDoubleClick: (event) => {
                    event.stopPropagation();
                    props.onRename();
                  }
                },
                title
              )
            ),
            time ? h("span", { className: "wsf-time" }, time) : null,
            h(
              "span",
              { className: "wsf-actions" },
              h(import_dsh_client_ui_primitives.Menu, {
                open: menuOpen,
                onClose: () => setMenuOpen(false),
                items: menuItems,
                onSelect: (id) => {
                  setMenuOpen(false);
                  props.onMenuSelect(id);
                },
                portal: true,
                closeOnPointerLeave: true,
                anchor: h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-action",
                    "aria-label": t("session.actions"),
                    title: t("session.actions"),
                    onClick: (event) => {
                      event.stopPropagation();
                      setMenuOpen((open) => !open);
                    }
                  },
                  h(import_dsh_client_ui_primitives.IconEllipsisOutlineRegular)
                )
              })
            )
          );
        }

        // src/client/components/workspace-row.js
        function WorkspaceRow(props) {
          const { t, label, collapsed, dropActive, editing } = props;
          const [menuOpen, setMenuOpen] = import_react.default.useState(false);
          const items = [
            { id: "rename", label: t("workspace.rename"), icon: h(import_dsh_client_ui_primitives.IconEditOutlineRegular) }
          ];
          if (props.onAddFolder) {
            items.push({ id: "folder", label: t("section.addFolder"), icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular) });
          }
          return h(
            "div",
            {
              className: clsx([
                "wsf-row",
                "wsf-row--project",
                menuOpen && "wsf-row--menu",
                dropActive && "wsf-row--drop"
              ]),
              role: "treeitem",
              "aria-expanded": !collapsed,
              "aria-level": 1,
              title: props.path,
              onClick: () => {
                if (!editing) props.onToggle();
              },
              onDragOver: (event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onDragOver();
              },
              onDragLeave: props.onDragLeave,
              onDrop: props.onDrop
            },
            h(
              "span",
              { className: "wsf-slot wsf-folder" },
              h(collapsed ? import_dsh_client_ui_primitives.IconFolderCloseRegular : import_dsh_client_ui_primitives.IconFolderOpenRegular)
            ),
            h(
              "span",
              { className: "wsf-slot wsf-chevron" },
              h(import_dsh_client_ui_primitives.IconTriangleRightFillRegular, {
                className: clsx(["wsf-arrow", !collapsed && "wsf-arrow--open"])
              })
            ),
            h(
              "span",
              { className: "wsf-text" },
              editing ? h("input", {
                className: "wsf-input",
                autoFocus: true,
                value: editing.value,
                onClick: (event) => event.stopPropagation(),
                onChange: (event) => props.onEditChange(event.target.value),
                onBlur: props.onEditCommit,
                onKeyDown: (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    props.onEditCommit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    props.onEditCancel();
                  }
                }
              }) : h("span", { className: "wsf-title" }, label)
            ),
            h(
              "span",
              { className: "wsf-actions" },
              h(import_dsh_client_ui_primitives.Menu, {
                open: menuOpen,
                onClose: () => setMenuOpen(false),
                items,
                onSelect: (id) => {
                  setMenuOpen(false);
                  if (id === "rename") props.onRename();
                  else if (id === "folder") props.onAddFolder();
                },
                portal: true,
                closeOnPointerLeave: true,
                anchor: h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-action",
                    "aria-label": t("section.workspaceActions"),
                    title: t("section.workspaceActions"),
                    onClick: (event) => {
                      event.stopPropagation();
                      setMenuOpen((open) => !open);
                    }
                  },
                  h(import_dsh_client_ui_primitives.IconEllipsisOutlineRegular)
                )
              }),
              h(
                "button",
                {
                  type: "button",
                  className: "wsf-action",
                  "aria-label": t("section.newSession"),
                  title: t("section.newSession"),
                  style: { width: 20, height: 20 },
                  onClick: (event) => {
                    event.stopPropagation();
                    props.onNewSession();
                  }
                },
                h(import_dsh_client_ui_primitives.IconNewChatOutlineRegular)
              )
            )
          );
        }

        // src/client/components/region/menus.js
        function sessionMenuItems(scope, wsKey, folderId, summary) {
          const t = scope.t;
          const items = [];
          if (!summary.blank) {
            items.push({ id: "rename", label: t("session.rename"), icon: h(import_dsh_client_ui_primitives.IconEditOutlineRegular) });
            items.push({ id: "copy", label: t("session.copyId") });
            items.push({ id: "fork", label: t("session.fork") });
            items.push({
              id: "archive",
              label: t("session.archive"),
              icon: h(import_dsh_client_ui_primitives.IconArchiveOutlineRegular),
              danger: true
            });
            items.push({
              id: "delete",
              label: t("session.delete"),
              icon: h(import_dsh_client_ui_primitives.IconTrashOutlineRegular),
              danger: true
            });
          }
          const folders = foldersOf(scope.store, wsKey);
          const moveTargets = [];
          if (folderId) {
            moveTargets.push({ id: "mv:", label: t("session.moveRoot"), icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular) });
          }
          for (const folder of folders) {
            moveTargets.push({
              id: "mv:" + folder.id,
              label: folderPathLabel(folders, folder.id, t),
              icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular)
            });
          }
          for (const other of scope.workspaces) {
            const otherKey = workspaceKey(other);
            if (otherKey === wsKey) continue;
            moveTargets.push({
              id: "mvws:" + otherKey,
              label: workspaceLabel2(other),
              icon: h(import_dsh_client_ui_primitives.IconProjectAddOutlineRegular)
            });
          }
          if (moveTargets.length > 0) {
            items.push({
              id: "move",
              label: t("session.moveTo"),
              icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular),
              submenu: moveTargets
            });
          }
          return items;
        }
        function folderMenuItems(scope, wsKey, folder) {
          const t = scope.t;
          const folders = foldersOf(scope.store, wsKey);
          const blocked = subtreeIds(folders, folder.id);
          const items = [
            { id: "child", label: t("folder.addChild"), icon: h(import_dsh_client_ui_primitives.IconPlusOutlineRegular) },
            { id: "rename", label: t("folder.rename"), icon: h(import_dsh_client_ui_primitives.IconEditOutlineRegular) },
            { id: "delete", label: t("folder.delete"), icon: h(import_dsh_client_ui_primitives.IconTrashOutlineRegular), danger: true }
          ];
          const moveTargets = [
            { id: "mvws:" + wsKey, label: t("folder.moveRoot"), icon: h(import_dsh_client_ui_primitives.IconFolderCloseRegular) }
          ];
          for (const target of folders) {
            if (blocked.has(target.id)) continue;
            moveTargets.push({
              id: "mvf:" + target.id,
              label: folderPathLabel(folders, target.id, t),
              icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular)
            });
          }
          for (const other of scope.workspaces) {
            const otherKey = workspaceKey(other);
            if (otherKey === wsKey) continue;
            moveTargets.push({
              id: "mvws:" + otherKey,
              label: workspaceLabel2(other),
              icon: h(import_dsh_client_ui_primitives.IconProjectAddOutlineRegular)
            });
          }
          items.push({
            id: "move",
            label: t("folder.moveTo"),
            icon: h(import_dsh_client_ui_primitives.IconFolderOpenRegular),
            submenu: moveTargets
          });
          return items;
        }

        // src/client/components/region/views.js
        function renderSessionRow(scope, wsKey, sessionId, depth, folderId, options) {
          const t = scope.t;
          const actions = scope.actions;
          const movable = !options || options.movable !== false;
          const summary = scope.sessionsById[sessionId] || {};
          const title = summary.blank ? t("session.new") : summary.title || t("session.untitled");
          return h(SessionRow, {
            key: "session:" + sessionId,
            t,
            title,
            path: summary.cwd || sessionId,
            depth,
            selected: scope.currentMainId === sessionId,
            time: summary.blank ? "" : shortTimeText(summary.updatedAt),
            menuItems: sessionMenuItems(scope, wsKey, folderId, summary),
            editing: scope.editing && scope.editing.target === "session" && scope.editing.sessionId === sessionId ? scope.editing : null,
            dragging: Boolean(
              scope.drag && scope.drag.kind === "session" && scope.drag.sessionId === sessionId
            ),
            onRename: () => actions.beginSessionEditing(sessionId, summary),
            onEditChange: (value) => {
              const current = scope.editingRef.current;
              if (current) actions.beginEditing(Object.assign({}, current, { value }));
            },
            onEditCommit: actions.commitEditing,
            onEditCancel: actions.cancelEditing,
            onMenuSelect: (id) => {
              if (id === "rename") actions.beginSessionEditing(sessionId, summary);
              else if (id === "copy") actions.copySessionId(sessionId);
              else if (id === "fork") actions.forkSession(sessionId);
              else if (id === "archive") actions.archiveSession(sessionId);
              else if (id === "delete") actions.deleteSession(sessionId);
              else if (id === "mv:") actions.setPlacement(sessionId, wsKey, null);
              else if (id.indexOf("mvws:") === 0) {
                actions.setPlacement(sessionId, id.slice("mvws:".length), null);
              } else if (id.indexOf("mv:") === 0) {
                actions.setPlacement(sessionId, wsKey, id.slice("mv:".length));
              }
            },
            onOpen: () => actions.openSession(sessionId),
            movable,
            onDragStart: movable ? actions.beginDrag({ kind: "session", sessionId, wsKey }) : void 0,
            onDragEnd: actions.endDrag
          });
        }
        function renderFolder(scope, wsKey, folder, depth, sessions) {
          const t = scope.t;
          const actions = scope.actions;
          const folders = foldersOf(scope.store, wsKey);
          const children = folders.filter((item) => item.parentId === folder.id);
          const members = sessions.filter((sessionId) => folderOfSession(scope, sessionId, wsKey) === folder.id);
          const row = h(FolderRow, {
            key: "folder:" + folder.id,
            t,
            folder,
            depth,
            collapsed: Boolean(scope.collapsed[folder.id]),
            editing: scope.editing && scope.editing.folderId === folder.id ? scope.editing : null,
            dropActive: scope.dropTarget === folder.id,
            dragging: Boolean(
              scope.drag && scope.drag.kind === "folder" && scope.drag.folderId === folder.id
            ),
            menuItems: folderMenuItems(scope, wsKey, folder),
            onNewSession: () => actions.startSessionInFolder(wsKey, folder.id),
            onToggle: () => actions.toggleFolder(folder.id),
            onDragStart: actions.beginDrag({ kind: "folder", folderId: folder.id, wsKey }),
            onDragEnd: actions.endDrag,
            onDragOver: () => actions.setDropTarget(folder.id),
            onDragLeave: () => actions.setDropTarget((prev) => prev === folder.id ? null : prev),
            onDrop: actions.dropOn(wsKey, folder.id),
            onEditChange: (value) => actions.beginEditing({ wsKey, folderId: folder.id, value }),
            onEditCommit: actions.commitEditing,
            onEditCancel: actions.cancelEditing,
            onMenuSelect: (id) => {
              if (id === "child") actions.addFolder(wsKey, folder.id);
              else if (id === "rename") {
                actions.beginEditing({ wsKey, folderId: folder.id, value: folder.name || "" });
              } else if (id === "delete") actions.deleteFolder(wsKey, folder.id);
              else if (id.indexOf("mvf:") === 0) {
                actions.moveFolder(folder.id, wsKey, wsKey, id.slice("mvf:".length));
              } else if (id.indexOf("mvws:") === 0) {
                actions.moveFolder(folder.id, wsKey, id.slice("mvws:".length), null);
              }
            }
          });
          if (scope.collapsed[folder.id]) return [row];
          return [
            row,
            ...children.flatMap((child) => renderFolder(scope, wsKey, child, depth + 1, sessions)),
            ...members.map((sessionId) => renderSessionRow(scope, wsKey, sessionId, depth + 1, folder.id))
          ];
        }
        function renderWorkspace(scope, workspace) {
          const t = scope.t;
          const actions = scope.actions;
          const wsKey = workspaceKey(workspace);
          const enabled = !scope.disabledWorkspaces.has(wsKey);
          const state = enabled ? foldersOf(scope.store, wsKey) : [];
          const known = new Set(state.map((folder) => folder.id));
          const sessions = enabled ? sessionsFor(scope, wsKey, workspace) : [];
          const flat = enabled ? [] : flatSessions(scope, workspace);
          const rootSessions = enabled ? sessions.filter((sessionId) => {
            const folderId = folderOfSession(scope, sessionId, wsKey);
            return !folderId || !known.has(folderId);
          }) : [];
          const rootFolders = state.filter((folder) => !folder.parentId || !known.has(folder.parentId));
          const isDropRoot = scope.dropTarget === "root:" + wsKey;
          const collapsed = Boolean(scope.collapsed["ws:" + wsKey]);
          return h(
            "div",
            { key: "workspace:" + wsKey },
            h(WorkspaceRow, {
              t,
              label: workspaceLabel2(workspace),
              path: workspace.path || wsKey,
              collapsed,
              editing: scope.editing && scope.editing.target === "workspace" && scope.editing.workspaceId === wsKey ? scope.editing : null,
              dropActive: enabled && isDropRoot,
              onToggle: () => actions.toggleWorkspace(wsKey),
              onNewSession: () => actions.startSession(wsKey),
              onAddFolder: enabled ? () => actions.addFolder(wsKey, null) : null,
              onRename: () => actions.beginWorkspaceEditing(workspace),
              onEditChange: (value) => {
                const current = scope.editingRef.current;
                if (current) actions.beginEditing(Object.assign({}, current, { value }));
              },
              onEditCommit: actions.commitEditing,
              onEditCancel: actions.cancelEditing,
              onDragOver: enabled ? () => actions.setDropTarget("root:" + wsKey) : () => void 0,
              onDragLeave: enabled ? () => actions.setDropTarget((prev) => prev === "root:" + wsKey ? null : prev) : () => void 0,
              onDrop: enabled ? actions.dropOn(wsKey, null) : () => void 0
            }),
            collapsed ? null : enabled ? h(
              "div",
              {
                className: "wsf-list" + (isDropRoot ? " wsf-list--drop" : ""),
                style: { flex: "none", overflow: "visible", paddingBottom: 0 },
                role: "group",
                onDragOver: (event) => {
                  event.preventDefault();
                  actions.setDropTarget("root:" + wsKey);
                },
                onDrop: actions.dropOn(wsKey, null)
              },
              rootFolders.flatMap((folder) => renderFolder(scope, wsKey, folder, 0, sessions)),
              rootSessions.map((sessionId) => renderSessionRow(scope, wsKey, sessionId, 0, null)),
              !state.length && !sessions.length ? h("div", { className: "wsf-empty" }, t("state.dropHint")) : null
            ) : h(
              "div",
              {
                className: "wsf-list",
                style: { flex: "none", overflow: "visible", paddingBottom: 0 },
                role: "group"
              },
              flat.map(
                (sessionId) => renderSessionRow(scope, wsKey, sessionId, 0, null, { movable: false })
              ),
              flat.length ? null : h("div", { className: "wsf-empty" }, t("state.empty"))
            )
          );
        }
        function renderRegion(scope) {
          const t = scope.t;
          const rail = scope.rail;
          return h(
            "div",
            {
              className: "wsf-root" + (rail ? " wsf-root--rail" : ""),
              "data-workspace-tree": ""
            },
            h(
              "div",
              { className: "wsf-header" },
              rail ? null : h("span", { className: "wsf-header-label" }, t("section.title")),
              h(
                "div",
                { className: "wsf-header-actions" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-icon-button",
                    "aria-label": t("section.addWorkspace"),
                    title: t("section.addWorkspace"),
                    onClick: scope.actions.addWorkspace
                  },
                  h(import_dsh_client_ui_primitives.IconProjectAddOutlineRegular, { size: rail ? 18 : 16 })
                )
              )
            ),
            h(
              "div",
              { className: "wsf-list", role: "tree" },
              scope.workspaces.length ? scope.workspaces.map((workspace) => renderWorkspace(scope, workspace)) : h("div", { className: "wsf-empty" }, t("state.noWorkspace"))
            )
          );
        }

        // src/client/components/region.js
        function Region(props) {
          const t = typeof props.t === "function" ? props.t : (key) => key;
          const wsState = props.useWorkspaces((state) => state);
          const sessState = props.useSessions((state) => state);
          const settings = useSettings();
          const disabledWorkspaces = import_react.default.useMemo(() => {
            const list = Array.isArray(settings && settings.disabled) ? settings.disabled : [];
            return new Set(list);
          }, [settings]);
          const workspaces = import_react.default.useMemo(() => {
            const items = wsState && Array.isArray(wsState.items) ? wsState.items : [];
            return items.filter((item) => item && workspaceKey(item));
          }, [wsState]);
          const sessionsById = sessState && sessState.byId || {};
          const archivedIds = import_react.default.useMemo(() => {
            const raw = wsState && wsState.archivedSessionIds || [];
            return new Set(Array.isArray(raw) ? raw : []);
          }, [wsState]);
          const currentMainId = import_react.default.useMemo(() => {
            for (const id of Object.keys(sessionsById)) {
              const summary = sessionsById[id];
              if (summary && summary.retainedBy && (summary.retainedBy.mainView || 0) > 0) return id;
            }
            return null;
          }, [sessionsById]);
          const ownerOfSession = import_react.default.useMemo(() => {
            const owner = {};
            for (const workspace of workspaces) {
              for (const sessionId of sessionIdsOf(workspace)) owner[sessionId] = workspaceKey(workspace);
            }
            return owner;
          }, [workspaces]);
          const [store, setStore] = import_react.default.useState(loadStore);
          const [collapsed, setCollapsed] = import_react.default.useState({});
          const [editing, setEditing] = import_react.default.useState(null);
          const editingRef = import_react.default.useRef(null);
          const [drag, setDrag] = import_react.default.useState(null);
          const [dropTarget, setDropTarget] = import_react.default.useState(null);
          const [deletedIds, setDeletedIds] = import_react.default.useState(() => /* @__PURE__ */ new Set());
          import_react.default.useEffect(() => {
            saveStore(store);
          }, [store]);
          const strippedRef = import_react.default.useRef(false);
          import_react.default.useEffect(() => {
            if (strippedRef.current) return;
            const service = props.sessions;
            if (!service || typeof service.using !== "function") return;
            const map = loadPrefixed();
            const entries = Object.keys(map);
            if (!entries.length) return;
            strippedRef.current = true;
            let failed = 0;
            (async () => {
              for (const sessionId of entries) {
                const prefix = map[sessionId];
                const summary = sessionsById[sessionId];
                if (!summary || typeof summary.title !== "string" || !summary.title.startsWith(prefix)) {
                  delete map[sessionId];
                  continue;
                }
                const next = summary.title.slice(prefix.length).trim();
                if (!next) continue;
                try {
                  await renameSession(service, sessionId, next);
                  delete map[sessionId];
                } catch (error) {
                  failed += 1;
                  console.warn("[workspace-tree] restore session title failed", sessionId, error);
                }
              }
              savePrefixed(map);
              if (failed) strippedRef.current = false;
            })();
          }, [sessionsById, props.sessions]);
          const placements = store.placements || {};
          const writeStore = (next) => {
            setStore((prev) => Object.assign({}, prev, next(prev)));
          };
          const addFolder = (wsKey, parentId) => {
            const id = uid();
            writeStore((prev) => {
              const byWorkspace = Object.assign({}, prev.byWorkspace);
              byWorkspace[wsKey] = {
                folders: foldersOf(prev, wsKey).concat({ id, name: "", parentId: parentId || null })
              };
              return { byWorkspace };
            });
            setCollapsed((prev) => Object.assign({}, prev, { [id]: false }));
            beginEditing({ wsKey, folderId: id, value: "" });
          };
          const beginEditing = (next) => {
            editingRef.current = next;
            setEditing(next);
          };
          const beginWorkspaceEditing = (workspace) => {
            const title = workspaceLabel(workspace);
            beginEditing({
              target: "workspace",
              workspaceId: workspaceKey(workspace),
              title,
              value: title
            });
          };
          const beginSessionEditing = (sessionId, summary) => {
            const title = summary.blank ? "" : summary.title || "";
            beginEditing({ target: "session", sessionId, title, value: title });
          };
          const commitEditing = () => {
            const current = editingRef.current;
            if (!current) return;
            editingRef.current = null;
            setEditing(null);
            const name = current.value.trim();
            if (current.target === "session") {
              const service = props.sessions;
              if (!name || name === current.title) return;
              if (!service || typeof service.using !== "function") return;
              Promise.resolve(
                service.using(
                  current.sessionId,
                  { source: "workspaceOperation" },
                  (reference) => reference.binding.session.rename(name)
                )
              ).then((result) => {
                if (result && result.ok === false) {
                  console.warn("[workspace-tree] rename session failed", result.error);
                }
              }).catch((error) => {
                console.warn("[workspace-tree] rename session failed", error);
              });
              return;
            }
            if (current.target === "workspace") {
              const controller = props.workspaces;
              if (!name || name === current.title) return;
              if (!controller || typeof controller.rename !== "function") return;
              Promise.resolve(controller.rename(current.workspaceId, name)).catch((error) => {
                console.error("[workspace-tree] rename workspace failed", error);
              });
              return;
            }
            writeStore((prev) => {
              const byWorkspace = Object.assign({}, prev.byWorkspace);
              const folders = foldersOf(prev, current.wsKey);
              byWorkspace[current.wsKey] = {
                folders: name ? folders.map(
                  (folder) => folder.id === current.folderId ? Object.assign({}, folder, { name }) : folder
                ) : folders.filter((folder) => folder.id !== current.folderId)
              };
              return { byWorkspace };
            });
          };
          const cancelEditing = () => {
            const current = editingRef.current;
            if (!current) return;
            editingRef.current = null;
            setEditing(null);
            if (current.target === "workspace" || current.target === "session") return;
            writeStore((prev) => {
              const byWorkspace = Object.assign({}, prev.byWorkspace);
              const folders = foldersOf(prev, current.wsKey);
              byWorkspace[current.wsKey] = {
                folders: folders.filter((folder) => folder.id !== current.folderId || folder.name)
              };
              return { byWorkspace };
            });
          };
          const deleteFolder = (wsKey, folderId) => {
            if (typeof window.confirm === "function" && !window.confirm(t("folder.deleteConfirm"))) {
              return;
            }
            writeStore((prev) => {
              const folders = foldersOf(prev, wsKey);
              const remove = subtreeIds(folders, folderId);
              const byWorkspace = Object.assign({}, prev.byWorkspace);
              byWorkspace[wsKey] = {
                folders: folders.filter((folder) => !remove.has(folder.id))
              };
              const nextPlacements = Object.assign({}, prev.placements);
              for (const sessionId of Object.keys(nextPlacements)) {
                const placement = nextPlacements[sessionId];
                if (!placement || !remove.has(placement.folderId)) continue;
                if (placement.workspaceId === ownerOfSession[sessionId]) delete nextPlacements[sessionId];
                else nextPlacements[sessionId] = { workspaceId: placement.workspaceId, folderId: null };
              }
              return { byWorkspace, placements: nextPlacements };
            });
          };
          const setPlacement = (sessionId, wsKey, folderId) => {
            writeStore((prev) => {
              const folders = foldersOf(prev, wsKey);
              const known = folderId && folders.some((folder) => folder.id === folderId);
              const nextPlacements = Object.assign({}, prev.placements);
              if (ownerOfSession[sessionId] === wsKey && !known) {
                delete nextPlacements[sessionId];
              } else {
                nextPlacements[sessionId] = { workspaceId: wsKey, folderId: known ? folderId : null };
              }
              return { placements: nextPlacements };
            });
          };
          const moveFolder = (folderId, fromWsKey, toWsKey, parentId) => {
            writeStore((prev) => {
              const fromFolders = foldersOf(prev, fromWsKey);
              if (!fromFolders.some((folder) => folder.id === folderId)) return {};
              const remove = subtreeIds(fromFolders, folderId);
              if (parentId && remove.has(parentId)) return {};
              const moved = fromFolders.filter((folder) => remove.has(folder.id));
              const byWorkspace = Object.assign({}, prev.byWorkspace);
              const remaining = fromFolders.filter((folder) => !remove.has(folder.id));
              byWorkspace[fromWsKey] = { folders: remaining };
              const targetFolders = fromWsKey === toWsKey ? remaining.slice() : foldersOf(prev, toWsKey).slice();
              if (parentId && !targetFolders.some((folder) => folder.id === parentId)) return {};
              byWorkspace[toWsKey] = {
                folders: targetFolders.concat(
                  moved.map(
                    (folder) => folder.id === folderId ? Object.assign({}, folder, { parentId: parentId || null }) : folder
                  )
                )
              };
              const nextPlacements = Object.assign({}, prev.placements);
              for (const sessionId of Object.keys(nextPlacements)) {
                const placement = nextPlacements[sessionId];
                if (placement && remove.has(placement.folderId)) {
                  nextPlacements[sessionId] = Object.assign({}, placement, { workspaceId: toWsKey });
                }
              }
              return { byWorkspace, placements: nextPlacements };
            });
          };
          const toggleFolder = (folderId) => {
            setCollapsed((prev) => Object.assign({}, prev, { [folderId]: !prev[folderId] }));
          };
          const readDragged = (event) => {
            if (drag) return drag;
            try {
              const raw = event.dataTransfer.getData("text/plain");
              if (!raw) return null;
              const parsed = JSON.parse(raw);
              if (parsed && (parsed.sessionId || parsed.folderId)) return parsed;
            } catch (error) {
              return null;
            }
            return null;
          };
          const dropOn = (wsKey, folderId) => (event) => {
            event.preventDefault();
            event.stopPropagation();
            const dragged = readDragged(event);
            if (dragged) {
              if (dragged.kind === "folder" && dragged.folderId) {
                moveFolder(dragged.folderId, dragged.wsKey, wsKey, folderId);
              } else if (dragged.sessionId) {
                setPlacement(dragged.sessionId, wsKey, folderId);
              }
            }
            setDrag(null);
            setDropTarget(null);
          };
          const beginDrag = (payload) => (event) => {
            try {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", JSON.stringify(payload));
            } catch (error) {
            }
            setDrag(payload);
          };
          const endDrag = () => {
            setDrag(null);
            setDropTarget(null);
          };
          const openSession = (sessionId) => {
            if (props.uiWorkspace && typeof props.uiWorkspace.openSession === "function") {
              props.uiWorkspace.openSession(sessionId);
            }
            if (props.wide === false && typeof props.expandSidebar === "function") {
              props.expandSidebar();
            }
          };
          const startSession = (wsKey) => {
            const ui = props.uiWorkspace;
            if (!ui) return;
            if (typeof ui.connectWorkspace === "function") {
              Promise.resolve(ui.connectWorkspace(wsKey)).then((sessionId) => {
                if (!sessionId) return;
                openSession(sessionId);
                ensureSessionModel(sessionId);
              }).catch(() => {
              });
              return;
            }
            if (typeof ui.startSession === "function") {
              ui.startSession(wsKey);
            }
          };
          const ensureSessionModel = (sessionId) => {
            const call = () => fetch("/workspace-tree/sessions/model", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ sessionId })
            }).then((response) => response.ok).catch(() => false);
            call().then((ok) => {
              if (ok) return;
              window.setTimeout(call, 800);
            });
          };
          const startSessionInFolder = (wsKey, folderId) => {
            const ui = props.uiWorkspace;
            if (!ui) return;
            if (typeof ui.connectWorkspace !== "function") {
              startSession(wsKey);
              return;
            }
            Promise.resolve(ui.connectWorkspace(wsKey)).then((sessionId) => {
              if (!sessionId) return;
              setPlacement(sessionId, wsKey, folderId);
              openSession(sessionId);
              ensureSessionModel(sessionId);
            }).catch(() => {
            });
          };
          const addWorkspace = () => {
            const ui = props.uiWorkspace;
            const controller = props.workspaces;
            if (!ui || !controller) return;
            Promise.resolve(ui.pickDirectory()).then((path) => path ? controller.create({ path }) : null).catch(() => {
            });
          };
          const copySessionId = (sessionId) => {
            const write = typeof import_dsh_client_ui_primitives.writeClipboard === "function" ? () => (0, import_dsh_client_ui_primitives.writeClipboard)(sessionId) : () => navigator.clipboard.writeText(sessionId);
            Promise.resolve(write()).catch((error) => {
              console.warn("[workspace-tree] copy session id failed", error);
            });
          };
          const archiveSession = (sessionId) => {
            const service = props.uiWorkspace;
            if (!service || typeof service.archiveSession !== "function") return;
            if (typeof window.confirm === "function" && !window.confirm(t("session.archiveConfirm"))) {
              return;
            }
            Promise.resolve(service.archiveSession(sessionId, { stopActivity: true })).catch((error) => {
              console.warn("[workspace-tree] archive session failed", error);
            });
          };
          const deleteSession = (sessionId) => {
            if (typeof window.confirm === "function" && !window.confirm(t("session.deleteConfirm"))) {
              return;
            }
            Promise.resolve(
              fetch("/workspace-tree/sessions/delete", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ sessionId })
              }).then((response) => response.json().then((payload) => ({ response, payload }))).then(({ response, payload }) => {
                if (!response.ok || !payload || payload.ok !== true) {
                  const code = payload && payload.error || "delete-failed";
                  const error = new Error(code);
                  error.code = code;
                  throw error;
                }
              })
            ).then(() => {
              setDeletedIds((prev) => {
                const next = new Set(prev);
                next.add(sessionId);
                return next;
              });
              writeStore((prev) => {
                if (!prev.placements || !prev.placements[sessionId]) return {};
                const placementsNext = Object.assign({}, prev.placements);
                delete placementsNext[sessionId];
                return { placements: placementsNext };
              });
            }).catch((error) => {
              console.warn("[workspace-tree] delete session failed", error);
              if (typeof window.alert !== "function") return;
              const key = error && error.code === "session-open" ? "session.deleteOpen" : "session.deleteFailed";
              window.alert(t(key));
            });
          };
          const forkSession = (sessionId) => {
            const service = props.uiWorkspace;
            if (!service || typeof service.forkSession !== "function") return;
            Promise.resolve(service.forkSession(sessionId, void 0, { allowMigration: false })).catch(
              (error) => {
                console.warn("[workspace-tree] fork session failed", error);
              }
            );
          };
          const scope = {
            t,
            store,
            workspaces,
            sessionsById,
            currentMainId,
            archivedIds,
            deletedIds,
            placements,
            collapsed,
            editing,
            drag,
            dropTarget,
            editingRef,
            disabledWorkspaces,
            rail: props.wide === false,
            actions: {
              addFolder,
              addWorkspace,
              archiveSession,
              beginDrag,
              beginEditing,
              beginSessionEditing,
              beginWorkspaceEditing,
              cancelEditing,
              commitEditing,
              copySessionId,
              deleteFolder,
              deleteSession,
              dropOn,
              endDrag,
              forkSession,
              moveFolder,
              openSession,
              setDropTarget,
              setPlacement,
              startSession,
              startSessionInFolder,
              toggleFolder,
              toggleWorkspace: (wsKey) => setCollapsed(
                (prev) => Object.assign({}, prev, { ["ws:" + wsKey]: !prev["ws:" + wsKey] })
              )
            }
          };
          return renderRegion(scope);
        }

        // src/client/components/config-panel.js
        function ConfigPanel(props) {
          const t = typeof props.t === "function" ? props.t : (key) => key;
          const wsState = props.useWorkspaces((state) => state);
          const settings = useSettings();
          const workspaces = import_react.default.useMemo(() => {
            const items = wsState && Array.isArray(wsState.items) ? wsState.items : [];
            return items.filter((item) => item && workspaceKey(item));
          }, [wsState]);
          const disabled = Array.isArray(settings && settings.disabled) ? settings.disabled : [];
          const [trash, setTrash] = import_react.default.useState({ state: "loading", count: 0, bytes: 0 });
          const [clearing, setClearing] = import_react.default.useState(false);
          const sessState = props.useSessions((state) => state);
          const sessionsById = sessState && sessState.byId || {};
          const [naming, setNaming] = import_react.default.useState({ state: "idle", done: 0, total: 0 });
          const [pending, setPending] = import_react.default.useState(() => Object.keys(loadPrefixed()).length);
          const loadTrash = import_react.default.useCallback(() => {
            setTrash({ state: "loading", count: 0, bytes: 0 });
            fetch("/workspace-tree/trash").then((response) => response.json()).then((data) => {
              if (!data || data.ok === false) throw new Error(data && data.error || "trash-failed");
              setTrash({ state: "ready", count: data.count || 0, bytes: data.bytes || 0 });
            }).catch((error) => {
              console.warn("[workspace-tree] load trash failed", error);
              setTrash({ state: "error", count: 0, bytes: 0 });
            });
          }, []);
          import_react.default.useEffect(() => {
            loadTrash();
          }, [loadTrash]);
          const toggleWorkspace = (wsKey, checked) => {
            const next = disabled.filter((id) => id !== wsKey);
            if (!checked) next.push(wsKey);
            saveSettings({ disabled: next });
          };
          const prefixAll = () => {
            const service = props.sessions;
            if (!service || typeof service.using !== "function") return;
            if (!window.confirm(t("config.namesConfirm"))) return;
            const targets = [];
            for (const workspace of workspaces) {
              if (disabled.includes(workspaceKey(workspace))) continue;
              const prefix = prefixOf(workspace);
              for (const sessionId of sessionIdsOf(workspace)) {
                const summary = sessionsById[sessionId];
                if (!summary || summary.blank || !summary.title) continue;
                if (summary.origin === "subagent") continue;
                if (summary.title.startsWith(prefix)) continue;
                targets.push({ sessionId, prefix, title: prefix + summary.title });
              }
            }
            if (!targets.length) {
              setNaming({ state: "done", done: 0, total: 0 });
              return;
            }
            setNaming({ state: "running", done: 0, total: targets.length });
            (async () => {
              const map = loadPrefixed();
              let done = 0;
              let failed = 0;
              for (const target of targets) {
                try {
                  await renameSession(service, target.sessionId, target.title);
                  map[target.sessionId] = target.prefix;
                  done += 1;
                  setNaming({ state: "running", done, total: targets.length });
                } catch (error) {
                  failed += 1;
                  console.warn("[workspace-tree] prefix session title failed", target.sessionId, error);
                }
              }
              savePrefixed(map);
              setPending(Object.keys(map).length);
              setNaming({ state: failed ? "error" : "done", done, total: targets.length });
            })();
          };
          const clearTrash = () => {
            if (!window.confirm(t("config.trashConfirm"))) return;
            setClearing(true);
            fetch("/workspace-tree/trash/clear", { method: "POST" }).then((response) => response.json()).then((data) => {
              if (!data || data.ok === false) throw new Error(data && data.error || "clear-failed");
              setClearing(false);
              loadTrash();
            }).catch((error) => {
              setClearing(false);
              console.warn("[workspace-tree] clear trash failed", error);
              window.alert(t("config.trashFailed"));
            });
          };
          const trashText = trash.state === "loading" ? t("config.trashLoading") : trash.state === "error" ? t("config.trashFailed") : trash.count ? t("config.trashCount").replace("{n}", String(trash.count)).replace("{size}", formatBytes(trash.bytes)) : t("config.trashEmpty");
          return h(
            "div",
            { className: "wsf-config" },
            h(
              "div",
              { className: "wsf-config-section" },
              h("div", { className: "wsf-config-title" }, t("config.workspaces")),
              h("div", { className: "wsf-config-hint" }, t("config.workspacesHint")),
              workspaces.length ? h(
                "div",
                { className: "wsf-config-list" },
                workspaces.map((workspace) => {
                  const key = workspaceKey(workspace);
                  const checked = !disabled.includes(key);
                  return h(
                    "label",
                    { key: "ws:" + key, className: "wsf-config-row" },
                    h("input", {
                      type: "checkbox",
                      checked,
                      onChange: (event) => toggleWorkspace(key, event.target.checked)
                    }),
                    h("span", { className: "wsf-config-name" }, workspaceLabel2(workspace)),
                    h("span", { className: "wsf-config-path" }, workspace.path || "")
                  );
                })
              ) : h("div", { className: "wsf-config-hint" }, t("config.workspacesEmpty"))
            ),
            h(
              "div",
              { className: "wsf-config-section" },
              h("div", { className: "wsf-config-title" }, t("config.names")),
              h("div", { className: "wsf-config-hint" }, t("config.namesHint")),
              pending ? h(
                "div",
                { className: "wsf-config-hint" },
                t("config.namesPending").replace("{n}", String(pending))
              ) : null,
              naming.state === "running" ? h(
                "div",
                { className: "wsf-config-hint" },
                t("config.namesRunning").replace("{done}", String(naming.done)).replace("{total}", String(naming.total))
              ) : naming.state === "done" ? h(
                "div",
                { className: "wsf-config-hint" },
                t("config.namesDone").replace("{n}", String(naming.done))
              ) : naming.state === "error" ? h("div", { className: "wsf-config-hint" }, t("config.namesFailed")) : null,
              h(
                "div",
                { className: "wsf-config-actions" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-button",
                    disabled: naming.state === "running" || !workspaces.length,
                    onClick: prefixAll
                  },
                  t("config.namesButton")
                )
              )
            ),
            h(
              "div",
              { className: "wsf-config-section" },
              h("div", { className: "wsf-config-title" }, t("config.trash")),
              h("div", { className: "wsf-config-hint" }, trashText),
              h(
                "div",
                { className: "wsf-config-actions" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "wsf-button",
                    disabled: clearing || trash.state !== "ready" || !trash.count,
                    onClick: clearTrash
                  },
                  clearing ? t("config.trashClearing") : t("config.trashClear")
                )
              )
            )
          );
        }

        // src/client/apply.js
        function apply(ctx) {
          ctx.effect(() => ctx.locale.register(NS, "en", en), "workspace-tree locale en");
          ctx.effect(() => ctx.locale.register(NS, "zh", zh), "workspace-tree locale zh");
          ctx.effect(() => {
            const element = document.createElement("style");
            element.setAttribute("data-workspace-tree", "");
            element.textContent = css;
            document.head.appendChild(element);
            return () => {
              element.remove();
            };
          }, "workspace-tree styles");
          ctx.slots.inject(
            "sidebar",
            () => ctx.slots.register(
              {
                name: "sidebar.workspaces",
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
          );
          for (const key of ["@wxhccc/dsh-workspace-tree", "workspace-tree"]) {
            ctx.slots.inject(
              "plugins.bundle.config",
              () => ctx.slots.register(
                { name: "plugins.bundle.config", key, locale: NS, inject: () => ({ sessions: ctx.sessions }) },
                ConfigPanel
              )
            );
          }
        }

        // src/client/index.js
        var inject = ["slots", "locale", "uiWorkspace", "workspaces", "sessions"];
        return __toCommonJS(index_exports);
      })();

    return __workspaceTree
  },
})
