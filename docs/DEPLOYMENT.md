# WearView — Deployment & Studio Cloud Hosting Guide

WearView is hosted on the official **Wrist & Pocket** studio infrastructure under the organization's verified domain:
👉 **`https://wristandpocket.dev/wearview/`**

---

## 1. Studio Infrastructure Architecture

- **Organization:** [wristandpocket](https://github.com/wristandpocket)
- **Repository:** `https://github.com/wristandpocket/wearview`
- **Studio Apex Site:** `https://github.com/wristandpocket/wristandpocket.github.io` (`https://wristandpocket.dev`)
- **Published Application URL:** **`https://wristandpocket.dev/wearview/`**

### Why this architecture is optimal for studio branding:
1. **Studio Promotion:** WearView serves as a flagship 3D developer utility directly under the `wristandpocket.dev` brand.
2. **Native Routing:** Because the organization owns `wristandpocket.dev`, any repository with GitHub Pages enabled under `wristandpocket` is automatically mounted at:
   👉 **`https://wristandpocket.dev/<repo-name>/`**
3. **Zero DNS Overhead:** No custom CNAME records or DNS provider edits are required. The entire subdomain/path routing is handled natively by GitHub Pages.

---

## 2. GitHub Pages Settings

In `https://github.com/wristandpocket/wearview/settings/pages`:

1. **Source:** `GitHub Actions`
2. **Custom domain:** **EMPTY** (Leave blank, or click **Remove** if anything was entered).
   *(Leaving it blank allows GitHub Pages to use the organization's default verified domain: `wristandpocket.dev/wearview/`).*
3. **Enforce HTTPS:** Enabled.

---

## 3. Automated CI/CD Workflow (`.github/workflows/deploy.yml`)

Every push to `master` triggers the GitHub Actions pipeline:
1. `npm ci` — Installs clean dependencies.
2. `npm run typecheck` — Strict TypeScript validation.
3. `npm run test` — Executes all Vitest unit tests.
4. `npm run build` — Compiles production bundle with relative asset paths (`base: './'`).
5. `actions/deploy-pages` — Deploys static bundle to GitHub Pages.

---

## 4. Local Git Remote Verification

Ensure the local repository is tracking the studio repository:
```bash
git remote -v
# origin  https://github.com/wristandpocket/wearview.git (fetch)
# origin  https://github.com/wristandpocket/wearview.git (push)
```
