# WearView — Deployment & Cloud Infrastructure Guide

This guide describes how WearView is deployed to the cloud under the **Wrist & Pocket** GitHub organization and connected to the custom domain **sivochka.com**.

---

## 1. Cloud Architecture & Infrastructure Principles

In accordance with WearView's strict architectural principles:
- **Zero Backend / Serverless:** WearView is a 100% static client-side Single Page Application (SPA).
- **Client-Side Privacy:** Screenshots uploaded by developers never leave browser memory.
- **Hosting Provider:** GitHub Pages with GitHub Actions CI/CD hosted exclusively on the **Wrist & Pocket** organization (`https://github.com/wristandpocket`).
- **CDN & Edge Delivery:** Distributed globally via GitHub Pages CDN with HTTP/2 and automated SSL/TLS encryption.

---

## 2. GitHub Organization Repository Setup

1. **Organization:** [wristandpocket](https://github.com/wristandpocket)
2. **Repository Name:** `wearview`
3. **Target Remote URL:** `https://github.com/wristandpocket/wearview.git`

### Initial Repository Creation (if not yet created):
1. Navigate to: [Create New Repository in Wrist & Pocket](https://github.com/organizations/wristandpocket/repositories/new)
2. Set **Repository name** to `wearview`.
3. Set visibility to **Public** (or **Private** with GitHub Pages enabled).
4. Do **not** initialize with README, .gitignore, or license (the repository already has these files locally).
5. Click **Create repository**.

### Pushing Code to Cloud:
From the local repository root (`c:\Users\igors\Documents\GitHub\wearview`):
```bash
# Verify remote is configured
git remote -v
# Output should show:
# origin  https://github.com/wristandpocket/wearview.git (fetch)
# origin  https://github.com/wristandpocket/wearview.git (push)

# Push master branch to origin
git push -u origin master
```

---

## 3. Automated CI/CD Workflow (`.github/workflows/deploy.yml`)

The repository includes a GitHub Actions workflow that triggers automatically on every push to `master`:
1. Checks out the code.
2. Installs dependencies using `npm ci`.
3. Runs strict TypeScript type checking (`npm run typecheck`).
4. Executes all Vitest unit tests (`npm run test`).
5. Builds the production bundle (`npm run build`).
6. Deploys the `dist/` directory to GitHub Pages.

---

## 4. Connecting to Domain `sivochka.com`

WearView is configured to connect to the custom domain **`sivochka.com`** via the dedicated subdomain:
**`wearview.sivochka.com`**

### Step A: DNS Configuration (in your DNS registrar / Cloudflare):
Add a CNAME record to the DNS zone for `sivochka.com`:

| Type | Name / Host | Target / Value | TTL | Proxy Status |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `wearview` | `wristandpocket.github.io.` | Auto / 300 | DNS Only (or Proxied) |

### Step B: GitHub Pages Settings:
1. In the repository on GitHub, open **Settings** > **Pages**.
2. Under **Build and deployment**, ensure **Source** is set to **GitHub Actions**.
3. Under **Custom domain**, enter: `wearview.sivochka.com`.
4. Click **Save**.
5. Once DNS resolves (usually 1–5 minutes), check **Enforce HTTPS**.

*(Note: The repository includes `public/CNAME` containing `wearview.sivochka.com`, which ensures every automated build automatically preserves this custom domain in the published bundle).*

---

## 5. Portal Integration on `sivochka.com`

To allow visitors of your central developer hub `sivochka.com` to discover WearView, an explore card is added to the Bento grid linking directly to `https://wearview.sivochka.com/`.
