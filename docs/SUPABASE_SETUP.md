# Supabase setup for Thumbric

Thumbric works **without** Supabase (device-local register). Add these for cloud accounts.

## 1. Create a project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon public** key
3. Set in `.env` / CI:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 2. Auth settings

- Enable **Email** provider
- Optional: magic link (sign-up without password)
- Optional: Google OAuth later

## 3. Profiles table (optional sync)

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  email text unique,
  plan text default 'free',
  designs_created int default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
```

## Freemium (product)

| State | Create | Save | Download |
| --- | --- | --- | --- |
| Guest | 8 designs | blocked | blocked → register |
| Free (registered) | unlimited | yes | 5 mild `thumbric` marks / day |
| Creator | unlimited | yes | unlimited marked + 30 clean / mo |
| Pro | unlimited | yes | unlimited clean |

Stripe checkout is still demo-local until connected.
