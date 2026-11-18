# pitfall: delivering without captions — HIGH (CB on ONODA, 2026-11-05)

**Symptom:** CB on ONODA: "is good but you forgot to put captions on it." The old skill rule said "no captions".
**Fix (standing rule, SKILL.md):** captions ON: one white bold word at a time with a black outline, centred at about
60-74 % of frame height (the measured reference style, references/reports/CONTEXT.md), timed to words.json word onsets.
Still no scene labels. Keep the faces the shot is about out of the caption band; mask the band before running any
measurement tool (the old camera census was fooled by an unmasked caption).
**Detect:** a final-QA check that the caption layer exists and that every word in words.json gets a card.
**Priority:** HIGH.
