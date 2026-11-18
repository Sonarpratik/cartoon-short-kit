# LOOK BIBLE: Why The Safest Tower Had A Spear On Top (owned by the lead; every helper reads it, none edits it; requests go to the lead)
v1 2026-11-15. Script: `SCRIPT.md` (23 rows, CB "confirm" 2026-11-15). Voice: `voice/voice.wav` + `voice/words.json` (Fish "rick"). Cast: `cast/` (sheet module, `cast/CAST_KEYS.json`). Plan: `PICTURE_PLAN.md` (every row is a must).
CB asked for this film: "visuals at max, many places, colors". So: 9 places, 8 lights, each a clearly different colour world.

## Story world: ONE connected world
A hill town in northern Italy, about 1765, no real name on screen. Two hills facing each other across a vineyard ridge and a white road.
- NEAR HILL: the hero's plain brown-stone church tower (tiled pyramid roof, the iron SPEAR on its peak, the iron WIRE down its wall into the earth), the church below it, the market square at its foot (fountain, arcade, yellow walls, red and white awnings, green shutters), the church yard behind (barn, well, dovecote, chicken coop).
- FAR HILL: the rival's taller WHITE MARBLE tower with a GOLD ANGEL on top, a wooden roof under the angel, the bronze storm bell in its arches, dark cypresses up a white road.
- BETWEEN: the vineyard ridge with one old tree.
Landmarks seen from every side, always in the same place: spear tower (near), white tower with angel (far), the ridge tree until it splits (row 13), after that its two burnt halves.
World X axis runs from the near hill to the far hill. Shared set files live in `episodes/lightning-spear/sets/` (ONE folder; never copy it): `world.js` holds the positions of the landmarks (the lead writes it; every set module imports them).

## Palette
- Base: terracotta orange roofs, warm yellow and cream walls, olive and vine green, deep blue sky. NOT beige, NOT grey.
- The hero's colours: TEAL waistcoat, MADDER RED cap. Nobody else wears teal.
- The rival's colours: WHITE and GOLD (tower, angel, his coat). Gold appears nowhere on the near hill.
- IRON is dark blue-black (spear, bracket, wire, staples), never brown, so it reads against sky and stone.
- The ONE loud accent of the film = the COLD BLUE-WHITE of lightning on iron (below). Fire orange is its opposite at the end.
- Numbers, ungraded (CB_RULES 11c): saturation at least 0.36 for the film and 0.30 by day; distance between light kinds at least 18; night frames never under mean brightness 0.31; faces white by day; darkest 1 % lifted to 0.08-0.15.

## SIGNATURE CONSTANT LIGHT
One cold blue-white glint on the iron spear tip (#bfe6ff, soft bloom, never clipped): a tiny spark at dusk (row 1), a cold drop in spring (row 12), the whole wire lit in the night (rows 17-19). It is the only cold light in the warm scenes and the brightest thing in the night ones.

## Light per chapter (the light follows the story clock; 8 kinds)
| Rows | Place | Light | Key | Fill | Notes |
|---|---|---|---|---|---|
| 1-3, | P1 roof, wall, P7 wire foot | A purple dusk before a storm | low orange sun from screen-left behind the camera side (#ffb46e), hard long shadows | violet sky fill (#9a86ea) | purple cloud wall with real volume, one pale far flash; peach horizon gap |
| 4-6 | P3 church inside | B candle | warm candles (#ffb347 cores, never clipped) from the altar side | deep red and blue bounce; dusk violet through the side door and the high window | gold altar, deep red cloth, blue ceiling with gold stars; dust in the door light |
| 7-8 | P4 rival hill, P5 bell chamber | C bright clear morning | high white-gold sun (#fff1d6), hard shadows | deep blue sky | marble near-white but not clipped; angel gold glints; bronze glows warm inside |
| 9 | P2 market | D golden noon | warm high sun | yellow wall bounce | striped awning shadows on the ground |
| 10-12 | P2 arcade, P1b church steps | E spring drizzle then sun | soft silver-green overcast, then one sunbeam | cool green-grey | pink blossom tree, wet stone shine, far pale flash |
| 13 | P6 vineyard ridge | F summer grey rain with fire | flat grey storm light plus the white bolt and orange fire of the tree | green bounce | rain in sheets, burning halves |
| 14 | P5 bell chamber | G flash light | white flashes through the arches on bronze and black | none between flashes: deep bronze-brown, readable | |
| 15-21 | P2 night, road, P8 sky, P1, P7, P4 | H blue night storm | cool blue moon-storm light, evenly lit and readable (mean at least 0.31), white bolts | lantern points warm | orange fire only on the marble tower's roof (row 21) |
| 22-23 | P9 church yard | A2 rose dawn after the storm | low rose-gold sun | washed blue | wet roofs shine; the sky behind the tower already turns purple for the loop |

## Faces and cast (CB 2026-11-15, binding)
- Faces clean white with only the template's own soft shade. NO coloured light rim on a face: `card_shade.rim_amount` 0 and no `far` light, in every place. The warm or blue light shows on costume, props and set.
- `"costume_shade": { "amount": 0.45, "start": 0.35, "cool": 0.15, "smooth": 40 }` (smooth removes horizontal streaks in hair). Copy the keys from `cast/CAST_KEYS.json`.
- Hands are round fists ON the object. No shoes. Nobody cut by a frame edge on a rest. Feet on a visible surface.

## Camera
Vertical 1080x1920, 30 fps. Camera at character height, at most 10 degrees down on a character; low looking up for the towers. Each place is one continuous take: fly, land, rest, fly on; places join through an object or an 8-12 frame blend. Faces and the named thing above the caption line (71.5 % of the height). Floor or roof at most a third of a wide. Something big and close in every frame (a tile ridge, a cypress, an awning pole, the bell rim).
Hook, frame 0: the Mason astride the roof peak, left fist on the spear, hammer swinging; storm wall behind; the rough frame is `pitch/hookA_rough/out/v3/f_00000.png` (known faults to fix: roof fills 40 % of the bottom, nothing says "church" on his own tower, sky has no cloud volume, legs crossed by a bracket stay).

## Air and effects (only from this story's world)
Dusk: swallows, chimney smoke bending in the first wind, dust motes. Church: candle flicker, dust in the door light. Rain: real sheets and splashes, drips from roof tiles. Night: bolts are branched light with a flash on the world, never white spaghetti; steam is soft volume; fire throws orange on the marble. Two particle layers per shot. Words in the world: short, hand-painted, from this story (a market stall sign, the bell founder's mark), no real names.

## Never
A real place or person's name. Gunpowder. Anyone hurt: the bell ringer is out and far away before the bolt (row 15), the Mason stands well back from the wire's foot (rows 17-19), nobody touches the wire in a storm. A modern object. Marble on fire (only the wooden roof burns).
