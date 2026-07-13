# Avatar Action Interface

This project exposes a frontend-only action interface for future backend or WebSocket integration. This does not wire messages into `useWebSocket` yet.

## Supported Message

```json
{
  "type": "avatar_action",
  "action": "speaking",
  "model": "xuancao",
  "emotion": "neutral",
  "requestId": "optional-response-id"
}
```

## Fields

- `type`: use `avatar_action` for backend-originated avatar state messages.
- `action`: one of `idle`, `listening`, `thinking`, `speaking`. The frontend helper also accepts `stop`, `listen`, `think`, `speak`, and `talk`.
- `model`: optional; one of `miara`, `little_panda`, `xuancao`. Omit it to keep the current model.
- `emotion`: optional. Current automatic expression mapping only applies to `little_panda`.
- `requestId`: optional id for future logging or response correlation.

## Future Hookup Point

When WebSocket integration is added later, handle an incoming action message by calling:

```js
import { useAppStore } from '../stores/appStore'

useAppStore.getState().applyAvatarAction({
  type: 'avatar_action',
  action: data.action,
  model: data.model,
  emotion: data.emotion,
  requestId: data.requestId,
})
```

Recommended backend stream sequence:

1. Send `avatar_action` with `action: "thinking"` after accepting a user question.
2. Send `avatar_action` with `action: "speaking"` before the first audio chunk.
3. Stream binary PCM audio chunks using the current audio-player format.
4. Send `stream_end`. The current audio player returns to `idle` after the audio queue is empty.
