/**
 * Entry point of the plugin bundle.
 *
 * The DSH module loader materialises one bundle per plugin and reads the
 * exported `inject` list to decide which host services to hand to `apply`.
 */
import { apply } from './apply.js'

export const inject = ['slots', 'locale', 'uiWorkspace', 'workspaces', 'sessions']

export { apply }
