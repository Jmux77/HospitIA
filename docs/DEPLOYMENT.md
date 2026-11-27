# Deployment runbook

## Required accounts
- Supabase project in an appropriate EU region.
- OpenAI API project and server-side API key.
- GitHub repository.
- Vercel project connected to this repository.

## Local setup
1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY`.
5. Run `npm run dev` and open `http://localhost:3000`.

## Supabase setup
1. Run `supabase/schema.sql` once in SQL Editor.
2. Create a pilot user in Authentication.
3. Insert the hotel into `public.hotels`.
4. Insert an owner membership into `public.hotel_members` using real UUIDs.
5. Add only factual, approved public information in `public.hotel_facts`.

## Vercel
1. Import the GitHub repository and select the feature branch for preview.
2. Add environment variables in Project Settings.
3. Deploy a Preview, not Production, for the first iteration.
4. Test login, RLS boundaries, guest questions and unknown-answer fallback.
5. Promote to Production only after completing docs/SECURITY-CHECKLIST.md.

Never commit `.env.local`, Supabase service-role keys, OpenAI API keys, Stripe secrets, or database passwords.
