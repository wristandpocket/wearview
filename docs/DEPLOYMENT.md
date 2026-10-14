# WearView — Deployment & Hosting Guide

This guide describes how WearView is deployed to the cloud alongside your other pet projects under **`sivochka.com/wearview/`**.

---

## 1. Hosting Architecture: How Pet Projects Work on `sivochka.com`

All your pet projects (such as `lego-catalog`, `3d-club-studio`, and `OGCruncher`) follow the native GitHub Pages user architecture:

1. **User Apex Site:** Your user site `https://github.com/Figarist/figarist.github.io` holds the custom domain `sivochka.com`.
2. **Project Subpaths:** Any repository created under your user account (`https://github.com/Figarist/<repo-name>`) with GitHub Pages enabled is automatically served at:
   👉 **`https://sivochka.com/<repo-name>/`**
3. **No DNS / CNAME Overhead:**
   - **No CNAME records in Namecheap** are needed for individual projects.
   - **No "Custom domain" setting in GitHub repository settings** is needed (the custom domain field in repository settings must remain empty).
   - GitHub Pages natively mounts the repository at `https://sivochka.com/<repo-name>/` with full automated SSL encryption.

---

## 2. Deploying to `https://github.com/Figarist/wearview`

### Step A: Repository Creation / Transfer
Either:
- **Option 1 (Transfer):** In `https://github.com/wristandpocket/wearview/settings`, scroll to the bottom (*Danger Zone*), click **Transfer ownership**, and set the new owner to **`Figarist`**.
- **Option 2 (Create directly):** Create a new repository at [https://github.com/new](https://github.com/new) with owner **`Figarist`** and name **`wearview`**.

### Step B: Push Code
From your local directory:
```bash
# Set origin to your user repository
git remote set-url origin https://github.com/Figarist/wearview.git

# Push master branch
git push -u origin master
```

### Step C: Enable GitHub Pages in Repository Settings
1. Go to **Settings > Pages** in `https://github.com/Figarist/wearview/settings/pages`.
2. Under **Build and deployment > Source**, select: **GitHub Actions**.
3. Ensure the **Custom domain** input is **EMPTY** (do NOT put `sivochka.com` or `wearview.sivochka.com` there).
4. GitHub Pages will automatically display the published URL:
   👉 **`https://sivochka.com/wearview/`**

---

## 3. Automated CI/CD Workflow (`.github/workflows/deploy.yml`)

The repository includes a GitHub Actions workflow that triggers automatically on every push to `master`:
1. Checks out repository.
2. Installs dependencies (`npm ci`).
3. Runs strict TypeScript type check (`npm run typecheck`).
4. Executes unit tests (`npm run test`).
5. Builds the production bundle (`npm run build`) with relative asset paths (`base: './'`).
6. Deploys the `dist/` directory directly to GitHub Pages.

---

## 4. Namecheap DNS Cleanup

Since project repositories under `Figarist` are served automatically at `sivochka.com/wearview/`, the `wearview` CNAME record in Namecheap is not needed and can be safely deleted.
