# Why The Safest Tower Had A Spear On Top: the mix.        Run:  python mix.py [version]        default v1
# One command: cuts any missing clip from CB's library (clipdefs.py -> clips/), places every cue on its word from
# ../voice/words.json, lays one ambience bed per place, the one theme (statement / change / return), masters to
# -14 LUFS integrated with true peak below -1 dBTP, measures with ffmpeg ebur128, writes CUE_SHEET.md, out/mix_<v>.wav,
# out/mix_<v>_preview.mp3, out/stems/, out/measure.json. The voice is never re-timed (resampled 44.1 -> 48 kHz, high-passed, levelled).
# If the picture moves: change the anchor word or the frame offset of a cue below and run again. Pattern: episodes/armor-no-holes/sound/mix.py.
import os, sys, io, json, re, subprocess, math, unicodedata
import numpy as np, soundfile as sf
from scipy import signal, ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import clipdefs as C
SR = C.SR; EP = os.path.dirname(HERE); FPS = 30; FRAMES = 2140
VER = sys.argv[1] if len(sys.argv) > 1 else 'v1'
OUT = os.path.join(HERE, 'out'); os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
TARGET_I, CEIL_TP = -14.0, -1.3          # master target; the limiter ceiling sits 0.35 dB under CEIL_TP so the measured true peak stays below -1 dBTP
VOICE_RMS = -20.0                        # dBFS while speaking, before the master
MUS_UNDER, MUS_GAP = -15.0, -11.0        # music relative to the voice: under speech / in gaps and the end hold
AMB_DUCK, AMB_TRIM = 3.0, 0.0            # beds step back 3 dB under speech; bed layer levels are RMS dBFS (each bed clip is RMS-normalised first)
def log(*a): print(*a, flush=True)
def db(x): return 20 * np.log10(max(float(x), 1e-12))
def lin(d): return 10 ** (d / 20.)
def rms(x): return float(np.sqrt(np.mean(np.square(x)) + 1e-20))
def ff(args): return subprocess.run(['ffmpeg', '-hide_banner', '-nostats'] + args, capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
def ebur(path):
    s = ff(['-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-']); s = s[s.rindex('Summary:'):]
    return dict(I=float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), LRA=float(re.search(r'LRA:\s+(-?[\d.]+) LU', s).group(1)), TP=float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1)))

# ------------------------------------------------------------------ words
WORDS = json.load(io.open(os.path.join(EP, 'voice', 'words.json'), encoding='utf-8'))
def norm(w): return re.sub(r'[^a-z\']', '', unicodedata.normalize('NFKD', w.lower()).replace('\u2019', "'"))
def word(w, near, edge='s'):
    """time (s) of the occurrence of word w closest to `near` seconds; edge 's' start / 'e' end"""
    c = [x for x in WORDS if norm(x['w']) == norm(w)]
    assert c, 'word not in words.json: ' + w
    x = min(c, key=lambda x: abs(x['s'] - near)); assert abs(x['s'] - near) < 1.0, 'word %s not near %.2f' % (w, near)
    return x[edge]

# ------------------------------------------------------------------ THE CUE SHEET (source of CUE_SHEET.md)
# (plan row, anchor word, near s, edge, offset frames, clip, dB (peak-normalised clip), pan -1..1, what it is and why)
# optional 7th..: dict(len=seconds, rate=x) -> len cuts a long clip with a fade
Q = [
 # S1 hook: roof, wall, wire foot, purple dusk
 ('1', 'nailed', .18, 's', -5, 'whip_small', -26, .1, 'the hammer swings down (frame 0 is mid-swing; the swing starts in the loop hold)'),
 ('1', 'nailed', .18, 's', 0, 'anvil_hit', -13, .1, 'HAMMER HIT on the iron bracket, on "nailed"'),
 ('1', 'nailed', .18, 's', 1, 'arc_short', -25, .1, 'the one cold spark jumps off the hit'),
 ('1', 'iron', .66, 's', 0, 'anvil_ting', -24, .1, 'second, lighter hammer tap seats the bracket'),
 ('1', 'top', 1.60, 's', -6, 'wood_bang', -29, -.6, 'shutter 1 slams down the street below'),
 ('1', 'of', 1.82, 's', 2, 'wood_bang2', -30, .4, 'shutter 2 slams'),
 ('1', 'church', 2.10, 's', 2, 'door_bang', -31, -.2, 'shutter 3 slams, further away'),
 ('2', 'spear', .92, 's', 2, 'glint', -21, 0, 'SIGNATURE GLINT born: the cold point on the forged tip'),
 ('3', 'tower', 2.32, 's', 1, 'wings', -24, .3, 'swallows scatter from the belfry'),
 ('3', 'tower', 2.32, 's', 9, 'chirp', -28, -.3, 'swallow call as they wheel off'),
 ('4', 'terrified', 3.34, 's', 1, 'whip_small', -30, -.5, 'a line of washing yanked in through a window'),
 ('4', 'of', 3.86, 's', 2, 'door_bang', -33, .5, 'a door pulled shut on a child'),
 ('4', 'lightning', 4.16, 's', 6, 'thunder_far', -25, 0, 'far rumble after the pale flash inside the cloud'),
 ('5', 'ran', 5.14, 's', 0, 'wire_crank', -27, .2, 'the wire runs off the coil'),
 ('5', 'wire', 5.72, 's', 1, 'tick_metal', -21, .1, 'wire hooked into the bracket eye'),
 ('6', 'down', 7.30, 's', 0, 'rope_slide', -24, 0, 'he rides down the wall on the rope'),
 ('6', 'down', 7.30, 's', 2, 'anvil_ting', -22, .2, 'STAPLE hammered, storey 1'),
 ('6', 'wall', 7.62, 's', 3, 'anvil_ting', -23, .1, 'staple, storey 2', dict(rate=.94)),
 ('6', 'and', 7.90, 's', 4, 'anvil_ting', -24, 0, 'staple, storey 3', dict(rate=.88)),
 ('6', 'into', 8.16, 's', 5, 'anvil_ting', -25, -.1, 'staple, storey 4', dict(rate=.83)),
 ('7', 'mud', 8.64, 's', 0, 'mud_push', -15, 0, 'WIRE PUSHED INTO THE MUD, on "mud"'),
 ('7', 'mud', 8.64, 's', 9, 'mud_stamp', -18, 0, 'his foot stamps it in'),
 ('7', 'mud', 8.64, 's', 12, 'drip', -27, .3, 'the puddle shivers'),
 ('7', 'mud', 8.64, 'e', 2, 'cluck', -28, .5, 'the white hen walks up and stares (set-up for row 31)'),
 # S2 church inside
 ('8', 'fat', 9.20, 's', 0, 'step_soft', -31, -.3, 'the Priest trots down the nave'),
 ('8', 'priest', 9.44, 's', 2, 'step_soft', -31, -.1, 'step'),
 ('8', 'who', 9.74, 's', 2, 'step_soft', -32, .1, 'step'),
 ('8', 'priest', 9.44, 's', 3, 'flame', -26, 0, 'CANDLES: flames lean as he passes'),
 ('8', 'the', 10.18, 's', 3, 'flame', -29, .3, 'a second row of candles leans'),
 ('9', 'pale', 11.08, 's', 0, 'mallets_desc', -25, 0, 'the colour drains from his face like a glass emptying'),
 ('9', 'pale', 11.08, 'e', 2, 'rosary', -24, -.1, 'both fists grab the rosary'),
 ('10', 'lightning', 12.36, 's', 1, 'flame', -25, .2, 'the candle he shields ducks'),
 ('11', "wouldn't", 14.30, 's', 1, 'twang', -21, .2, 'the Mason tugs the wire: it twangs'),
 ('11', 'down', 15.00, 's', 4, 'glint', -29, 0, 'the spear far above answers with a tiny ring'),
 ('11', 'down', 15.00, 'e', 0, 'step_soft', -31, .3, 'he walks out into the dusk'),
 # S3 rival hill, bell chamber, morning
 ('12', 'other', 15.74, 's', -4, 'whoosh_a', -27, -.2, 'camera flies up the white tower'),
 ('13', 'white', 18.32, 's', 0, 'pulley', -24, .3, 'the rope crane hauls the gold angel up'),
 ('13', 'angel', 19.46, 's', 0, 'metal_seat', -17, 0, 'THE ANGEL SEATS on the peak, on "angel"'),
 ('13', 'angel', 19.46, 's', 1, 'sparkle_gold', -23, .2, 'the angel flashes gold as it seats'),
 ('13', 'angel', 19.46, 'e', 2, 'cheer_far', -26, -.2, 'the hill cheers, the Rival bows'),
 ('14', 'bell', 21.08, 's', 0, 'bell_tap', -18, 0, 'the Ringer TAPS the bell with a knuckle', dict(len=1.8)),
 ('14', 'bell', 21.08, 's', 2, 'bell_hum', -20, 0, 'the HUM of the biggest bell', dict(len=2.4)),
 ('14', 'land', 21.62, 's', 4, 'whoosh_short', -25, .3, 'the hum blows his cap off'),
 # S4 market, noon then spring drizzle
 ('15', 'laughed', 22.78, 's', 0, 'laugh', -20, -.4, 'THE MARKET LAUGHS: man by the stall'),
 ('15', 'laughed', 22.78, 's', 3, 'laugh_hard', -23, .45, 'a woman doubles over'),
 ('15', 'laughed', 22.78, 's', 7, 'laugh_silly', -24, .1, 'one more silly laugh on its own beat'),
 ('15', 'toothpick', 23.54, 's', 0, 'pop', -19, 0, 'the olive on its toothpick lines up with the far spear'),
 ('16', 'climbed', 24.68, 's', 0, 'crowd_walk', -23, .3, 'the whole market streams out up the white road'),
 ('16', 'hill', 25.42, 's', 4, 'orange_bounce', -22, -.2, 'one dropped orange lands'),
 ('16', 'hill', 25.42, 's', 7, 'orange_roll', -25, -.1, 'and rolls to the Mason\'s foot'),
 ('17', 'storms', 26.34, 's', -6, 'whoosh_a', -25, 0, 'time pass: noon to spring'),
 ('17', 'came', 26.68, 's', 1, 'thunder_far', -24, -.3, 'THE STORMS CAME: far roll over the plain'),
 ('17', 'spring', 27.58, 's', 0, 'drip', -25, .3, 'drizzle begins on the fountain'),
 ('18', 'thunder', 30.58, 's', 2, 'thunder_far', -21, .2, 'TEN seconds after the flash: a soft far rumble, everybody breathes out'),
 ('18', 'thunder', 30.58, 's', 8, 'drop', -27, -.3, 'the puddles tremble'),
 # S2 church steps
 ('19', 'bell', 31.58, 's', 0, 'bell_far', -17, -.3, 'THE GREAT BELL swings in the marble arches (far)'),
 ('19', 'left', 32.78, 's', 0, 'bell_far', -21, -.3, 'its second swing as the storm leaves'),
 ('19', 'left', 32.78, 's', 2, 'sparkle_gold', -28, -.2, 'the sunbeam lands on the gold angel'),
 ('20', 'smiled', 33.82, 's', 1, 'pat', -21, .2, 'the Priest pats the Mason\'s shoulder'),
 ('20', 'off', 35.88, 's', 6, 'drop', -22, 0, 'a cold drop on the spear tip'),
 ('20', 'off', 35.88, 's', 8, 'glint', -26, 0, 'the drop glints: the signature light'),
 # S4 vineyard ridge, summer
 ('21', 'five', 37.20, 's', 1, 'thunder_mid', -19, .3, 'FIVE seconds: a nearer, brighter thunder'),
 ('22', 'split', 38.76, 's', 0, 'thunder_crack', -11, .2, 'THE BOLT SPLITS THE TREE, on "split"'),
 ('22', 'split', 38.76, 's', 0, 'tree_crack', -14, .2, 'the trunk cracks down the middle'),
 ('22', 'two', 39.26, 's', 2, 'crash_wood', -17, .3, 'the halves fall apart'),
 ('22', 'two', 39.26, 's', 4, 'fire_small', -25, .3, 'the halves burn in the rain', dict(len=1.6)),
 # S3 bell chamber, flash light
 ('23', 'bell', 39.92, 's', 0, 'thunder_mid', -24, -.4, 'white flash through the arches'),
 ('23', 'ringer', 40.12, 's', 3, 'rope_grip', -23, 0, 'he hauls the rope with both fists'),
 ('23', 'rang', 40.38, 's', 0, 'bell_great', -16, 0, 'THE GIANT BELL swings'),
 ('23', 'left', 41.48, 's', -3, 'whoosh_short', -21, 0, 'the bell swings back: his FEET LEAVE THE FLOOR'),
 ('23', 'left', 41.48, 's', 4, 'bell_great', -19, .1, 'the swing that lifts him'),
 ('23', 'floor', 41.88, 's', 2, 'rope_grip', -26, 0, 'the rope creaks as he hangs'),
 # S4 square, night
 ('24', 'night', 43.12, 's', 4, 'thunder_far', -23, -.2, 'the autumn night storm opens'),
 ('24', 'one', 44.18, 's', 0, 'thunder_crack', -10, -.1, 'ONE: flash and thunder almost together'),
 ('24', 'one', 44.18, 's', 3, 'wood_bang', -18, -.5, 'every shutter bangs: 1'),
 ('24', 'one', 44.18, 's', 7, 'door_bang', -19, .4, 'shutter 2'),
 ('24', 'one', 44.18, 's', 11, 'wood_bang2', -20, -.2, 'shutter 3'),
 ('24', 'one', 44.18, 'e', 9, 'wood_bang', -23, .6, 'shutter 4'),
 # S3 the Ringer runs
 ('25', 'dropped', 45.12, 's', 0, 'rope_slide', -21, 0, 'he DROPS THE ROPE'),
 ('25', 'ran', 46.14, 's', 0, 'run_feet', -21, .2, 'and RUNS down the cypress road'),
 ('25', 'ran', 46.14, 's', 4, 'splash', -24, .3, 'feet through the puddles'),
 ('25', 'ran', 46.14, 'e', 4, 'bell_far', -24, -.3, 'the loose rope: the bell tolls once by itself'),
 # S5 night: the idea, the proof
 ('26', 'lightning', 47.34, 's', 0, 'arc_slow', -20, 0, 'the slow bolt grows down, three trial branches, choosing'),
 ('26', 'easiest', 48.52, 's', 0, 'thunder_far', -27, .3, 'the cloud groans while it chooses'),
 ('27', 'iron', 50.12, 's', 0, 'glint', -22, 0, 'the chain lights: spear tip'),
 ('27', 'wire', 50.42, 's', 0, 'glint_b', -22, 0, 'bracket'),
 ('27', 'was', 50.76, 's', 0, 'glint_c', -23, 0, 'wire down the wall'),
 ('27', 'road', 51.14, 's', 0, 'glint_d', -23, 0, 'foot in the earth: the ROAD'),
 ('28', 'bolt', 52.02, 's', 0, 'riser_metal', -24, 0, 'the air tightens into the strike (peak on "bolt")'),
 ('28', 'bolt', 52.02, 's', 0, 'thunder_crack', -8, 0, 'THE BOLT HITS THE SPEAR TIP'),
 ('28', 'bolt', 52.02, 's', 0, 'boom_low', -15, 0, 'the whole town shakes'),
 ('28', 'ran', 52.30, 's', 0, 'arc_long', -15, 0, 'it RACES DOWN THE WIRE: crackle'),
 ('28', 'down', 52.60, 's', 0, 'welder_spark', -21, 0, 'staple by staple: hiss and spit'),
 ('29', 'past', 53.22, 's', 0, 'arc_mid', -24, 0, 'PAST the windows: inside the candles do not flicker (crackle heard through the stone)', dict(rate=.8)),
 ('30', 'wet', 54.58, 's', 0, 'sizzle', -18, 0, 'into the WET EARTH: hiss'),
 ('31', 'blue', 55.18, 's', 0, 'arc_short', -11, 0, 'BLUE FLASH: the spark dives into the mud'),
 ('31', 'puff', 56.20, 's', 0, 'steam_hiss', -15, 0, 'PUFF OF STEAM pops from the puddle'),
 ('31', 'puff', 56.20, 's', 1, 'blow', -19, 0, 'the steam ball'),
 ('31', 'angry', 57.32, 's', 0, 'wings_hen', -20, .4, 'the hen\'s feathers blow out into a ball'),
 ('31', 'chicken', 57.74, 'e', 0, 'squawk', -12, .4, 'ONE ANGRY HEN SQUAWK (in the gap after "chicken")'),
 # S3 marble tower, night
 ('32', 'found', 58.66, 's', 0, 'arc_slide', -21, -.2, 'the second bolt\'s fingers slide over the smooth marble'),
 ('33', 'smashed', 60.06, 's', 0, 'thunder_crack', -10, 0, 'IT SMASHES the gold angel'),
 ('33', 'smashed', 60.06, 's', 0, 'smash', -13, 0, 'the angel jumps off its peak'),
 ('33', 'smashed', 60.06, 's', 2, 'metal_debris', -16, .2, 'gold scraps clatter'),
 ('33', 'smashed', 60.06, 's', 3, 'welder_spark', -21, -.2, 'shower of sparks'),
 ('33', 'gold', 60.64, 's', 0, 'boing', -21, .1, 'the trumpet bends like a noodle'),
 ('33', 'angel', 60.86, 's', 2, 'ice_crack', -19, 0, 'a black crack runs down the marble'),
 # S5 both towers from the square
 ('34', 'perfect', 61.60, 's', 0, 'glint', -27, .5, 'one cold spark on the hero spear, near hill'),
 ('34', 'burned', 62.30, 's', 0, 'fire_big', -21, -.4, 'THE PERFECT TOWER BURNS like a candle, far hill', dict(len=2.6)),
 ('34', 'candle', 63.12, 'e', 3, 'whip_small', -28, .1, 'the Rival\'s hat slides off'),
 # S6 dawn church yard
 ('35', 'ordered', 64.80, 's', 0, 'spears_clank', -21, .2, 'the Priest\'s armful of small iron spears clanks'),
 ('35', 'every', 65.66, 's', 0, 'glint_d', -26, -.5, 'house spear catches the dawn'),
 ('35', 'roof', 66.04, 's', 0, 'glint_c', -26, -.2, 'barn spear'),
 ('35', 'he', 66.32, 's', 0, 'glint_b', -26, .2, 'well-roof spear'),
 ('35', 'owned', 66.48, 's', 4, 'glint', -26, .5, 'dovecote spear'),
 ('36', 'coop', 67.86, 's', 0, 'hammer_wood', -14, 0, 'HAMMER TAP on the chicken coop spear, on "coop"'),
 ('36', 'coop', 67.86, 's', 1, 'anvil_ting', -20, 0, 'iron answers under the hammer'),
 ('36', 'coop', 67.86, 'e', 6, 'cluck', -22, .4, 'HOLD ACCENT 68.4 s: the hen beside him, one tiny cluck on his smug look to camera'),
 ('36', 'coop', 67.86, 'e', 62, 'glint', -22, 0, 'v3: the camera LANDS on the big spear tip (f2108): one soft metallic ting on the spear'),
 ('36', 'coop', 67.86, 'e', 66, 'thunder_far', -24, 0, 'v3: low far thunder roll from f2112, carried across the loop into frame 0'),
]
# ambience beds: (from this word, near, offset frames, place, layers [(clip, dB)], hollow)
BEDS = [
 (None, 0, 0, 'P1 roof and street at purple dusk: wind before the storm, swallows, the town below', [('amb_wind', -34), ('amb_street', -38), ('amb_swallows', -40)], 0),
 ('the', 9.10, -3, 'P3 church inside: room tone, dusk wind through the side door', [('amb_room', -36), ('amb_wind', -46)], 1),
 ('on', 15.46, -3, 'P4 rival hill, bright morning: hill birds, light wind', [('amb_morning', -36), ('amb_morning2', -40), ('amb_wind', -46)], 0),
 ('and', 20.06, -2, 'P5 bell chamber, morning: wind through the arches, birds outside', [('amb_wind', -40), ('amb_morning', -46)], 1),
 ('the', 22.12, -3, 'P2 market at golden noon: market crowd', [('amb_market', -33), ('amb_morning2', -46)], 0),
 ('then', 25.96, 0, 'P2 arcade, spring drizzle: drizzle on awnings, people under the arcade', [('amb_drizzle', -34), ('amb_market', -42)], 0),
 ('the', 31.32, -3, 'P1b church steps: drizzle easing, birds coming back', [('amb_drizzle', -37), ('amb_morning', -40)], 0),
 ('in', 36.32, -3, 'P6 vineyard ridge, summer: rain in sheets, wind', [('amb_rain', -31), ('amb_forestrain', -35), ('amb_wind', -38)], 0),
 ('and', 39.68, 0, 'P5 bell chamber in the storm: rain and wind through the arches', [('amb_rain', -35), ('amb_wind', -37)], 1),
 ('one', 42.50, -3, 'P2 square, autumn night storm: rain on stone, wind', [('amb_rain', -32), ('amb_wind', -36)], 0),
 ('the', 44.70, -3, 'P4 cypress road, night storm: rain in the trees', [('amb_rain', -32), ('amb_forestrain', -35), ('amb_wind', -37)], 0),
 ('you', 46.76, -3, 'P8 both hills wide, night storm: wind high, rain', [('amb_rain', -33), ('amb_wind', -34)], 0),
 ('into', 54.16, 0, 'P7 wire foot macro, night: rain on mud close', [('amb_forestrain', -32), ('amb_rain', -38), ('amb_wind', -40)], 0),
 ('the', 58.32, -3, 'P4 marble tower, night storm', [('amb_rain', -33), ('amb_wind', -35)], 0),
 ('and', 61.42, -3, 'P2 square at night, the storm passing: rain thinning', [('amb_rain', -36), ('amb_wind', -39)], 0),
 ('and', 63.74, -3, 'P9 church yard, rose dawn: dawn birds, the hen house, drips', [('amb_morning', -36), ('amb_henhouse', -40), ('amb_morning2', -42)], 0),
 ('coop', 67.86, 34, 'P9b the fly up the tower wall and wire (film f2070 = 69.0 s to the loop): storm wall bed and a low wind that RISE with the camera', [('amb_wind', -30), ('amb_rain', -42)], 0),
]

# ------------------------------------------------------------------ resolve the cue sheet
N = FRAMES * SR // FPS; DUR = N / float(SR)
cues = []
for q in Q:
    row, w, near, edge, off, clip, d, pan, why = q[:9]; o = q[9] if len(q) > 9 else {}
    t = word(w, near, edge); f = int(round(t * FPS)) + off
    cues.append(dict(row=row, word=w, t_word=round(t, 3), frame=f, clip=clip, db=d, pan=pan, why=why, rate=o.get('rate', 1.0), len=o.get('len')))
beds = []
for b in BEDS:
    w, near, off, name, layers, hollow = b
    f = 0 if w is None else int(round(word(w, near) * FPS)) + off
    beds.append(dict(frame=f, word=w or '(frame 0)', name=name, layers=layers, hollow=hollow))
log('cues %d, beds %d, film %d frames = %.3f s' % (len(cues), len(beds), FRAMES, DUR))

def wrap_add(buf, y, i):
    """add y (2, n) at sample i; what runs past the end comes round to the start (the film loops), and before 0 goes to the end"""
    i = int(i); n = y.shape[1]
    if n <= N:
        a = (i % N); m = min(n, N - a); buf[:, a:a + m] += y[:, :m]
        if n > m: buf[:, :n - m] += y[:, m:]

# ------------------------------------------------------------------ clips
CL = {}; REL = {}
for k in sorted(set(c['clip'] for c in cues) | set(l[0] for b in beds for l in b['layers'])):
    x, sync, rel = C.prep(k); CL[k] = (x, sync); REL[k] = rel

# ------------------------------------------------------------------ voice (never re-timed)
v, vsr = sf.read(os.path.join(EP, 'voice', 'voice.wav'))
if v.ndim == 2: v = v.mean(1)
if vsr != SR: g_ = math.gcd(SR, vsr); v = signal.resample_poly(v, SR // g_, vsr // g_)
v = signal.sosfiltfilt(signal.butter(2, 70, 'high', fs=SR, output='sos'), v)
V = np.zeros(N); V[:min(N, len(v))] = v[:N]
e = np.sqrt(np.maximum(ndimage.uniform_filter1d(V ** 2, int(.03 * SR)), 0)); act = e > e.max() * lin(-36); act_raw = act.astype(float)   # act_raw: speaking now (no hold), for the gate
act = ndimage.maximum_filter1d(act.astype(float), int(.25 * SR), mode='wrap')
slowv = np.sqrt(np.maximum(ndimage.uniform_filter1d(V ** 2 * act, int(2. * SR), mode='wrap'), 0) / np.maximum(ndimage.uniform_filter1d(act, int(2. * SR), mode='wrap'), .05) + 1e-12)
ride = np.clip((np.median(slowv[act > .5]) / slowv) ** .6, lin(-3.5), lin(3.5)); V *= ndimage.uniform_filter1d(ride, int(.5 * SR), mode='wrap')
V *= lin(VOICE_RMS) / rms(V[act > .5])
duck = ndimage.uniform_filter1d(ndimage.uniform_filter1d(act, int(.22 * SR), mode='wrap'), int(.22 * SR), mode='wrap')
voice = np.vstack([V, V])

# ------------------------------------------------------------------ effects
def rate(y, r):
    if abs(r - 1) < .003: return y
    return np.interp(np.arange(int(len(y) / r)) * r, np.arange(len(y)), y)
sfx = np.zeros((2, N))
for c in cues:
    x, sync = CL[c['clip']]; y = rate(x, c['rate']).copy()
    if c['len']:
        m = int(c['len'] * SR); y = y[:m]; k = min(len(y) // 2, int(.6 * SR)); y[-k:] *= np.linspace(1, 0, k) ** 2
    a = (c['pan'] + 1) * math.pi / 4; i0 = int(round(c['frame'] * SR / FPS - sync / c['rate'] * SR))
    wrap_add(sfx, np.vstack([y * math.cos(a), y * math.sin(a)]) * lin(c['db']) * 1.4142, i0)

# ------------------------------------------------------------------ ambience: one bed per place, 0.45 s blends; the first bed is led in under the last 0.5 s (loop)
def loopbuf(key, n, phase):
    x = CL[key][0]; x = x / rms(x); xf = min(int(.5 * SR), len(x) // 4); L = len(x) - xf
    loop = x[:L].copy(); loop[:xf] = loop[:xf] * np.sqrt(np.linspace(0, 1, xf)) + x[L:L + xf] * np.sqrt(np.linspace(1, 0, xf))
    idx = (np.arange(n) + int(phase)) % L; return loop[idx]
rng = np.random.default_rng(7); ir = rng.standard_normal(int(.9 * SR)) * np.exp(-np.arange(int(.9 * SR)) / (.22 * SR))   # stone room: longer tail than armor's bomber
ir = signal.sosfilt(signal.butter(2, [150, 3000], 'band', fs=SR, output='sos'), ir); ir /= np.sqrt((ir ** 2).sum())
amb = np.zeros((2, N)); bounds = [int(b['frame'] * SR / FPS) for b in beds] + [N]; XF = int(.45 * SR)
for i, b in enumerate(beds):
    s0, s1 = bounds[i], bounds[i + 1]; a0 = max(0, s0 - XF // 2); a1 = min(N, s1 + XF // 2); n = a1 - a0
    env = np.ones(n)
    if i > 0: env[:XF] = np.sin(np.linspace(0, np.pi / 2, XF)) ** 2
    if i == len(beds) - 1: env *= lin(-9) ** (1 - np.clip((np.arange(n) + a0 - s0) / (38 * SR / FPS), 0, 1) ** 1.5)      # v3: the flight bed rises 9 dB over the flight f2070-2108, then stays calm
    if i < len(beds) - 1: env[-XF:] *= np.cos(np.linspace(0, np.pi / 2, XF)) ** 2
    seg = np.zeros((2, n))
    for key, d in b['layers']:
        for ch in (0, 1):
            y = loopbuf(key, n, a0 + ch * 0.37 * len(CL[key][0]))
            if b['hollow']: y = signal.fftconvolve(y, ir)[:n] * .8 + y * .45
            seg[ch] += y * lin(d)
    amb[:, a0:a1] += seg * env
k = int(.5 * SR); fo = np.cos(np.linspace(0, np.pi / 2, k)) ** 2; amb[:, -k:] *= fo
for key, d in beds[0]['layers']:
    for ch in (0, 1): amb[ch, -k:] += loopbuf(key, k, -k + ch * 0.37 * len(CL[key][0])) * lin(d) * (1 - fo)
t = np.arange(N) / float(SR)
amb *= 1 + .15 * np.sin(2 * np.pi * 7 * t / DUR) * np.sin(2 * np.pi * 3 * t / DUR)
amb *= lin(AMB_TRIM - AMB_DUCK * duck)

# ------------------------------------------------------------------ music: ONE theme, Pizzicato Comedy (library)
MP = os.path.join(C.MUSICDIR, C.THEME)
full = C.decode(MP, mono=False)                                     # (2, n) at 48 kHz
mono = full.mean(0); w10 = int(.01 * SR); env10 = 20 * np.log10(np.sqrt(np.convolve(mono ** 2, np.ones(w10) / w10, 'same')[::w10]) + 1e-9)
T0 = float(np.argmax(env10 > env10.max() - 40)) * .01 - .01         # first note of the track
seg = env10[int(97.0 / .01):int(101.0 / .01)]; quiet = np.where(seg < env10.max() - 38)[0]
q_end = quiet[quiet < np.argmax(seg)][-1] if len(quiet) else 0
TS = 97.0 + (q_end + 1 + int(np.argmax(np.diff(seg[q_end:q_end + 30])))) * .01      # onset of the button chord after the pause
log('theme: first note %.2f s, button chord %.2f s into the track' % (T0, TS))
def hp60(y): return signal.sosfilt(signal.butter(2, 60, 'high', fs=SR, output='sos'), y.mean(0))
MREF = VOICE_RMS + MUS_UNDER
A_ref = full[:, int(T0 * SR):int((T0 + 25) * SR)]; GA = lin(MREF) / rms(hp60(A_ref))
music = np.zeros((2, N))
def fade(n, i0, i1, kind):
    e_ = np.ones(n)
    if kind == 'in': e_[:i0] = 0; e_[i0:i1] = np.sin(np.linspace(0, np.pi / 2, i1 - i0)) ** 2
    else: e_[i0:i1] = np.cos(np.linspace(0, np.pi / 2, i1 - i0)) ** 2; e_[i1:] = 0
    return e_
# 1 STATEMENT: frame 0 .. "Then the storms came" (fades through 25.6-26.4 s)
t_turn = word('storms', 26.34); a = full[:, int(T0 * SR):int((T0 + t_turn + .4) * SR)] * GA; n = a.shape[1]
a = a * fade(n, int((t_turn - 1.0) * SR), n, "out"); music[:, :n] += a
# 2 CHANGE at the low point (the storm countdown ten, five, one): the same opening bars, slowed to 0.8 (about 4 semitones lower, a quarter slower),
#   darkened (low-pass 2.2 kHz) and 3 dB down; it cuts out just before the bolt so the strike lands in silence
t_bolt = word('bolt', 52.02); i_chg = int((t_turn - .4) * SR); L_chg = int((t_bolt - .12) * SR) - i_chg
src = full[:, int(T0 * SR):int((T0 + L_chg / SR * .8 + 1) * SR)]
b = np.vstack([signal.resample_poly(src[ch], 5, 4) for ch in (0, 1)])[:, :L_chg]
b = np.vstack([signal.sosfiltfilt(signal.butter(2, 2200, 'low', fs=SR, output='sos'), b[ch]) for ch in (0, 1)])
b = b * GA * lin(-3.0); n = b.shape[1]; e_ = fade(n, 0, int(1.0 * SR), 'in') * fade(n, n - int(.12 * SR), n, 'out'); music[:, i_chg:i_chg + n] += b * e_
# 3 RETURN in full: from "found no road" the last bars of the theme, their pause under "even the chicken", the button chord ON "coop"; it rings into the loop hold
t_ret = word('found', 58.66); t_pay = word('coop', 67.86, 'e') + .03          # the button chord lands as "coop" ends: the voice stays on top, the chord is the full stop
src0 = TS - (t_pay - t_ret); r = full[:, int(src0 * SR):int((src0 + (DUR - t_ret)) * SR)] * GA; n = r.shape[1]
n = min(n, int(70.5 * SR) - int(t_ret * SR)); r = r[:, :n]      # v3: the chord and its 1.5 s fade end where they did in v2 (70.5 s)
r = r * fade(n, 0, int(.5 * SR), 'in'); k = min(n, int(1.5 * SR)); r[:, -k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2          # the final chord rings out under the hold and is gone before the loop
i_ret = int(t_ret * SR); n = min(n, N - i_ret); music[:, i_ret:i_ret + n] += r[:, :n]
mduck = lin((MUS_GAP - MUS_UNDER) * (1 - duck))
pay = int((t_pay + .02) * SR); mduck[pay:] = lin(MUS_GAP - MUS_UNDER)            # the button chord is not ducked under the tail of "coop"
music *= mduck

# ------------------------------------------------------------------ voice on top: a keyed limiter on effects + beds. While the voice speaks, the effects and
# beds together are held at least KEY_DB under the voice's own envelope (0.25 s); 15 ms attack, 250 ms release. In the gaps the hits stay full.
KEY_DB = 7.0; KEY_MAX = 12.0     # never more than 12 dB off a hit, so the thunder on "split", "one", "bolt", "smashed" still lands
def env_(x, s): return np.sqrt(np.maximum(ndimage.uniform_filter1d(x ** 2, int(s * SR), mode='wrap'), 0) + 1e-14)
ve = env_(V, .4); re_ = env_((sfx + amb).mean(0), .1)
gk = np.where(act > .5, np.clip(ve * lin(-KEY_DB) / re_, lin(-KEY_MAX), 1), 1.0)
gs = ndimage.minimum_filter1d(gk, int(.25 * SR), mode='wrap'); gs = ndimage.uniform_filter1d(gs, int(.12 * SR), mode='wrap')   # cyclic, so the loop point sees the same gain
sfx *= gs; amb *= gs
log('keyed limiter on effects + beds: max %.1f dB, %.1f %% of the time active' % (db(gs.min()), 100 * (gs < lin(-.5)).mean()))
for w_, n_ in (('split', 38.76), ('one', 44.18), ('bolt', 52.02), ('blue', 55.18), ('smashed', 60.06), ('mud', 8.64), ('nailed', .18)): log('   key gain at %-8s %.1f dB' % (w_, db(gs[int((word(w_, n_) + .05) * SR)])))

# ------------------------------------------------------------------ sum, master, measure
pre = voice + sfx + amb + music
def limit(x, ceil_db):
    c = lin(ceil_db); pk = np.abs(signal.resample_poly(x, 4, 1, axis=1)).reshape(2, -1, 4).max(2).max(0)
    g = np.minimum(1, c / np.maximum(pk, 1e-9)); w = int(.005 * SR); g = ndimage.minimum_filter1d(g, 2 * w + 1, mode='wrap'); g = ndimage.uniform_filter1d(g, w, mode='wrap')
    return x * g, float(db(g.min()))
tmp = os.path.join(OUT, '_tmp.wav'); G = 0.0
for it in range(5):
    out, gr = limit(pre * lin(G), CEIL_TP - .35); sf.write(tmp, out.T, SR, subtype='PCM_24'); M = ebur(tmp)
    log('master pass %d: gain %+.2f dB, limiter max %.2f dB ->' % (it + 1, G, gr), M)
    if abs(M['I'] - TARGET_I) < .1 and M['TP'] < -1.0: break
    G += TARGET_I - M['I']
os.remove(tmp)
MIX = os.path.join(OUT, 'mix_%s.wav' % VER); sf.write(MIX, out.T, SR, subtype='PCM_24'); M = ebur(MIX)
for nm, st in (('voice', voice), ('sfx', sfx), ('amb', amb), ('music', music)): sf.write(os.path.join(OUT, 'stems', nm + '.wav'), (st * lin(G)).T, SR, subtype='PCM_24')
ff(['-y', '-i', MIX, '-c:a', 'libmp3lame', '-b:a', '192k', os.path.join(OUT, 'mix_%s_preview.mp3' % VER)])
lv = {nm: round(db(rms(st[:, act > .5] * lin(G))), 1) for nm, st in (('voice', voice), ('sfx', sfx), ('amb', amb), ('music', music))}
gap = {nm: round(db(rms(st[:, act < .5] * lin(G))), 1) for nm, st in (('sfx', sfx), ('amb', amb), ('music', music))}
# voice on top, measured per 0.5 s window while speaking: the voice against everything else together
W = int(.5 * SR); worst = []
for i in range(0, N - W, W):
    if act_raw[i:i + W].mean() > .6:
        rest = (sfx + amb + music)[:, i:i + W]; worst.append((db(rms(voice[:, i:i + W])) - db(rms(rest)), i / SR))
worst.sort(); n_under6 = sum(1 for d_, _ in worst if d_ < 6)
d = np.abs(np.diff(out, axis=1)); jump = float(np.abs(out[:, 0] - out[:, -1]).max()); typ = float(np.percentile(d[:, -4800:], 99.5)); loop_ok = jump <= max(typ, 1e-4) * 1.5
# every plan row has a cue within 2 frames of its landing word
PLAN = {'1': ('nailed', .18), '2': ('spear', .92), '3': ('tower', 2.32), '4': ('terrified', 3.34), '5': ('wire', 5.72), '6': ('down', 7.30), '7': ('mud', 8.64),
        '8': ('priest', 9.44), '9': ('pale', 11.08), '10': ('lightning', 12.36), '11': ("wouldn't", 14.30), '12': ('other', 15.74), '13': ('angel', 19.46),
        '14': ('bell', 21.08), '15': ('laughed', 22.78), '16': ('climbed', 24.68), '17': ('came', 26.68), '18': ('thunder', 30.58), '19': ('bell', 31.58),
        '20': ('smiled', 33.82), '21': ('five', 37.20), '22': ('split', 38.76), '23': ('rang', 40.38), '24': ('one', 44.18), '25': ('dropped', 45.12),
        '26': ('lightning', 47.34), '27': ('road', 51.14), '28': ('bolt', 52.02), '29': ('past', 53.22), '30': ('wet', 54.58), '31': ('blue', 55.18),
        '32': ('found', 58.66), '33': ('smashed', 60.06), '34': ('burned', 62.30), '35': ('ordered', 64.80), '36': ('coop', 67.86)}
miss = []
for rw, (w, near) in PLAN.items():
    f = word(w, near) * FPS; mine = [c for c in cues if c['row'] == rw]
    if not mine or min(abs(c['frame'] - f) for c in mine) > 2 + 4 * (rw in ('2', '6', '12', '17', '21')): miss.append('row %s "%s"' % (rw, w))
R = dict(mix=os.path.basename(MIX), frames=FRAMES, seconds=round(DUR, 3), ebur128=M, target=dict(I=TARGET_I, TP_below=-1.0), master_gain_db=round(G, 2), limiter_max_db=round(gr, 2),
         rms_under_voice_dbfs=lv, rms_in_gaps_dbfs=gap, voice_minus_music_db=round(lv['voice'] - lv['music'], 1), voice_minus_sfx_db=round(lv['voice'] - lv['sfx'], 1),
         voice_vs_rest_worst_half_seconds=[(round(d_, 1), round(t_, 1)) for d_, t_ in worst[:5]], windows_voice_under_6db=n_under6, windows_speaking=len(worst),
         loop=dict(jump=round(jump, 6), typical_step_p995=round(typ, 6), click_free=bool(loop_ok)), cues=len(cues), beds=len(beds), plan_rows_without_cue=miss,
         music=dict(track=C.THEME, first_note_s=round(T0, 2), button_chord_s=round(TS, 2), turn_s=round(t_turn, 2), bolt_cut_s=round(t_bolt, 2), return_s=round(t_ret, 2), payoff_s=round(t_pay, 2)),
         library_clips=len(CL), synthesized=[])
json.dump(R, io.open(os.path.join(OUT, 'measure.json'), 'w', encoding='utf-8'), indent=1)

# ------------------------------------------------------------------ CUE_SHEET.md
ok = lambda b_: 'PASS' if b_ else 'FAIL'
L = ['# CUE SHEET: Why The Safest Tower Had A Spear On Top (sound-designer, generated by `python mix.py %s`; do not edit by hand, edit `Q`/`BEDS` in mix.py)' % VER, '',
     'Film 0-%d frames at 30 fps = %.2f s (voice 68.40 s + loop hold). Frames from `voice/words.json` (take 2). Level = dB on the peak-normalised clip before the master (master gain %+.1f dB). Pan -1 left .. +1 right.' % (FRAMES, DUR, G),
     'All %d clips are real samples from `ALL SOUND EFFECTS` (path below each key); music from `BACKGROUND MUSIC`. Synthesized: nothing.' % len(CL), '',
     '## Measured (ffmpeg ebur128 on `out/%s`)' % os.path.basename(MIX), '| gate | target | measured | |', '|---|---|---|---|',
     '| integrated loudness | -14 LUFS | %.1f LUFS | %s |' % (M['I'], ok(abs(M['I'] - TARGET_I) <= .3)),
     '| true peak | below -1 dBTP | %.1f dBTP | %s |' % (M['TP'], ok(M['TP'] < -1.0)),
     '| loudness range | (report) | %.1f LU | |' % M['LRA'],
     '| voice on top | voice above music and effects while speaking | voice %.1f, music %.1f, sfx %.1f, beds %.1f dBFS RMS | %s |' % (lv['voice'], lv['music'], lv['sfx'], lv['amb'], ok(lv['voice'] - max(lv['music'], lv['sfx'], lv['amb']) >= 8)),
     '| voice vs everything else, 0.5 s speaking windows | >= 6 dB in at least 92 %% of windows, never under 0 dB | %d of %d windows under 6 dB; worst %s | %s |' % (n_under6, len(worst), ', '.join('%.1f dB at %.1f s' % w_ for w_ in worst[:3]), ok(n_under6 <= .08 * len(worst) and worst[0][0] > 0)),
     '| loop point | no click | step %.5f against %.5f usual | %s |' % (jump, typ, ok(loop_ok)),
     '| every PICTURE_PLAN row has a cue on its word (2 frames; camera-move rows 6) | 36 | %d of 36 | %s |' % (36 - len(miss), ok(not miss))] + ['- no cue: ' + m_ for m_ in miss] + ['',
     '## Music: ONE theme, `%s` (E minor, about 108 bpm, pizzicato strings)' % C.THEME,
     '- STATEMENT, frame 0 to "storms" (%.2f s): the track from its first note (%.2f s in), the tune as written.' % (t_turn, T0),
     '- CHANGE at the low point, the storm countdown ten, five, one (%.2f-%.2f s): the SAME opening bars slowed to 0.8 (about 4 semitones lower, a quarter slower), low-passed at 2.2 kHz, 3 dB down. It cuts out 0.12 s before "bolt" so the strike lands in silence.' % (t_turn - .4, t_bolt - .12),
     '- RETURN in full from "found" (%.2f s): the closing bars of the theme; their written pause (about 1.4 s) falls under "he owned, even the chicken" and the button chord (%.2f s into the track) lands at the end of "coop" (%.2f s), not ducked, ringing into the loop hold. The last 0.25 s fades so the end runs into the first note at frame 0.' % (t_ret, TS, t_pay),
     '- Under speech the music sits %g dB under the voice; in gaps and the hold it comes up %.1f dB.' % (-MUS_UNDER, MUS_GAP - MUS_UNDER), '',
     '## Cues (%d)' % len(cues), '| # | row | frame | word | sound (clip key) | level dB | pan | what and why |', '|---|---|---|---|---|---|---|---|']
for i, c in enumerate(sorted(cues, key=lambda c: c['frame'])):
    L.append('| %d | %s | %d | %s | `%s`%s | %g | %+.1f | %s |' % (i + 1, c['row'], c['frame'], c['word'], c['clip'], ' x%.2f' % c['rate'] if c['rate'] != 1 else '', c['db'], c['pan'], c['why']))
L += ['', '## Ambience beds (%d; level trim %g dB, steps back %g dB under speech; 0.45 s blends; the dawn bed hands into the dusk bed over the last 0.5 s)' % (len(beds), AMB_TRIM, AMB_DUCK),
      '| frame | from word | place and sound | layers (clip, RMS dBFS before the master) | stone room |', '|---|---|---|---|---|']
for b in beds: L.append('| %d | %s | %s | %s | %s |' % (b['frame'], b['word'], b['name'], ', '.join('`%s` %d' % l for l in b['layers']), 'yes' if b['hollow'] else ''))
L += ['', '## Clip sources (CB library, `ALL SOUND EFFECTS`)', '| key | file | treatment |', '|---|---|---|']
for k in sorted(CL): L.append('| `%s` | %s | %s |' % (k, REL[k].replace('|', '/'), ', '.join('%s=%s' % kv for kv in C.CLIPS[k][1].items()) or 'as recorded'))
io.open(os.path.join(HERE, 'CUE_SHEET.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
log('MEASURED', json.dumps(M), 'voice-music %.1f, voice-sfx %.1f' % (lv['voice'] - lv['music'], lv['voice'] - lv['sfx']), 'loop', R['loop'], 'under6', n_under6, 'worst', worst[:3], 'no cue:', miss)
