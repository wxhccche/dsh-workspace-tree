/**
 * The activity icon in front of a session title.
 *
 * A turn in progress gets a blue spinner; a finished turn that has not been
 * opened yet gets a green check. Anything else renders nothing, so idle rows
 * keep the plain title layout.
 */
import { h } from '../platform.js'

const SIZE = 14

export function SessionStateIcon(props) {
  const state = props.state
  if (state !== 'running' && state !== 'done') return null
  return h(
    'span',
    {
      className: 'wsf-state wsf-state--' + state,
      role: 'img',
      'aria-label': props.label,
      title: props.label,
    },
    h(
      'svg',
      {
        className: 'wsf-state-icon',
        viewBox: '0 0 16 16',
        width: SIZE,
        height: SIZE,
        'aria-hidden': 'true',
        focusable: 'false',
      },
      state === 'running'
        ? [
            // Full ring at low opacity plus a moving arc: the gap reads as motion.
            h('circle', { key: 'track', className: 'wsf-state-track', cx: 8, cy: 8, r: 6 }),
            h('path', { key: 'arc', className: 'wsf-state-arc', d: 'M8 2a6 6 0 0 1 6 6' }),
          ]
        : h('path', { key: 'check', className: 'wsf-state-check', d: 'M3.6 8.4l3 3 5.8-6' }),
    ),
  )
}
