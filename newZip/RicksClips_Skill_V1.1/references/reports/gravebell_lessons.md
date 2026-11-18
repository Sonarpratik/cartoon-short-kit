# Grave Bell deconstruction — the craft laws we were missing (studied 2026-11-05)

Source: a walkthrough of how that episode was built + verification against our own 119 frames of it
(`references/frames/What the Grave Bell Really Meant*`). Method only — never the content.
Every item: HOW he does it / WHY it works / HOW WE do it / CREATIVITY GAP.

## 1. FACES CHANGE ON THE WORD  ← our biggest gap
HOW: ~49 expressions; the face swaps exactly on the word that earns it ("the wind" = smug lids /
"faster," = alarm / "dead." = flat grin / "she knows" = stillness). Verified frame by frame against
the burned-in captions.
WHY: the viewer reads feeling in a split second; the face is the second narrator. It is also what
makes a second watch pay (the wife already knows before the words say so).
WE: we have word timings (words.json) and ~35 expressions, but our acting plan is BEAT-level. New
required artifact per episode: an **EXPRESSION TRACK** — a word→(character, expression) map built
from words.json, so every swap is authored on a word, not a beat. Reaction lands 0-3 f before onset.
GAP: our two-speed law (1-frame swaps for reactions, 15-25 f arcs for feelings) is richer than his
on/off swaps — keep the word-locking, add arcs between the locked keys.

## 2. MOUTHS MOVE WITH THE VOICE
HOW: whenever the narration quotes a character, that character's mouth animates through the line.
WHY: it ties the picture to the voice continuously, not only at beats; silence looks dead.
WE: EP01 has two quoted lines ("I paid for a railroad — you built me a xylophone!", "wait for
summer"). Both MUST be mouth-animated across their word spans; a mouth channel driven by syllable
timing from words.json.
GAP: our characters can also "speak" with the body (the investor's trolley plinking under him).

## 3. SOUND LANDS ON ITS WORD, AND HAS A SIGNATURE RHYTHM
HOW: the bell rings on the word "rings"; its pattern is fixed and plot-bearing — three short, one
long — so the audience learns to read it.
WHY: a sound with a pattern becomes information, not texture; the payoff is recognition.
WE: our click is the same device. The click must hit on the word "click"; the rail heave on "snake";
the card slide on "card". The click pattern is our signature: an even 30-foot tick that spaces out
and quiets as the gaps close, then returns in October — the rhythm IS the thermometer.
GAP: his pattern is a code between two people; ours is a physical measurement the audience can hear
changing — a rhythm that tells the temperature.

## 4. SHOTS, NOT PANELS (11 shots → 33 framings)
HOW: inside one shot the camera flies through the set from framing to framing; it only CUTS when the
story jumps to a new place.
WHY: travel is the edit; it keeps the world continuous and the energy up (matches our measured
11.4 dissolves/min vs 0.6 cuts/min).
WE: our 15 beats are currently 15 separate framings. Regroup them into ~5-6 continuous SHOTS that
travel between framings, with hard cuts only at location jumps (flats → town → mine).
GAP: our object-carry dissolves can make even the location jumps feel travelled.

## 5. COLOUR TELLS YOU WHERE YOU ARE  (verified on the contact sheet)
HOW: each location owns a colour — amber-earth underground, blue-violet night street, candle-amber
bedroom, dark violet front room with a hot window, green daylight flashback, teal-pink sunrise.
WHY: one glance places the viewer; no establishing shot needed.
WE: we have TIME states (spring/august/october). Add PLACE identity on top: flats = ochre + hard blue
sky · mine = purple rock + orange ore scar · town = oxide red + cream. Each cut must land in a
different colour family from the one before it.
GAP: our story is a temperature story — place colour stays fixed while the heat state slides across
all three, so colour carries place AND season at once.

## 6. ONE SPOT-FROM-ACROSS-THE-ROOM DETAIL PER CHARACTER
HOW: nightcap + lantern (neighbour) · specs + white shirt (doctor) · teal dress + bun (wife) ·
orange hair (husband). Four named characters, no more.
WHY: each new face costs the viewer a second of "who is that".
WE: already our role-icon law. Count discipline is the new part: EP01 has 4 named + 2 crew types —
at the limit. Pip is the weakest (his gag was already cut); he is the trim candidate.

## 7. COMPOSITION WE DO NOT HAVE: THE CUTAWAY — *conditional, not automatic*
HOW: the grave is drawn in cross-section — coffin below the ground line, bell posts above, in ONE
frame; the mechanism and the reaction share the shot.
WHY: it works because the drama is genuinely HIDDEN — the audience cannot otherwise see the man and
the bell at the same time. The section is the only way to hold cause and effect in one frame.
WE: add CUTAWAY to the catalogue **with a trigger condition** (CB, 2026-11-05: "adapt the cutaway
only if it makes sense and matches the story"). Use it ONLY when the mechanism is concealed behind a
surface the camera cannot cross — underground, inside a machine or body, behind a wall, underwater.
**EP01 VERDICT: NOT USED.** Our mechanism (a gap closing between two rails) is fully visible from
above at macro; nothing is hidden, so a section through the ballast would add geology, not story.
The card refusing to enter already shows cause and effect in one frame.
GAP (for the episode that earns it): animate the section — the state travelling across the cut —
instead of holding it static.

## 7b. THE GENERAL LAW THIS PROVED
Every device adopted from the reference needs a **trigger condition** written beside it: the story
situation that earns it. A device used because the reference used it is decoration, and decoration
is the generic failure the anti-generic law exists to stop. When an episode has no beat that meets
the trigger, the device is not used that episode — and that is a pass, not a gap.

## 8. THE SOUND-OFF TEST  (adopt as a gate)
HOW: watch once with sound, once muted; with sound off every face must still tell the story. The
shot that fails is the first one to fix.
WE: new QA gate before any CB review, beside the measured checks (saturation, head size).
Also his check "is anything blocking the face the shot is about?" → added to render QA.

## 9. SCRIPT SHAPE (confirms ours)
Setup in one line · the turn (what is really going on) · the twist just before the end · ~60 s with
no idle second · the strangest picture in the first 2 seconds · every line must name a picture, or
the line gets rewritten · the twist must not be guessable at halfway.
EP01 check: hook = a man putting a playing card into a railroad ✓ strange · turn = "wait for summer"
· twist at 83 % ✓ · 63.9 s ✓ · every line boarded ✓.
