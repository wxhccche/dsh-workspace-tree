/**
 * Stylesheet injected once, copied from the built-in browser modules.
 */
export const css = `
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
.wsf-row--project .wsf-project-icon { color: var(--dsw-alias-label-primary); }
.wsf-row--project .wsf-chevron {
  color: var(--dsw-alias-label-caption);
  opacity: 0.5;
  transition: opacity 0.12s var(--ds-ease-in-out);
}
.wsf-row--project:hover .wsf-chevron,
.wsf-row--project:focus-visible .wsf-chevron { opacity: 1; }
.wsf-row--project .wsf-title { font-weight: 600; letter-spacing: 0.01em; }
.wsf-workspace + .wsf-workspace { margin-top: 8px; }
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
.wsf-state {
  flex: none;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-inline-end: 2px;
}
.wsf-state--running { color: var(--dsw-alias-state-business-primary); }
.wsf-state--done { color: var(--dsw-alias-state-success-primary, #2f9e5f); }
.wsf-state-icon { display: block; }
.wsf-state-track { fill: none; stroke: currentColor; stroke-width: 2; opacity: 0.22; }
.wsf-state-arc {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  transform-origin: 8px 8px;
  animation: wsf-spin 900ms linear infinite;
}
.wsf-state-check { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
@keyframes wsf-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .wsf-state-arc { animation: none; }
}
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
@media (prefers-reduced-motion: reduce) { .wsf-arrow { transition: none; } .wsf-row--project .wsf-chevron { transition: none; } }
`
