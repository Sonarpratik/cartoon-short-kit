# CASTING: Armor Where Nobody Shot (character-artist, 2026-11-13)

Sheet: `cast/sheets/armor.mjs` (library calls only). film.json block: `cast/cast.json` (`puppet_pkg`, `cast`, `faces_ep`, `costume_shade`). Picture for CB: `cast/CAST_SHEET.png`. Presets: `cast/PRESETS.md`. Faces and poses: `cast/FACES_POSES.md`.
Kit: three locked body sizes, 500-outfit library through `dress()`, hair_lib, head_wear, head_gear, face_gear. Short costumes only. Clean bible look, no texture or line finish. Period: early 1940s airfield, no place, no real unit, no rank set, no real badge.

## Who is who
| name in film.json | role | body, height | trait line (reads with no words) | hair, head, face gear | outfit (library base, recoloured) |
|---|---|---|---|---|---|
| `mathematician` (`mathematician_bare` = hat off) | hero | thin, 1.50 m | the one small, tidy, cool-grey city man among big olive men; three red pins in his lapel | `sidePart` sandy; `fedora` slate (library feather left off); `roundGlasses`; clean-shaven | `threePiece`: slate suit with a fine chalk stripe, darker waistcoat, white shirt, mustard tie, white pocket square |
| `chief` | the mocker | fat, 1.85 m | twice the hero's width, cap pushed back, big ginger moustache, chalk on his hip | `buzz` dark; `capBack` dark olive; `handlebar` ginger, above the mouth | `mechanic`: olive coverall, tan undershirt at the neck, brass zip, flap pocket, team patch, oiled leather belt |
| `rivets` | ground crew, apprentice | thin, 1.68 m | young, freckled, fatigue hat too big for him, tool belt | `curlyCrop` light brown; `bucket` hat olive (the period mechanics' fatigue hat); `freckles` | `workShirt`: khaki shirt, olive trousers, flap pocket, team patch, leather tool belt with pouches |
| `ladder` | ground crew, old hand | standard, 1.80 m | bald with grey tufts, a straw in his mouth, brown bib front | `baldTufts` grey; no hat; `wheat` straw | `factory`: faded olive shirt, oiled-brown bib with brass buttons, khaki neckerchief |
| `colonel` (`colonel_bare` = cap in hand) | officer | standard, 1.82 m | straight, silver-haired, peaked cap, wide pale-grey moustache, brass buttons | `slickBack` silver; `police` cap in olive-brown; `bushy` moustache pale grey; `mole` | `airForce`: olive-brown tunic over a tan shirt, dark tie, brass buttons, shoulder straps, two flap pockets, cloth belt; no ribbons, no rank, no badge |
| `adjutant` | officer's clerk | thin, 1.72 m | neat, black bowl cut with a cowlick, shirt and tie, pencil cord | `cowlick` black; no hat; no face gear | `ww2Soldier`: pale tan shirt, dark brown tie, two flap pockets, olive-brown trousers, leather belt; no helmet, no webbing, no weapon |
| `flyer1` .. `flyer8` | background flyers | mixed (4 standard, 2 fat, 2 thin), 1.70-1.85 m | leather and fleece, flying caps with goggles, parachute webbing | `pilot` flying cap (1, 3, 5, 7) or bare `sidePart`, `slickBack`, `flattop`, `curlyCrop`; one short beard, one stubble | `bomberPilot` (leather jacket, fleece collar, brass zip, flap pockets, team patch; three wear the library `straps` as parachute webbing) and `bomber` (olive cloth flight jacket, knit collar) |

## Outfit colours and the scene colour each comes from (LOOK_BIBLE.md "Palette")
| colour | hex | where it is worn | scene colour it comes from |
|---|---|---|---|
| slate grey | `#7b8794`, dark `#636e7c` | the Mathematician's suit, waistcoat and fedora, nobody else | "the only cool slate grey in a warm world" |
| pin red | `#d6262b` | the three lapel pins, nothing else on any character (measured: 0 loud red pixels on the other 14 drawings) | the ONE loud accent, the map pins |
| mustard | `#c79a2c` | his tie | brass family |
| olive drab | `#6f733c`, dark `#55592e`, faded `#8d8f5e` | the ground crew: the Chief's coverall and cap, Rivets's hat and trousers, Ladder's shirt; cloth flight jackets | the bombers' warm olive |
| khaki, tan | `#b7a36b`, `#cdb98c` | khaki: Rivets's shirt, Ladder's neckerchief, parachute webbing; tan: the Adjutant's and the Colonel's shirts, the Chief's undershirt | khaki of the palette, warm concrete |
| oiled brown | `#6e4a2c`, `#4a2f1a`, leather `#6e4527`, `#7e5537` | belts, tool belt, Ladder's bib, the flyers' jackets | oiled brown of the palette |
| officer olive-brown | `#6a5c3a` | the officers: the Colonel's tunic and cap, the Adjutant's trousers | between the olive and the brown |
| brass | `#c9a13a` | zips, buckles, buttons, cap badge | brass of the palette |
| chalk white | `#f4f2ec` | the Chief's handprint | the chalk rings on the bomber |
| team blue and yellow | `#2f5fa8`, `#f2c230` | the chest patch of the Chief, Rivets and every flyer | "yellow boomerang on a blue disc" |
| hair | sandy `#c9a769`, ginger `#c8642a`, light brown `#a9773f`, grey `#b9b4ac`, silver `#aeaaa6`, black `#2c2428` | one hair colour per speaking character | warm browns of the palette; no two leads share one |

## Colour groups (who belongs to whom, with no words)
Hero = slate grey (alone). Ground crew = olive and khaki. Officers = tan and olive-brown. Flyers = leather brown with fleece. The team patch (blue disc) is worn by the ground crew and the flyers, not by the officers or the hero.

## Choices that differ from CAST_TRAITS.md (nearest library item, and why)
- Rivets's `cap` does not exist as a plain straight cap: the library `baseball` cap carries a red letter on a white disc. Used the `bucket` hat in olive (the fatigue hat mechanics wore), which also gives him his own silhouette.
- The Colonel's `officer` cap is the library `police` cap recoloured olive-brown. The crown crushed on the LEFT side cannot be drawn: the hat has no such option (library add, lead's OK).
- The Colonel's moustache: the lead ruled out a small dark clipped one under a peaked cap (too close to a real dictator's look). He now has the wide pale-grey `bushy` moustache and silver hair. The `walrus` was tried and hides the mouth.
- Signatures that the library cannot draw as written: Rivets's oil thumbprint is `freckles`; Ladder's matchstick is the `wheat` straw (it points the way he faces); the Adjutant's pencil on a neck string is a pale cord looped from his shirt front into his LEFT breast pocket (library part `chain`); the Colonel's is the `mole` (beauty spot, LEFT cheek).
- The Adjutant's hair is black, not fair: fair sat too close to the Mathematician's sandy hair when the two stand at the map wall.
- The team mark on the chest is a blue disc with a yellow bent bolt: the library has no boomerang emblem, and its `moon` emblem draws as a thin line.
- Library fixed colours that this palette forbids were left out by re-ordering library parts (same `dress()` call, recipe objects in the sheet): wine tie and wine pocket square (`threePiece`), red disc badge (`bomberPilot`), red, blue and green medal ribbons and star (`airForce`), blue pocket (`mechanic`), grey collar (`factory`), orange lining (`bomber`), webbing and tool belt (`ww2Soldier`). The fedora's red feather is filtered off the locked drawing.

## Line-up stills
- Neutral warm ground, all six at relative heights, four views of the Mathematician and the Chief, black-fill silhouettes, the eight flyers: `cast/CAST_SHEET.png`.
- In the film kit (demo `platform` set, front, 3/4, side, back, faces and motion-library poses): `crew/character_artist/stills/kit_test_sheet.png`.
- In each place of this film: NOT made yet. `sets/airfield.js` does not exist at the time of writing; the line-up in `apron`, `hangar`, `row_dusk` and `hangar_night` follows as soon as the set-builder delivers.
