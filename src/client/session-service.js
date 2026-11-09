/**
 * Session mutations that go through the DSH client services.
 */
export async function renameSession(service, sessionId, title) {
  const result = await service.using(sessionId, { source: 'workspaceOperation' }, (reference) =>
    reference.binding.session.rename(title),
  )
  if (result && result.ok === false) throw new Error('rename failed: ' + sessionId)
  return true
}
