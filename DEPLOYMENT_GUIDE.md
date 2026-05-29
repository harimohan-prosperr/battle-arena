# Battle Arena — Deployment Guide
## From zero to live URL in ~30 minutes

---

## WHAT YOU'LL HAVE WHEN DONE

- A live URL (e.g. https://battle-arena-xyz.vercel.app)
- Login screen — players sign in with email + password
- Admin panel — you create accounts for your team, no self-signup
- Real-time ITR battle tracking, leaderboards, 7-day competitions
- Free hosting (Vercel) + free database (Supabase, up to 50,000 rows)

---

## STEP 1 — Install tools on your computer

You need Node.js installed.

1. Go to https://nodejs.org and download the "LTS" version
2. Install it (click through the installer)
3. Open Terminal (Mac) or Command Prompt (Windows)
4. Confirm it works:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

---

## STEP 2 — Set up Supabase (your database + auth)

Supabase is free and handles logins + data storage.

1. Go to https://supabase.com and click **Start for Free**
2. Sign up with GitHub or email
3. Click **New Project**
   - Name it: `battle-arena`
   - Set a strong database password (save it somewhere safe)
   - Choose a region close to you (e.g. Southeast Asia for India)
   - Click **Create new project** (takes ~2 minutes)

4. Once created, go to **SQL Editor** (left sidebar)
5. Click **New Query**
6. Open the file `supabase_schema.sql` from this project
7. **Copy the entire contents** and paste into the SQL editor
8. Click **Run** (green button)
   - You should see "Success. No rows returned"

9. Now go to **Settings → API** (left sidebar)
10. Copy two values — you'll need them in Step 4:
    - **Project URL** (looks like `https://abcdefgh.supabase.co`)
    - **anon / public key** (long string starting with `eyJ...`)

---

## STEP 3 — Set up the project on your computer

1. Download this entire `battle-arena` folder to your computer

2. Open Terminal / Command Prompt and navigate to it:
   ```
   cd path/to/battle-arena
   ```
   Example on Mac: `cd ~/Downloads/battle-arena`
   Example on Windows: `cd C:\Users\YourName\Downloads\battle-arena`

3. Install dependencies:
   ```
   npm install
   ```
   (This downloads React, Supabase SDK, etc. Takes ~1 minute)

---

## STEP 4 — Connect to your Supabase project

1. In the `battle-arena` folder, find the file `.env.example`
2. Make a copy of it and rename the copy to `.env.local`
3. Open `.env.local` in any text editor (Notepad, TextEdit, VS Code)
4. Fill in your values from Step 2:

   ```
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. Save the file

---

## STEP 5 — Test it locally

In Terminal, run:
```
npm run dev
```

Open your browser and go to **http://localhost:5173**

You'll see the login screen. You can't log in yet — you haven't created any users.
That's normal. Keep reading.

---

## STEP 6 — Create your first admin account (yourself)

You need to create the first user directly in Supabase.

1. Go to your Supabase project
2. Click **Authentication** (left sidebar) → **Users**
3. Click **Invite user** or **Add user**
   - Enter your email
   - Enter a password
   - Click **Create User**

4. Now go to **Table Editor → profiles**
5. Find your row (it was auto-created by the trigger)
6. Click the row, find `is_admin` column, set it to `true`
7. Also fill in `username` with your display name
8. Click **Save**

9. Go back to http://localhost:5173 and log in with your email + password
10. You should see the ⚙ Admin tab in the nav — that's yours!

---

## STEP 7 — Create accounts for your team

Now use the Admin panel inside the app:

1. Go to **⚙ Admin** in the nav
2. Click **+ Add Player**
3. Fill in:
   - Username: their display/gamer tag
   - Email: their work email
   - Password: a temporary one (they should change it)
   - Team: assign them to a team (create teams first)
   - Colour: pick their avatar colour
4. Click **Create Player**
5. Share their email + password with them — they log in at your live URL

To create teams first:
1. Click **+ Add Team** in Admin
2. Enter team name (e.g. "Neon Wolves"), tag (e.g. "NW"), colour
3. Then assign players to it when creating them

---

## STEP 8 — Deploy to Vercel (get a live URL)

Vercel hosts your app for free with a public URL.

### 8a. Push to GitHub

1. Go to https://github.com and create a free account if you don't have one
2. Create a **New Repository** called `battle-arena` (set to Private)
3. In Terminal, run these commands one by one:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/battle-arena.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your actual GitHub username.

### 8b. Deploy on Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New → Project**
3. Find and select your `battle-arena` repository
4. Click **Import**
5. Before clicking Deploy, click **Environment Variables** and add:
   ```
   Name:  VITE_SUPABASE_URL
   Value: https://your-project-id.supabase.co

   Name:  VITE_SUPABASE_ANON_KEY
   Value: eyJ... (your anon key)
   ```
6. Click **Deploy**
7. Wait ~1 minute — Vercel builds and deploys automatically

8. Click **Visit** — your app is now live at something like:
   `https://battle-arena-abc123.vercel.app`

**Every time you make changes**, just run `git push` and Vercel auto-deploys.

---

## STEP 9 — Enable Realtime (live score updates)

So battle scores update instantly without refreshing:

1. In Supabase, go to **Database → Replication** (left sidebar)
2. Under "Source", click **0 tables** next to supabase_realtime
3. Toggle ON: `battles` and `daily_scores`
4. Click **Save**

---

## STEP 10 — Share with your team

Send your team members:
- The live URL (e.g. `https://battle-arena-abc123.vercel.app`)
- Their email address
- Their temporary password

They log in, change password in profile if they want, and start battling.

---

## HOW PLAYERS USE IT

| Action | How |
|--------|-----|
| Log in | Use email + password you created for them |
| Issue a battle challenge | Battles tab → ⚔ Issue Challenge |
| Accept a challenge | Battles tab → Accept Challenge button |
| Log daily ITRs | Battles tab → "+ Log Day X" button (once per day) |
| See standings | Leaderboard tab |
| See my stats | My Profile tab |

---

## TROUBLESHOOTING

**"Invalid login credentials"**
→ Double-check email/password. Make sure you created the user in Supabase Auth, not just the profiles table.

**Admin page shows nothing / can't create users**
→ The Admin page uses `supabase.auth.admin.createUser()` which requires the **service role key**. For security, you should create a Supabase Edge Function for this. Alternatively, create users directly in Supabase dashboard → Authentication → Users.

**Scores not updating in real time**
→ Make sure you enabled Replication for `battles` and `daily_scores` in Step 9.

**Build fails on Vercel**
→ Make sure both environment variables are set correctly in Vercel project settings.

**"relation does not exist" errors**
→ Re-run the SQL schema in Supabase SQL Editor.

---

## OPTIONAL CUSTOM DOMAIN

In Vercel → your project → Settings → Domains:
Add your own domain like `battles.yourcompany.com`
(Requires a domain you own — free with most hosting providers)

---

## COSTS

| Service | Free tier | When you'd pay |
|---------|-----------|----------------|
| Vercel  | Unlimited deploys, 100GB bandwidth | Custom domain SSL, teams |
| Supabase | 50,000 DB rows, 500MB storage, 2GB bandwidth | More data or users |

For a team of <50 people, both free tiers are more than enough.
