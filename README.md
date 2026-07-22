# The Floor Session — Landing Page

## What's in this folder
- `index.html` — the landing page
- `netlify/functions/submit-enquiry.js` — secure serverless function that sends form submissions to Airtable
- `netlify.toml` — tells Netlify where the function lives

## Deploy steps

### 1. Airtable
1. Create a base called "The Floor Session Enquiries" with a table called `Leads`.
2. Fields: Name, Company, Email, Phone, Team Size, Package, Booking Type, Message, Submitted At (Date).
3. Get your **Base ID** (Help → API documentation, starts with `app...`).
4. Create a **Personal Access Token** (account icon → Developer Hub → Personal access tokens) with `data.records:write` scope, added to this base.

### 2. GitHub
1. Create a new repository (e.g. `the-floor-session-site`).
2. Upload these files (or push via git) into the repo.

### 3. Netlify
1. New site → Import from GitHub → pick the repo.
2. Build settings: leave blank (no build command needed) — publish directory `.`
3. Before deploying (or right after, then redeploy), go to **Site settings → Environment variables** and add:
   - `AIRTABLE_TOKEN` = your Personal Access Token
   - `AIRTABLE_BASE_ID` = your Base ID
   - `AIRTABLE_TABLE_NAME` = `Leads`
4. Deploy. Netlify gives you a live URL immediately (e.g. `yourname.netlify.app`).
5. Test the form once live — check that a new row appears in Airtable.

### 4. Custom domain (optional)
Site settings → Domain management → Add a custom domain, then follow Netlify's DNS instructions.

## Notes
- The Airtable token is never in the HTML/JS — it lives only in Netlify's environment variables, which the function reads server-side.
- There's a hidden honeypot field (`company_website`) for basic spam protection — leave it as-is, it's invisible to real visitors.
