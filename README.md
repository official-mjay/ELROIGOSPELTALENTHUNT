# El-Roi Gospel Talent Hunt — Season 3

Website project for the El-Roi Gospel Talent Hunt Season 3 event. The public interface is built with React and Vite; Supabase is the planned backend for database, authentication, private contestant uploads and secure voting. Netlify is the intended hosting platform.

## Run locally

1. Install Node.js (LTS).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add the Supabase project URL and public anon/publishable key.
4. Run `npm run dev`.
5. Run `npm run build` to verify the production build.

## Backend status

The frontend scaffold is committed, but it is **not a live registration or voting system yet**. Before launch, configure a Supabase project, apply the database schema and row-level security policies, configure email delivery and storage, then test admin/contestant permissions. Never put a Supabase service-role key in browser code.

For the Netlify registration function, `SUPABASE_URL` must be the full Supabase project URL (for example, `https://your-project.supabase.co`), not a publishable key. Configure `SUPABASE_SERVICE_ROLE_KEY` as a server-side Netlify environment variable only. Redeploy after changing function environment variables.

## Event settings currently supplied

- Registration: individual ₦3,000; group ₦10,000
- Payment: Wema Bank; K-S ADEGBE NIG LTD; account number 0125731531
- Receipt confirmation: manual review by the event team via WhatsApp +2347039558747
- Prizes: ₦300,000; ₦200,000; ₦100,000; ₦50,000; ₦30,000
- Event date: Coming Soon
- Venue: Divine Suites, before Dantata Street, behind Presbyterian Church, Checkpoint, Nasarawa State

## Security requirements before launch

- Admin-only server-verified role checks for payment review, contestant approval and event settings.
- Contestant accounts activated by expiring, single-use email invitation links; contestants can only edit permitted fields on their own profiles.
- Store receipts and unapproved photos in private storage; publish only approved contestant media.
- Enforce one vote per verified voter in the database/server, not just browser state or cookies. Add rate limits and audit logs.
- Keep registration payment independent from public voting; never sell votes.

## Netlify

Build command: `npm run build`  
Publish directory: `dist`  
Add the two `VITE_SUPABASE_*` variables in Netlify environment variables once the backend is configured.
