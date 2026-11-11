# Our saved characters

The global Character Studio at http://127.0.0.1:8787 reads **cast.json** here. Start it with `npm.cmd run characters`.

Each original project gets a folder containing its design definitions and approved renderer source. These are our own characters from the video, not the private reference images and not replacement designs. Save new variants through the UI; reuse a saved design by exporting it or creating a project snapshot with `character-library/snapshot.mjs`.

`bootstrap-paradox/` preserves the original inventor actor and the exact engine sources from the completed video. `designs.json` records the young, middle-age and future variants. Shared `templates/bridge/character-rig.ts` extends the same authored characters for the studio's views/actions. An existing project's sources and exported video remain independent of later studio changes.

`shared/` preserves the checked current motion renderer, including rotating hair occlusion, depth-aware shoulders/arms, crown hair for top views, and the shared walk cycle for 30°, 60° and side views. Run `node character-library/preserve-shared.mjs` after checking a shared motion change to refresh that copy and its source hashes. The studio serves the working renderer in `templates/bridge/`; the cast definitions come from this folder.

The current revision restores the previous authored hair animation at the user's request, keeping the softer rounded eye/brow/mouth shapes and body/walk fixes. The 3D hair files remain inactive experimental assets. `shared/studio-cast.png` shows this revised cast; `bootstrap-paradox/approved-cast.png` preserves the original completed-video design. Both can be opened from the studio header.
