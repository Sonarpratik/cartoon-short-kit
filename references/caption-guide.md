# Documentary caption (place / date / year card)

**User-approved default** (2026-11-13, "The Man Who Survived Two Atomic Bombs"): use this card whenever a short introduces a place, a date, a year span or a person's dates. Code: [`templates/overlays/doc-caption.ts`](../templates/overlays/doc-caption.ts). Example still (our own render): [`style-examples/doc-caption-hiroshima.jpg`](style-examples/doc-caption-hiroshima.jpg).

## Look
- **Title:** big white Arial Black, centred (`size` 86 default; 110–130 for a hero place name such as HIROSHIMA).
- **Small line above:** letter-spaced caps, 40 px bold Arial, 85 % white (e.g. `AUGUST 6, 1945 · 8:14 AM`, `NAGASAKI · AUGUST 9, 1945`, `TSUTOMU YAMAGUCHI`).
- **Thin white rule** under the title that draws out from the centre as the card fades in.
- Soft dark drop shadow (blur 26) so it reads over bright skies and sand without a box.
- Lower third by default (`y` ≈ 1500–1600 on 1080×1920). Move it to the top (`y` ≈ 330) when the face or action sits low.

## Motion
- **Typewriter:** the title types on letter by letter over `type` frames (14–20 for a word, 1 = instant for a hit on a beat).
- Fades in over 12 frames, fades out over the last 8.
- Optional slow push-in: `zoom: [1, 1.3]` across the card's life (used for "NAGASAKI" on the train).

## When to use
- First time a place is named (city, country, building).
- A date or time jump ("3 DAYS LATER" with the date in the small line).
- A life span ("1916 – 2010" with the name above).
- Two cards stacked (top and bottom) to state a pair, e.g. HIROSHIMA / NAGASAKI on "two atomic bombs".

Do not use it for dialogue or subtitles (those use the karaoke style in karaoke-guide.md), and keep it to one or two words of title.

## Usage
```ts
import { docCaption, drawDocCaption } from './overlays/doc-caption';
// in the HUD draw for frame f:
const c = docCaption(f, 100, 272, 'HIROSHIMA', { sub: 'AUGUST 6, 1945 · 8:14 AM', y: 1580, size: 110, type: 20 });
if (c) drawDocCaption(hudContext, c);
```
In the atomic-survivor project the same drawing lives in `src/hud.ts` (`kind: 'doc'` overlay) with `doc()` in `src/scenes/kit.ts`.
