# Shared character library

Project-owned references live inside `projects/<project>/character-references/`. The central catalog is `character-library/cast.json`; shared renderer backups are in `character-library/shared/`. Version aliases such as Flying Dutchman v2/current resolve through `paths.mjs`. The studio loads the matching saved renderer when available, and new variants/sheets are saved to the owning project. Existing sheets are preserved unless the save tool receives `--refresh`.

Run `npm.cmd run characters` and open http://127.0.0.1:8787.

[`character-library/cast.json`](../character-library/cast.json) is the persistent source of truth displayed in the studio. Original approved renderer sources and project-specific design records live under `projects/<project>/character-references/original/`. The UI saves new variants without overwriting originals. Export/import transfers designs between checkouts. Young, middle-age and future inventors share an identity and seed. The completed video keeps its existing cast.

The shared `templates/bridge/character-rig.ts` uses our original `toon.ts` / `CharacterPen` renderer, preserving head seeds, authored proportions, glossy hair and lab coat details. It supports 12 directions at 30 degree steps, camera elevation -90 to +90, actions and the original expression library. The original identity, head seed and front body proportions stay preserved. The body uses projected vector contours. Hair and body use twelve authored direction keys in `templates/bridge/angle-designs.ts`, with contour interpolation between keys. Hair changes its scalp, temple and rear silhouettes rather than sliding a front drawing across the head. Torso widths, shoulders, costume visibility and rear seams follow the matching body keys. The preferred crown view remains active; the 3D mesh experiment remains inactive. Soft eye/brow/mouth shapes follow the saved facial preference. A shared two-leg gait projects the same foot trajectories at every angle, with planted stance feet, bent swing knees, heel/toe movement and opposing arm swing. There is no renderer switch at exactly 90/270 degrees. Scene travel must advance by `2 * walkCycle(...).stepLength` design units per full cycle to avoid foot sliding. The current default is a stylized vector character rig. The unused 3D hair experiment remains archived. Back views hide faces and front clothing details. Gaze, blink and chin movement are deterministic. Disable micro expressions for neutral model sheets.

Snapshot selected characters **before staging each new project**:

```
node character-library/snapshot.mjs projects/new-story bootstrap-young bootstrap-future
```

This copies the selected cast and exact rig source into the project's `characters/` directory. Existing snapshots cannot be overwritten; library changes cannot change an existing story.

Project integration:

```ts
import {drawCharacter, relativeView} from './characters/character-rig';
// The card can face the camera, while the drawing respects the actor's WORLD heading.
const yaw = relativeView(headingDegrees,camera.position.x,camera.position.z,actor.position.x,actor.position.z);
const distance = Math.hypot(camera.position.x-actor.position.x,camera.position.z-actor.position.z);
const pitch = Math.atan2(camera.position.y-(actor.position.y+1.25),distance)*180/Math.PI;
drawCharacter(context,design,{yaw,pitch,time:frame/30,action:'walk',expression:'nervous'});
```

Use 600×1000 design space (or scale the context). Feet are near y=975. Use timeline seconds, never wall-clock time. Include direction, pitch, action, expression and time in texture cache keys. Match walk cycles to world velocity and sitting to real seats. Review all 12 directions, both elevations and an action strip before staging.

Save and review the character-specific sheets with `node character-studio/save-turnarounds.mjs`. Each cast member gets a PNG and JSON under `projects/<project>/character-references/original/turnarounds/`, available through **Saved 12 angles** in the studio. Review intermediate turns and walking as well as the twelve still views.

## Archived project character code (opt-in only)

Each story's final character code is archived in `projects/<project>/character-references/final/`:
- `cast.json`: the full cast that story used.
- `engine/`: the exact rig (`projects/<project>/characters/`).
- `scene/`: the story's `src/characters.ts` and the `src/engine` helpers it imports.
- `manifest.json`: hashes plus `"reuse": "explicit-only"`.

These folders are git-tracked, even though the rest of `projects/` is ignored. Character Studio renders a project's characters with its `final/engine` rig when one exists. Run `node character-library/archive-project-code.mjs` after finishing a story. Existing archives are kept; pass `<project> --refresh` to replace one.

**Reuse policy:** archived and catalogued characters are storage, not defaults. A new short gets a fresh cast designed in the Studio and drawn with the current `templates/bridge` rig. Use a stored character, archived rig or `scene/` code only when the user explicitly names that project or character (for example "use Jack from zombie-humans"). Then snapshot only the named IDs with `snapshot.mjs`. Never copy a `final/` folder wholesale into a new project.
