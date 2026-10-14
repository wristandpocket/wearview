# WearView — Agent Operating Guidelines

This repository follows strict architectural principles. When making changes or introducing new features in future agent sessions, adhere to the following rules:

---

## 1. Core Principles

1. **KISS First:** Only implement features that directly empower a developer to inspect a Wear OS screen. Avoid fluff, marketing templates, or mock configurators.
2. **Local-First & Zero Telemetry:** Image processing occurs purely on client memory. Never introduce cloud uploads, analytics, backend services, or external asset dependencies.
3. **Exact-Generation Device Identity:**
   - Do NOT mix device generations or substitute newer specs for older models (e.g. Pixel Watch 1 is 41 mm with wide bezels, not Pixel Watch 2 or 3).
   - Maintain manufacturer-confirmed dimensions vs estimates clearly in `docs/DEVICE_RESEARCH.md`.
4. **No Invented Measurements:**
   - When a physical dimension is unconfirmed, record it as an estimation with clear rationale.
   - Separate 3D scene units ($1\text{ unit} = 1\text{ mm}$) from camera zoom and monitor pixel density.
5. **Screen Readability Over Effects:**
   - Front glass reflections must enhance physical believability without obscuring the game UI.
   - Screen content uses emissive/basic shading with tone mapping to preserve author RGB values.

---

## 2. Verification Protocol

Before declaring any task or phase complete:
- Run `npm.cmd run typecheck` — Must pass with 0 errors under strict TypeScript.
- Run `npm.cmd run test` — All unit tests must pass.
- Run `npm.cmd run build` — Production Vite bundle must build cleanly.
- Verify running behavior using browser/dev server tooling when available.
- Update `docs/QA_CHECKLIST.md` honestly with exact pass/fail outcomes.

---

## 3. Working with PowerShell on Windows

- On this environment, PowerShell execution policy may restrict `.ps1` wrappers.
- Always use `npm.cmd` or `npx.cmd` rather than raw `npm` / `npx` in shell invocations.
