/**
 * A workspace row of the sidebar tree.
 */
import { React, h, Menu, IconEllipsisOutlineRegular, IconFolderOpenRegular, IconTriangleRightFillRegular, IconNewChatOutlineRegular, IconEditOutlineRegular, IconWorkspaceTreeOutlineRegular } from '../platform.js'
import { clsx } from '../util.js'
export function WorkspaceRow(props) {
  const { t, label, collapsed, dropActive, editing } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const items = [
    { id: 'rename', label: t('workspace.rename'), icon: h(IconEditOutlineRegular) },
  ]
  if (props.onAddFolder) {
    items.push({ id: 'folder', label: t('section.addFolder'), icon: h(IconFolderOpenRegular) })
  }
  return h(
    'div',
    {
      className: clsx([
        'wsf-row',
        'wsf-row--project',
        menuOpen && 'wsf-row--menu',
        dropActive && 'wsf-row--drop',
      ]),
      role: 'treeitem',
      'aria-expanded': !collapsed,
      'aria-level': 1,
      title: props.path,
      onClick: () => {
        if (!editing) props.onToggle()
      },
      onDragOver: (event) => {
        event.preventDefault()
        event.stopPropagation()
        props.onDragOver()
      },
      onDragLeave: props.onDragLeave,
      onDrop: props.onDrop,
    },
    h(
      'span',
      { className: 'wsf-slot wsf-project-icon' },
      h(IconWorkspaceTreeOutlineRegular),
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
        : h('span', { className: 'wsf-title' }, label),
    ),
    h(
      'span',
      { className: 'wsf-actions' },
      h(Menu, {
        open: menuOpen,
        onClose: () => setMenuOpen(false),
        items,
        onSelect: (id) => {
          setMenuOpen(false)
          if (id === 'rename') props.onRename()
          else if (id === 'folder') props.onAddFolder()
        },
        portal: true,
        closeOnPointerLeave: true,
        anchor: h(
          'button',
          {
            type: 'button',
            className: 'wsf-action',
            'aria-label': t('section.workspaceActions'),
            title: t('section.workspaceActions'),
            onClick: (event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            },
          },
          h(IconEllipsisOutlineRegular),
        ),
      }),
      h(
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
      ),
    ),
  )
}
