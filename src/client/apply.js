/**
 * Registers locales, styles, the sidebar slot and the plugin page block.
 */
import { NS } from './constants.js'
import { en, zh } from './i18n.js'
import { css } from './styles.js'
import { Region } from './components/region.js'
import { ConfigPanel } from './components/config-panel.js'
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, 'en', en), 'workspace-tree locale en')
  ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'workspace-tree locale zh')
  ctx.effect(() => {
    const element = document.createElement('style')
    element.setAttribute('data-workspace-tree', '')
    element.textContent = css
    document.head.appendChild(element)
    return () => {
      element.remove()
    }
  }, 'workspace-tree styles')
  // priority -1 ranks below the built-in browser; a single slot renders the lowest priority.
  ctx.slots.inject('sidebar', () =>
    ctx.slots.register(
      {
        name: 'sidebar.workspaces',
        priority: -1,
        locale: NS,
        inject: () => ({
          uiWorkspace: ctx.uiWorkspace,
          workspaces: ctx.workspaces,
          sessions: ctx.sessions,
        }),
      },
      Region,
    ),
  )
  // Plugin page: render this configuration on the plugin's own page under Plugins.
  // The page keys entries by package name, but register the patch id as well to be safe.
  for (const key of ['@local/workspace-tree', 'workspace-tree']) {
    ctx.slots.inject('plugins.bundle.config', () =>
      ctx.slots.register(
        { name: 'plugins.bundle.config', key, locale: NS, inject: () => ({ sessions: ctx.sessions }) },
        ConfigPanel,
      ),
    )
  }
}
