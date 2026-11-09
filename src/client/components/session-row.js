/**
 * A session row of the sidebar tree.
 */
import { React, h, Menu, IconEllipsisOutlineRegular } from '../platform.js'
import { clsx } from '../util.js'
export function SessionRow(props) {
  const { t, title, depth, dropActive, dragging, menuItems, editing, selected, time } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  return h(
    'div',
    {
      className: clsx([
        'wsf-row',
        'wsf-row--session',
        menuOpen && 'wsf-row--menu',
        dropActive && 'wsf-row--drop',
        dragging && 'wsf-row--dragging',
        selected && 'wsf-row--selected',
      ]),
      style: { '--wsf-indent': 8 + depth * 14 + 'px' },
      role: 'treeitem',
      tabIndex: 0,
      'aria-selected': Boolean(selected),
      title: props.path || title,
      draggable: props.movable !== false && !editing,
      onClick: props.onOpen,
      onKeyDown: (event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          props.onOpen()
        } else if (event.key === 'F2') {
          event.preventDefault()
          props.onRename()
        }
      },
      onDragStart: props.onDragStart,
      onDragEnd: props.onDragEnd,
    },
    h(
      'span',
      { className: 'wsf-text' },
      editing
        ? h('input', {
            className: 'wsf-input',
            autoFocus: true,
            value: editing.value,
            onClick: (event) => event.stopPropagation(),
            onChange: (event) => props.onEditChange(event.target.value),
            onBlur: props.onEditCommit,
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                props.onEditCommit()
              } else if (event.key === 'Escape') {
                event.preventDefault()
                props.onEditCancel()
              }
            },
          })
        : h(
            'span',
            {
              className: 'wsf-title',
              onDoubleClick: (event) => {
                event.stopPropagation()
                props.onRename()
              },
            },
            title,
          ),
    ),
    time ? h('span', { className: 'wsf-time' }, time) : null,
    h(
      'span',
      { className: 'wsf-actions' },
      h(Menu, {
        open: menuOpen,
        onClose: () => setMenuOpen(false),
        items: menuItems,
        onSelect: (id) => {
          setMenuOpen(false)
          props.onMenuSelect(id)
        },
        portal: true,
        closeOnPointerLeave: true,
        anchor: h(
          'button',
          {
            type: 'button',
            className: 'wsf-action',
            'aria-label': t('session.actions'),
            title: t('session.actions'),
            onClick: (event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            },
          },
          h(IconEllipsisOutlineRegular),
        ),
      }),
    ),
  )
}
