export const AVATAR_ACTION_MESSAGE_TYPE = 'avatar_action'

export const AVATAR_ACTIONS = Object.freeze({
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
})

export const SUPPORTED_AVATAR_MODELS = Object.freeze([
  'miara',
  'little_panda',
  'xuancao',
])

const ACTION_ALIASES = Object.freeze({
  idle: AVATAR_ACTIONS.IDLE,
  stop: AVATAR_ACTIONS.IDLE,
  listen: AVATAR_ACTIONS.LISTENING,
  listening: AVATAR_ACTIONS.LISTENING,
  think: AVATAR_ACTIONS.THINKING,
  thinking: AVATAR_ACTIONS.THINKING,
  speak: AVATAR_ACTIONS.SPEAKING,
  speaking: AVATAR_ACTIONS.SPEAKING,
  talk: AVATAR_ACTIONS.SPEAKING,
})

export function normalizeAvatarActionPayload(input) {
  const payload = typeof input === 'string' ? { action: input } : input
  if (!payload || typeof payload !== 'object') return null

  const rawAction = String(payload.action || payload.state || '').trim().toLowerCase()
  const action = ACTION_ALIASES[rawAction]
  if (!action) return null

  const rawModel = payload.model ? String(payload.model).trim() : ''
  const model = SUPPORTED_AVATAR_MODELS.includes(rawModel) ? rawModel : undefined
  const emotion = payload.emotion ? String(payload.emotion).trim() : undefined

  return {
    type: AVATAR_ACTION_MESSAGE_TYPE,
    action,
    model,
    emotion,
    requestId: payload.requestId || payload.responseId || undefined,
  }
}
