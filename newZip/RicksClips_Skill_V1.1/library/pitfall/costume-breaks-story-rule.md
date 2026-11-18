# pitfall: an extra's costume makes him read as the hero and breaks the story's rule — MED (earned GOLDRUSH, 2026-11-15)

**Symptom:** a top-hat extra in the digging line read as the hero digging, which contradicts the story's rule (the hero
does not dig).
**Cause:** the cast was checked only against the period (is a top hat right for the decade?), not against the story's rules
(which silhouettes belong to which role).
**Fix:** costume check against the story's rules as well as the period: the hero's signature piece (here the top hat) is never
worn by an extra; extras doing what the hero never does get clearly different silhouettes.
**Detect:** list each role's signature pieces (hat, colour, neckwear) in the cast sheet; before a board or render, grep every
film.json extra for the hero's signature preset/hat key in scenes where the script says the hero is absent or does not act.
**Priority:** MED.
