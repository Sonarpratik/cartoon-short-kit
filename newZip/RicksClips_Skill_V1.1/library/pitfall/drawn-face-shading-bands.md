# pitfall: generated card shading puts shade bands on faces — HIGH (CB, GOLDRUSH v2 + LIGHTNING SPEAR, 2026-11-15)

**Symptom:** CB on goldrush v2: "shade on her face". On the spear hook frame CB had to say it twice (orange face rim,
horizontal streaks in hair).
**Cause:** the kit's generated card shading (card_shade amount / rim / far) draws light bands across the drawn faces.
**Fix:** card_shade amount 0, rim_amount 0, far off in every stretch. Goldrush forces it in the render wrapper
(`episodes/continue-goldrush-from-handoff-md-section-0f-bui/render_stretch.sh`), so a rebuilt film.json cannot bring it back.
The drawn face shadow stays (spear v2: castkit faceShadow, costume_shade.keep_drawn_light).
**Detect:** grep every film_s*.json and the wrapper for card_shade / rim_amount non-zero before a render; a face-crop strip of
each character per stretch before CB sees anything.
**Permanent rule:** CB_RULES 4 (no coloured light rim on a face, no horizontal hair streaks) and CB_RULES 5 (faces clean).
**Priority:** HIGH.
