# Breath Session Timer

Calm, single-screen timer app for practitioners who already know their practice and only need phase timing, posture reference, and ambient audio transitions.

## Legal & safety notes

- This app **does not teach breathing techniques**.
- Not affiliated with or endorsed by The Art of Living Foundation.
- Uses neutral phase labels only.
- Learn from a certified instructor.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `src/domain`: neutral session template model.
- `src/application`: reducer-based state machine.
- `src/components`: UI components (Orb, PostureCard, DisclaimerModal).
- `src/lib`: audio engine, local storage tracking, utilities.

## Add your own audio and posture assets

### Audio
Place your own royalty-free mp3 files in `public/audio/`:

- `phase1.mp3`
- `phase2.mp3`
- `phase3.mp3`
- `rest.mp3`

### Postures
Place or replace SVG files in `public/postures/`:

- `phase1.svg`
- `phase2.svg`
- `phase3.svg`
- `active.svg`
- `rest.svg`

## Notes for templates

Edit neutral timings in `src/domain/sessionTemplates.ts`. Keep labels generic (Phase 1..N) and avoid instructional language.
