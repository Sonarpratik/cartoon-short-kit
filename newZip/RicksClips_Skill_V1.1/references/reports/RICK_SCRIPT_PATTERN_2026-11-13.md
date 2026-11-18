# How Rick tells a story: all 23 scripts read and measured (lead, 2026-11-13)

Source: `references/video/<title>/*.txt` (23 scripts; the Drivers and Night Witches folders have no script file).
Method: every script read in full, then counted with a small Python pass (words, sentences, first sentence, where "You see" and "Wait" fall, tense).
This adds to SKILL.md "STORY, VOICE, TIMING AND CAMERA UPGRADES" point 2 (the mocker formula). Where it differs from that text, the difference is marked NEW. Nothing in SKILL.md was changed; a rule change needs CB's OK.

## Measured
| | Value |
|---|---|
| Words per script | median 220 (112 to 287) |
| Sentences | median 15, 12.4 words each |
| First sentence | median 14 words (5 to 25) |
| Opens on a person doing an act ("He / A man / They" + verb) | 14 of 23 |
| Opens on "you" or "if you" | 5 of 23 |
| Opens on a contradiction ("Gambling is illegal in Japan. Yet...") | 4 of 23 |
| Told in present tense after the first sentence | 16 of 23 |
| Uses "You see" | 16 of 23 |
| "You see" position | 6 times at 4-11 %, 10 times at 65-94 %, never between 12 and 64 % |
| "Wait, what?" from the viewer's side | 4 of 23, at 17-61 % |
| Named people | 3 invented first names (Jerry, Gary, Eddie), 1 real (Edison); no dates except "the 1700s" |

## Three families (NEW: the skill describes only the first)
(Sorted by my own reading; a few scripts sit between two families.)
1. **The laughed-at hero (7):** cart, storm oil, railroads, jar, mirror, pink cell, tickets. A strange act, a mocker, the reason hidden, proof at the end.
2. **The trick with a last-line twist (7):** knight, grave bell, burglar, cashiers, spear and shield, memory shop, button town. The last sentence says who was really fooled.
3. **The "you" explainer (9):** slots, second draw, Japan job, pachinko window, painkillers, random numbers, idea zone, time test, cannonballs. One everyday picture carries the whole explanation.
Also NEW: 3 of the 23 are pure fiction (memory shop, button town, furniture burglar) and 1 is an old paradox tale (spear and shield). He does not only tell true stories.

## Findings: how, why, how we do it, and our gap
1. **The first sentence is the whole strange act.** How: doer + verb + object + one odd exact detail (82 holes, every 39 ft, one inch to the left, one pint of red). Why: the viewer has a picture and a question before second 3. Ours: line 1 of every script passes the test "can frame 0 be drawn from this sentence alone". NEW: his first line runs 5-25 words, median 14, longer than the skill's 9-14.
2. **Past tense for one sentence, then present.** How: "He drilled 82 holes because down the hill an army IS marching." Why: the story feels like it is happening now. Ours: writer switches to present from sentence 2.
3. **The thing is described, not named.** How: "something long and thin wrapped in paper, each with a string"; the word rocket comes at the payoff. Why: the viewer guesses along. Ours: the hero object is built on screen step by step while the narration never says its name until the reveal.
4. **A mocker with one joke.** How: a doubter says a 4-12 word joke to the hero's face ("Are we fighting them or grating cheese?"). Why: the viewer's doubt gets a voice, and the payoff lands on that person. Ours: one mocker per film, with a personality profile.
5. **A rule with a number makes the clock.** How: "exactly 15 minutes", "nobody's allowed to touch", "never draw first", "30 seconds". Why: a rule can be broken on screen, and the break is the turn. Ours: each script names its rule in the beat list.
6. **Escalation in dated steps.** How: "In May a coin fits. By July, barely a sheet of paper." Why: change you can see and count. Ours: three steps, each with a prop state in PROP_STATES.md.
7. **"You see" has two jobs.** NEW. How: right after the hook (4-11 %) it explains the WORLD; near the end (65-94 %) it explains the TRICK. Never in the middle. Why: the middle belongs to the action. Ours: the skill says "once at 60-85 %"; a story that needs its world explained may use the early one instead.
8. **One household picture explains the mechanism.** How: soup you blow on, a phone sliding off a table, lift buttons, smoke alarms in a house. Why: the viewer has done it with their own hands. Ours: one analogy per film, staged in the story's own period.
9. **The last line is the answer, then nothing.** How: no moral, no summary; five scripts stop mid-sentence so the loop finishes the line. Why: the viewer stays for the replay. Ours: last frame = first frame, last words lead into the first.
10. **True stories are told as fables.** How: "a scientist", "the emperor", "his captain"; no names, no years, no places. Why: nothing to remember but the act. Ours: the narration carries no real names or dates; the facts live in sources.md and in the set details.

## What he has never done (our creativity gap)
Of 23 films: 6 are about money or gambling, 4 about rules and loopholes, 4 about the brain or body, 3 about weapons. None has an animal as the hero, a woman or a child as the hero, food, medicine, a building or machine that must not fall, music or sound, or space. Every hero is "he".

## Ideas written in his pattern (facts from memory: fact check before any script)
Family 1, the laughed-at hero:
1. **The Man Who Cut His Own Rope** (New York, 1854). "He stood on a platform high above a crowd and told his helper to cut the only rope holding it." Hidden: the spring under his feet. You see: when the rope goes slack, a spring snaps two catches into toothed rails. Result: buildings could grow taller than five floors.
2. **Why the Planes Needed Armor Where Nobody Shot Them** (World War II). "He told the generals to put armor on the only parts of the plane that had no bullet holes." Mocker: "So we protect the spots nobody hits?" You see: they had only counted the planes that came back.
3. **The Doctor Who Stole a Pump Handle** (London, 1854). "He took the handle off the street's water pump so nobody could drink." Comic aside: the brewery workers next door, who drank only beer, stayed healthy. You see: every sick house fetched water from that pump.
4. **The Vegetable Nobody Wanted Until It Was Guarded** (France, 1780s; told as tradition). "He put armed guards around a field of vegetables nobody would eat." Twist: the guards went home at night on purpose.
Family 2, the con with a last-line twist:
5. **The City That Paid for Rat Tails** (Hanoi, 1902). "He snipped the tail off a live rat and let it run back into the sewer." Twist: paid per tail, people farmed rats.
6. **The Most Famous Front Door in London** (1810). "He posted thousands of letters, and every one ordered something to the same front door." Escalation: twelve chimney sweeps, then coal carts, pianos and wedding cakes, then the Lord Mayor. Last line: he is watching from the window across the street, and he just won a one-guinea bet.
Family 3, the "you" explainer:
7. **The Traffic Jam With Nothing at the Front.** "You sat in a traffic jam for an hour, and when you got to the front, there was nothing there." Household picture: one person in a walking line stops to tie a shoe.
Original fiction (his Button and Memory lane, our own story):
8. **The Bridge That Charged One Secret.** "To cross this bridge you don't pay a coin, you whisper one secret to the toll keeper." Escalation: the queue grows, the king fears a man who knows everything and sends soldiers. Last line: the river is ankle-deep fifty steps downstream; nobody ever needed the bridge.
In production: Project Pigeon, the first film here with an animal as the laughed-at hero.
