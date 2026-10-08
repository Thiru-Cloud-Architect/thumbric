# Thumbric Error Taxonomy

| Code | User message | Preserve | Action |
|------|--------------|----------|--------|
| AI_RATE | Free AI is cooling down — studio looks still work | prompt + assets | Retry / wait |
| AI_NETWORK | Couldn’t reach the image service | prompt + assets | Retry |
| AI_EMPTY | One look failed — others still usable | partial results | More looks |
| UPLOAD_TYPE | Choose a JPG or PNG | prior canvas | Pick another file |
| UPLOAD_READ | That photo could not be opened | prior canvas | Pick another file |
| EXPORT_CLIP | Headline may be partly outside the canvas | draft | Fix automatically / Export anyway |
| EXPORT_SIZE | Text may be small on phones | draft | Raise size |
| AUTH_DEMO | Demo unlock on this browser — payments later | entitlement | Continue |
| AUTOSAVE_QUOTA | Could not autosave (storage full) | memory state | Clear old projects |

Never show raw CORS / 402 / stack traces to end users.
