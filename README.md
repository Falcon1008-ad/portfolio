# Aradhya Agrawal — Portfolio

Personal portfolio site. Static HTML/CSS/JS. Dark/light toggle. Deployed on AWS Amplify.

## Local preview

Open `index.html` in a browser, or run a tiny local server:

```bash
cd portfolio
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to AWS Amplify (with a new GitHub repo)

### Step 1 — Create a GitHub repo

1. Go to https://github.com/new
2. Name it (e.g., `portfolio`). Keep it **public** (or private — Amplify supports both).
3. Don't add README/gitignore/license (we'll push our own).

### Step 2 — Push this folder to GitHub

From inside the `portfolio/` folder:

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If you haven't used GitHub from this machine before, you may need to authenticate (GitHub CLI `gh auth login` is easiest, or use a personal access token).

### Step 3 — Connect to AWS Amplify

1. Go to the **AWS Amplify Console** → https://console.aws.amazon.com/amplify/
2. Click **"Create new app"** → **"Host web app"**
3. Choose **GitHub** as the source → authorize AWS to access your repos
4. Select your `portfolio` repo + the `main` branch → **Next**
5. **Build settings** — Amplify auto-detects static sites. Use this `amplify.yml` (already included in the repo):
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands: []
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
     cache:
       paths: []
   ```
6. Click **Next** → **Save and deploy**
7. Amplify builds and deploys in ~1–2 min. You'll get a URL like `https://main.d2abc123.amplifyapp.com`.

### Step 4 — (Optional) Add a custom domain

1. In Amplify console → your app → **Domain management** → **Add domain**
2. Buy a domain on Route 53 (or connect one from Namecheap/GoDaddy)
3. Amplify auto-provisions free SSL via ACM

### Step 5 — Continuous deploy

Every `git push` to `main` auto-triggers a new Amplify deploy. No manual steps needed.

## Updating the resume

Replace `assets/Aradhya_Agrawal_Resume.pdf` with the updated file. Commit + push.

## File structure

```
portfolio/
├── index.html          # Main page
├── styles.css          # Styles (dark/light themes)
├── script.js           # Theme toggle + scroll reveal
├── amplify.yml         # AWS Amplify build config
├── assets/
│   └── Aradhya_Agrawal_Resume.pdf
└── README.md
```

## Cost

AWS Amplify Free Tier (first 12 months):
- 1,000 build minutes/month
- 15 GB served/month
- 5 GB stored/month

After free tier: ~$0.01/build minute + $0.15/GB served. A personal portfolio typically stays under $1/mo.
