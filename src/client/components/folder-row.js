/**
 * A folder row of the sidebar tree.
 */
import { React, h, Menu, IconEllipsisOutlineRegular, IconFolderOpenRegular, IconFolderCloseRegular, IconTriangleRightFillRegular, IconNewChatOutlineRegular } from '../platform.js'
import { clsx } from '../util.js'
export function FolderRow(props) {
  const { t, folder, depth, collapsed, editing, dropActive, dragging, menuItems } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const name = folder.name || t('folder.untitled')
  return h(
    'div',
    {
      className: clsx([
        'wsf-row',
        'wsf-row--project',
        menuOpen && 'wsf-row--menu',
        dropActive && 'wsf-row--drop',
        dragging && 'wsf-row--dragging',
      ]),
      style: { '--wsf-indent': 8 + depth * 14 + 'px' },
      role: 'treeitem',
      tabIndex: 0,
      'aria-expanded': !collapsed,
      onKeyDown: (event) => {
        // Menu buttons and the rename input sit inside the row; only row-level keys are handled.
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          props.onToggle()
        } else if (event.key === 'ArrowRight' && collapsed) {
          event.preventDefault()
          props.onToggle()
        } else if (event.key === 'ArrowLeft' && !collapsed) {
          event.preventDefault()
          props.onToggle()
        }
      },
      draggable: !editing,
      onClick: () => {
        if (!editing) props.onToggle()
      },
      onDragStart: props.onDragStart,
      onDragEnd: props.onDragEnd,
      onDragOver: (event) => {
        event.preventDefault()
        event.stopPropagation()
        props.onDragOver(event)
      },
      onDragLeave: props.onDragLeave,
      onDrop: props.onDrop,
    },
    h(
      'span',
      { className: 'wsf-slot wsf-folder' },
      h(collapsed ? IconFolderCloseRegular : IconFolderOpenRegular),
    ),
    h(
      'span',
      { className: 'wsf-slot wsf-chevron' },
      h(IconTriangleRightFillRegular, {
        className: clsx(['wsf-arrow', !collapsed && 'wsf-arrow--open']),
      }),
    ),
    h(
      'span',
      { className: 'wsf-text' },
      editing
        ? h('input', {
            className: 'wsf-input',
            autoFocus: true,
            value: editing.value,
            placeholder: t('folder.placeholder'),
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
        : h('span', { className: 'wsf-title', title: name }, name),
    ),
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
            'aria-label': t('folder.actions'),
            title: t('folder.actions'),
            onClick: (event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            },
          },
          h(IconEllipsisOutlineRegular),
        ),
      }),
      props.onNewSession
        ? h(
            'button',
            {
              type: 'button',
              className: 'wsf-action',
              'aria-label': t('section.newSession'),
              title: t('section.newSession'),
              style: { width: 20, height: 20 },
              onClick: (event) => {
                event.stopPropagation()
                props.onNewSession()
              },
            },
            h(IconNewChatOutlineRegular),
          )
        : null,
    ),
  )
}
