/**
 * Host modules the plugin borrows instead of bundling.
 *
 * React and the DSH UI primitives are provided by the app's module loader, so
 * keeping them external makes the bundle resolve to the very instances the app
 * already runs — one React, one icon set, one clipboard helper.
 */
import React from 'react'
import {
  Menu,
  IconEllipsisOutlineRegular,
  IconFolderOpenRegular,
  IconFolderCloseRegular,
  IconTriangleRightFillRegular,
  IconNewChatOutlineRegular,
  IconPlusOutlineRegular,
  IconEditOutlineRegular,
  IconTrashOutlineRegular,
  IconProjectAddOutlineRegular,
  IconArchiveOutlineRegular,
  writeClipboard
} from '@deepseek-ai/dsh-client-ui-primitives'

const h = React.createElement

export {
  React,
  h,
  Menu,
  IconEllipsisOutlineRegular,
  IconFolderOpenRegular,
  IconFolderCloseRegular,
  IconTriangleRightFillRegular,
  IconNewChatOutlineRegular,
  IconPlusOutlineRegular,
  IconEditOutlineRegular,
  IconTrashOutlineRegular,
  IconProjectAddOutlineRegular,
  IconArchiveOutlineRegular,
  writeClipboard
}
