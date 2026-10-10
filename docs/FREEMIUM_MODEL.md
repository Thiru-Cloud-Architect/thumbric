# Thumbric freemium model

Inspired by Canva / vidIQ free → paid conversion: **try freely, register to keep work, pay for clean HD.**

## Limits

| | Guest | Free (registered) | Creator ₹19 / $1 | Pro ₹49 / $3 |
| --- | --- | --- | --- | --- |
| Create designs | **8** in this browser | Unlimited | Unlimited | Unlimited |
| Save projects | ❌ → register | ✅ | ✅ | ✅ |
| Download PNG | ❌ → register | **5 / day** mild `thumbric` corner mark | Unlimited marked | Unlimited |
| Clean (no mark) | — | — | **30 / month** | Unlimited |
| Pro AI imaging (fal) | **3 / month** | **3 / month** | **60 / month** | **Unlimited** |
| AI Maker after Pro quota | Free Pollinations | Same | Same | — |

## Why this mix

1. **8 guest designs** lets someone feel the editor before an account wall.
2. **Register to save/download** builds a real user list (Supabase when configured).
3. **5 mild watermarks / day** is generous for hobby uploads but nudges weekly creators to Creator.
4. **Creator 30 clean / month** ≈ a thumbnail a day — matches “weekly upload” positioning without giving Pro away.
5. **Pro unlimited clean** for daily publishers / agencies.

## Auth

- Preferred: Supabase email/password or magic link (`VITE_SUPABASE_*`).
- Fallback: device-local register (no env required) so demos never block.

See `docs/SUPABASE_SETUP.md`.
