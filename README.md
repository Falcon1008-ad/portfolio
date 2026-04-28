# Aradhya Agrawal — Portfolio

Personal portfolio site for **Aradhya Agrawal**, AI Engineer @ Academy Sports + Outdoors. A fully static, single-page site built with vanilla HTML, CSS, and JavaScript and deployed on **Google Firebase Hosting**.

Live: https://github.com/Falcon1008-ad/portfolio

## About the project

A clean, fast, content-first portfolio that highlights professional experience, featured projects, technical skills, and contact info — with no frameworks or build step. Designed to load instantly, score well on Lighthouse, and look great on every screen size.

### Highlights

- **Hero section** with animated rotating tagline ("I build…")
- **About** with quick-stat tiles (years of experience, rows optimized, A/B campaigns, revenue impact)
- **Experience timeline** — Academy Sports + Outdoors, SDSU, Motionworks, Amazon
- **Projects grid** — Ticket Generation with QR Code, AI Workflow Automation, OpenAlex Data Pipeline, Plastic Debris Detection (UN SDG)
- **Skills** grouped by AI/ML, Data Engineering, Cloud, Languages, Visualization, Analytics
- **Recognition** — MVP Award @ Academy Sports + Outdoors
- **Contact** section + downloadable resume PDF

### Features

- Dark / light theme toggle (preference saved in `localStorage`)
- Scroll-reveal animations
- Smooth-scroll navigation
- Responsive layout (mobile → desktop)
- SEO meta tags + semantic HTML
- Custom `404.html`
- No build step, no dependencies — pure static site

## Tech stack

| Layer        | Tools                                  |
| ------------ | -------------------------------------- |
| Markup       | HTML5                                  |
| Styling      | CSS3 (custom properties, grid, flex)   |
| Interactivity| Vanilla JavaScript (ES6+)              |
| Fonts        | Inter, JetBrains Mono (Google Fonts)   |
| Hosting      | Google Firebase Hosting                |
| CI / CD      | Firebase CLI (manual or GitHub Actions)|

## File structure

```
portfolio/
├── index.html          # Main single-page site
├── 404.html            # Custom not-found page
├── verify.html         # Domain / ownership verification page
├── styles.css          # All styles (themes, layout, animations)
├── script.js           # Theme toggle, scroll reveal, hero rotator
├── firebase.json       # Firebase Hosting config
├── amplify.yml         # (legacy — kept for reference, not used)
├── assets/
│   └── Aradhya_Agrawal_Resume.pdf
└── README.md
```

## Local preview

Open `index.html` directly in a browser, or run a tiny local server:

```bash
cd portfolio
python3 -m http.server 8000
# then visit http://localhost:8000
```

Or with the Firebase CLI:

```bash
firebase emulators:start --only hosting
# then visit http://localhost:5000
```

## Deploy to Firebase Hosting

The repo already includes a `firebase.json` configured to serve the project root as a static site.

### Step 1 — Install the Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2 — Create / link a Firebase project

If you haven't created the project yet, do it once at https://console.firebase.google.com → **Add project**.

Then from inside the `portfolio/` folder, link the local code to that project:

```bash
firebase use --add
# select your Firebase project from the list
```

This creates a `.firebaserc` file (gitignored is fine — it just stores the project alias).

### Step 3 — Verify the hosting config

`firebase.json` (already in the repo):

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

- `public: "."` serves the entire `portfolio/` folder as the site root
- `ignore` keeps Firebase config and dotfiles out of the deploy bundle

### Step 4 — Deploy

```bash
firebase deploy --only hosting
```

You'll get a live URL like `https://<your-project>.web.app` and `https://<your-project>.firebaseapp.com`.

### Step 5 — (Optional) Custom domain

In the Firebase Console → **Hosting** → **Add custom domain**. Firebase auto-provisions a free SSL certificate and gives you the DNS records to add at your registrar (Namecheap, GoDaddy, Google Domains, etc.).

### Step 6 — (Optional) Continuous deploy from GitHub

Run once:

```bash
firebase init hosting:github
```

This generates a GitHub Actions workflow at `.github/workflows/firebase-hosting-merge.yml` that auto-deploys on every push to `main`, plus a preview workflow for pull requests.

## Updating the resume

Replace `assets/Aradhya_Agrawal_Resume.pdf` with the new file, then redeploy:

```bash
firebase deploy --only hosting
```

## Updating content

All copy lives directly in `index.html` — edit the section you want (Hero, About, Experience, Projects, Skills, Contact), save, and redeploy. No build step required.

## Contact

- **LinkedIn** — https://www.linkedin.com/in/agrawalaradhya0204/
- **GitHub** — https://github.com/Falcon1008-ad
- **Email** — agrawalaradhya121@gmail.com

## License

Personal portfolio — code is shared for reference. Please don't repurpose the content (copy, resume, project descriptions) as your own.
