# Contributing to WearView

Thanks for helping Wear OS developers preview their screens.

## Ground rules

Read [AGENTS.md](AGENTS.md) first. In short:

- Keep it a developer inspection tool. No marketing templates or decorative features.
- Local-first: no uploads, analytics, backends or third-party asset hosts.
- Device geometry must come from published specs. Estimates go into
  [docs/DEVICE_RESEARCH.md](docs/DEVICE_RESEARCH.md), marked as estimates with their rationale.

## Workflow

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # strict TypeScript, must be 0 errors
npm run test       # Vitest, must be all green
npm run build      # production bundle must build cleanly
```

New behaviour needs a unit test where it can be tested without WebGL (geometry, math, parsing, state).
For UI changes, describe how you checked them in a browser.

## Adding a watch

1. Add the spec and builder in `src/devices/` (pick the closest archetype).
2. Record sources and estimates in `docs/DEVICE_RESEARCH.md`.
3. `src/devices/devices.test.ts` and `src/viewer/viewerInvariants.test.ts` iterate over every device, so the new
   one is checked for frame visibility and real-size math automatically.
