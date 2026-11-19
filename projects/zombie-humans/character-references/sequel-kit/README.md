# Zombie Apocalypse Part 3 ("The Real Danger Is Humans"): sequel kit

Everything needed to make a sequel (Part 4) on another machine. Copied 2026-11-19 from
`projects/zombie-humans/`, whose working files are not in git.

| Folder | What it is |
|---|---|
| `project/` | Full project source: `src/` (scenes, world, props, player), `scripts/` (review, render, audio, finish), `work/` (PLAN.md, timing.json, fix scripts), `input/` (narration voice), `characters/` (cast.json + the rig used), `package.json`, `index.html` |
| `frames/v5_ALL_SCENES/` | The final approved review frames of every scene, in order, plus `000_OVERVIEW.jpg` |
| `frames/S01_v5 … S23_v5/` | The same final frames, one folder per scene |
| `frames/cast/` | Cast sheets |
| `out/` | Thumbnails, QA contact sheet, captions |

Not included (too large for git, and rebuilt from the code): the raw render frame cache (`frames/`, 737 MB),
`out/final.mp4` and the audio stems, `node_modules/`.

## Restore on another laptop

```sh
cp -r projects/zombie-humans/character-references/sequel-kit/project/* projects/zombie-humans/
cd projects/zombie-humans && npm install
npm run dev    # preview at http://127.0.0.1:8793
```

Note: Part 3 was drawn with the older 12-angle rig (`characters/character-rig.ts`). Cast: Jack (host),
Milo, Tina, Brock, Troy (stranger), Slade + raiders; see `project/work/PLAN.md`.
