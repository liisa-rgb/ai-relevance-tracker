# Stay Relevant in an AI World — 5-Day Tracker

A 5-day self-reflection app for the course "Stay Relevant in an AI World".
Participants answer 5 questions each evening, download their answers as a Word document,
and receive a personalised AI analysis after completing all 5 days.

---

## How to deploy in 4 steps

### Step 1 — Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** in the left menu
4. Click **Create Key** and copy it somewhere safe

---

### Step 2 — Put the code on GitHub

1. Go to https://github.com and sign in (or create a free account)
2. Click the **+** button top right → **New repository**
3. Name it `ai-relevance-tracker`
4. Leave it **Private**, click **Create repository**
5. On the next screen, click **uploading an existing file**
6. Drag and drop ALL the files from this folder into the upload area
   (make sure to include the `src` folder and all its contents)
7. Click **Commit changes**

---

### Step 3 — Deploy to Vercel

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **Add New Project**
3. Find `ai-relevance-tracker` in the list and click **Import**
4. Before clicking Deploy, click **Environment Variables**
5. Add one variable:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** your API key from Step 1
6. Click **Deploy**
7. Wait about 60 seconds — Vercel will give you a live URL

---

### Step 4 — Share the URL

Copy the URL Vercel gives you (e.g. `ai-relevance-tracker.vercel.app`)
and share it with your course participants.

That's it. Everything works:
- ✅ Calendar reminder download
- ✅ Daily answer download as Word document
- ✅ Correct 5-day sequencing
- ✅ localStorage saves progress between sessions (per device/browser)
- ✅ Full AI analysis after Day 5

---

## Updating the app

If you want to make changes later:
1. Edit the files locally
2. Go to your GitHub repository
3. Upload the changed files (GitHub will replace the old ones)
4. Vercel automatically redeploys within about 60 seconds

---

## Notes

- **Data privacy:** All participant answers stay in their own browser (localStorage).
  You cannot see their answers. They are never sent to a server.
- **API costs:** Each analysis uses the Anthropic API. Costs are very low
  (a few cents per participant). Monitor usage at https://console.anthropic.com
- **Cross-device:** If a participant switches device or browser, they start fresh.
  Advise them to use the same browser on the same device each day.
