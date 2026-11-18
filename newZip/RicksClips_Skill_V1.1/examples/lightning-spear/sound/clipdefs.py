# Why The Safest Tower Had A Spear On Top: the clip table. Every clip is a real sample from CB's libraries
#   SFX   <YOUR_SFX_FOLDER>      MUSIC  <YOUR_MUSIC_FOLDER>
# Found through library_index.csv in this folder (the old rick-shorts/audio index is gone from this PC; this index was
# rebuilt 2026-11-15 by walking both folders: 3135 sfx, 165 music). Nothing here is synthesized.
# prep() cuts the piece, trims it to its attack, filters / re-pitches it if asked, and writes clips/<key>.wav (48 kHz mono, peak 1.0).
# Pattern copied from episodes/armor-no-holes/sound/clipdefs.py (same prep, new clip list).
import os, csv, io, subprocess
import numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, 'library_index.csv')
CLIPDIR = os.path.join(HERE, 'clips')
SR = 48000

# key: (file name fragment in the library, options)
#   start, dur  seconds inside the source      rate  playback speed (pitch), 1 = as recorded      lp, hp  filters in Hz
#   sync 'on' = the attack sits on the cue frame (default) / 'peak' = the loudest moment sits on the cue frame      raw  keep the lead-in      fade  fade-out seconds
CLIPS = {
    # ---- ambience loops (beds) ----
    'amb_wind':       ('WindStormCold_S011WT.60', dict(lp=900, raw=1, fade=0)),
    'amb_street':     ('Ambiences (Empty street)', dict(start=5, dur=30, lp=6000, raw=1, fade=0)),
    'amb_swallows':   ('Forest_S08AM.29', dict(hp=1500, raw=1, fade=0)),
    'amb_room':       ('Ambiences (Room filler)', dict(start=40, dur=24, lp=5000, raw=1, fade=0)),
    'amb_morning':    ('Forest_S08AM.28', dict(hp=600, raw=1, fade=0)),
    'amb_morning2':   ('Forest_S08AM.32', dict(hp=600, raw=1, fade=0)),
    'amb_market':     ('Group of People sfx', dict(start=10, dur=40, hp=150, raw=1, fade=0)),
    'amb_drizzle':    ('Ambiences (Rain cover umbrella)', dict(dur=30, raw=1, fade=0)),
    'amb_rain':       ('Ambiences (Rain).wav', dict(start=20, dur=40, raw=1, fade=0)),
    'amb_forestrain': ('ForestRainLoop_S08AM.38', dict(raw=1, fade=0)),
    'amb_henhouse':   ('HenHouseAmbience_S08AN.119', dict(hp=200, raw=1, fade=0)),
    # ---- iron, hammer, wire ----
    'anvil_hit':      ('ImpactAnvilMetal_S08IM.231', dict(rate=.9, fade=.4)),
    'anvil_ting':     ('ImpactAnvilMetal_S08IM.231', dict(rate=1.3, fade=.3)),
    'hammer_wood':    ('HammerHitWood_S011IN.300', dict()),
    'tick_metal':     ('MMFX_CLICK METALLIC_SB01.320', dict()),
    'wire_crank':     ('HandCrankWire_S011FO.484', dict(fade=.2)),
    'twang':          ('RubberBand_AP1.1115', dict(rate=.55, fade=.3)),
    'rope_slide':     ('RopeSlide_AP1.1112', dict(fade=.15)),
    'rope_grip':      ('RopeGripTwist_S011IN.484', dict(dur=.7, fade=.2)),
    'spears_clank':   ('CrashMetalDebris_S08IM.133', dict(start=.1, dur=.9, rate=1.2, fade=.4)),
    # ---- the cold signature glint (one bar of a tubular bell, re-pitched; four pitches for the chain in row 27) ----
    'glint':          ('TubularBellHit_BWU.168', dict(rate=2.0, hp=1500, dur=1.6, fade=1.0)),
    'glint_b':        ('TubularBellHit_BWU.168', dict(rate=1.78, hp=1400, dur=1.4, fade=.9)),
    'glint_c':        ('TubularBellHit_BWU.168', dict(rate=1.59, hp=1300, dur=1.4, fade=.9)),
    'glint_d':        ('TubularBellHit_BWU.168', dict(rate=1.33, hp=1100, dur=1.4, fade=.9)),
    # ---- bells ----
    'bell_tap':       ('TubularBellHit_BWU.168', dict(rate=.5, lp=2500, fade=1.5)),
    'bell_hum':       ('TubularBellHit_BWU.168', dict(rate=.33, lp=900, fade=2.0)),
    'bell_great':     ('ChurchBellsRing_S08MU.86', dict(rate=.62, lp=3000, fade=1.5)),
    'bell_far':       ('ChurchBellsRing_S08MU.86', dict(rate=.62, lp=1400, fade=1.5)),
    # ---- sky ----
    'thunder_crack':  ('ThunderCrack_BWU.500', dict(fade=2.0)),
    'thunder_mid':    ('ThunderCrack_BWU.500', dict(rate=.85, lp=1500, fade=2.0)),
    'thunder_far':    ('DSGNImpt_Pre Shifted Rumble Thunder', dict(lp=500, fade=2.5)),
    'boom_low':       ('Cinematic Bass Boom', dict(lp=300, fade=1.5)),
    'riser_metal':    ('Metalic Riser', dict(lp=6000, sync='peak', raw=1, fade=.05)),
    'arc_short':      ('ElectricalArc_AP1.1281', dict(hp=900, fade=.2)),
    'arc_mid':        ('ElectricalArc_AP1.1280', dict(fade=.2)),
    'arc_long':       ('ElectricalArc_AP1.1283', dict(fade=.4)),
    'arc_slow':       ('ElectricArc_SEU03.47', dict(rate=.5, lp=3000, fade=1.0)),
    'arc_slide':      ('ElectricArc_SEU03.47', dict(rate=.8, lp=4000, fade=.6)),
    'welder_spark':   ('ArchWelderSpark_S08IN.53', dict(dur=1.4, fade=.6)),
    'sizzle':         ('AcidBurnSizzle_BWU11.244', dict(dur=1.6, fade=.8)),
    'steam_hiss':     ('lighter hiss', dict(fade=.3)),
    'blow':           ('Unorganised/Blow_2', dict(lp=5000)),
    # ---- wood, shutters, tree, fire ----
    'wood_bang':      ('Wood2X4Impact_AP1.1218', dict(lp=3500)),
    'wood_bang2':     ('Wood2X4Impact_AP1.1220', dict(lp=3500)),
    'door_bang':      ('DoorKickWood_BWU11.202', dict(lp=3000)),
    'tree_crack':     ('ImpactAxeWood_S08IM.243', dict(rate=.8, fade=.5)),
    'crash_wood':     ('CrashWood_S08IM.224', dict(lp=4000, fade=.8)),
    'fire_small':     ('FireBonfire_S08FI.10', dict(lp=4000, raw=1, fade=0)),
    'fire_big':       ('Sfx/FIRE SOUND EFFECTS', dict(lp=3000, raw=1, fade=0)),
    'flame':          ('FireTorchPass_AP1.1063', dict(lp=3000, sync='peak', raw=1)),
    # ---- mud, water ----
    'mud_push':       ('MudSuction_AP1.1101', dict(fade=.3)),
    'mud_stamp':      ('MudMovement_S08FO.1685', dict()),
    'drip':           ('DripDropPlop_S08WR.32', dict()),
    'drop':           ('DropSingleDrip_S08WR.49', dict()),
    'splash':         ('SplashWetHeavy_S011TX.468', dict(lp=5000, fade=.3)),
    # ---- the hen, the swallows ----
    'cluck':          ('ChickenClucks_BWU.14', dict(dur=.9, fade=.3)),
    'squawk':         ('BirdSquawkIndoor_S08AN.38', dict()),
    'wings':          ('ChickenWingFlap_S011AN.10', dict(rate=1.5, fade=.2)),
    'wings_hen':      ('ChickenWingFlap_S011AN.10', dict(fade=.2)),
    'chirp':          ('BirdChirp_SEU02.1', dict(hp=1500)),
    # ---- people ----
    'step_soft':      ('TennisShoes_S08FS.361', dict(lp=3000)),
    'pat':            ('BaseballGlove_AP1.1289 (1)', dict()),
    'rosary':         ('ChainRattleMove_S08FO.499', dict(rate=1.4, dur=.5, fade=.2)),
    'laugh':          ('HumanLaugh_S08HU.344', dict(dur=1.9, fade=.5)),
    'laugh_hard':     ('Laughing_hard_sound_effect', dict(dur=2.2, fade=.6, lp=6000)),
    'laugh_silly':    ('VoiceLaughSilly_BWU.21', dict(rate=1.12)),
    'cheer_far':      ('Misc/Crowd Cheer', dict(lp=2500, dur=3.0, fade=1.2)),
    'crowd_walk':     ('FOLYFeet_Footsteps Boots Walk Concrete Gritty Distance', dict(dur=3.0, lp=4000, fade=1.0)),
    'run_feet':       ('cartoon_running.m4a', dict(dur=1.4, lp=3500, fade=.5)),
    'pop':            ('HumanMouthPop_S08HU.392', dict()),
    # ---- small things ----
    'pulley':         ('ChainPulleyPull_S011IN.136', dict(dur=1.6, fade=.4)),
    'metal_seat':     ('ImpactMetal_S08IM.389', dict(rate=.7, fade=.4)),
    'sparkle_gold':   ('Epic_Twinkle', dict(fade=.4)),
    'orange_bounce':  ('BasketballBounce_AP1.1290 (1)', dict(rate=1.7, lp=2500)),
    'orange_roll':    ('DiceRoll_AP1.1293', dict(rate=.6, lp=2500, fade=.3)),
    'mallets_desc':   ('MalletsDescend_S08CT.114', dict(lp=6000, fade=.3)),
    'boing':          ('SpringBoing_S011TX.514', dict(rate=.8, fade=.4)),
    'ice_crack':      ('IceCrack_S011WT.11', dict(lp=5000, fade=.3)),
    'smash':          ('Unorganised/Smash.mp3', dict()),
    'metal_debris':   ('CrashMetalDebris_S08IM.133', dict(start=.05, dur=1.6, fade=.7)),
    # ---- air ----
    'whoosh_a':       ('NEWEST SFX PACK/Whoosh Deep Light.wav', dict(lp=3500, sync='peak', raw=1)),
    'whoosh_short':   ('SFX/Whoosh/Whoosh 5', dict(lp=5000, sync='peak', raw=1)),
    'whip_small':     ('WhipWhoosh_AP1.1133', dict(lp=6000, sync='peak', raw=1)),
}
MUSICDIR = r'<YOUR_MUSIC_FOLDER>'
THEME = 'Pizzicato Comedy.mp3'     # E minor, about 108 beats a minute; ends on a pause and one button chord at about 99.3 s

_rows = None
def lib(frag):
    """the library file for a name fragment (shortest match), from the index in this folder"""
    global _rows
    if _rows is None:
        with io.open(INDEX, newline='', encoding='utf-8') as f: _rows = [r for r in csv.DictReader(f) if r['kind'] == 'sfx']
    fr = frag.lower().replace('\\', '/')
    h = [r for r in _rows if fr in r['rel'].lower().replace('\\', '/') and os.path.exists(r['path'])]
    assert h, 'not in the library: ' + frag
    h.sort(key=lambda r: (len(r['rel']), r['rel']))
    return h[0]

def decode(path, mono=True, start=None, dur=None):
    cmd = ['ffmpeg', '-v', 'error']
    if start: cmd += ['-ss', str(start)]
    if dur: cmd += ['-t', str(dur)]
    cmd += ['-i', path, '-ac', '1' if mono else '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(float)
    return x if mono else x.reshape(-1, 2).T

def _env(x, w=240):
    n = len(x) // w; return np.sqrt((x[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9

def prep(key, force=False):
    """-> (samples, sync_seconds, library rel path). Cached in clips/<key>.wav (+ .txt with the sync point)."""
    frag, o = CLIPS[key]; os.makedirs(CLIPDIR, exist_ok=True)
    p = os.path.join(CLIPDIR, key + '.wav'); r = lib(frag)
    if os.path.exists(p) and os.path.exists(p + '.txt') and not force:
        y, _ = sf.read(p); return np.asarray(y, float), float(open(p + '.txt').read().split()[0]), r['rel']
    x = decode(r['path'], start=o.get('start'), dur=o.get('dur'))
    if not o.get('raw'):                       # trim to the attack: first 5 ms block within 30 dB of the peak, 3 ms of lead-in kept
        e = _env(x); i = int(np.argmax(e > e.max() * 10 ** (-30 / 20.))) * 240; x = x[max(0, i - 144):]
    if o.get('rate', 1) != 1:
        n = int(len(x) / o['rate']); x = signal.resample_poly(x, n, len(x)) if len(x) < 400000 else np.interp(np.arange(n) * o['rate'], np.arange(len(x)), x)
    if o.get('lp'): x = signal.sosfiltfilt(signal.butter(2, o['lp'], 'low', fs=SR, output='sos'), x)
    if o.get('hp'): x = signal.sosfiltfilt(signal.butter(2, o['hp'], 'high', fs=SR, output='sos'), x)
    e = _env(x); last = np.where(e > e.max() * 10 ** (-48 / 20.))[0]
    if len(last) and not o.get('raw'): x = x[: min(len(x), (last[-1] + 12) * 240)]
    fi = min(96, len(x) // 4); x[:fi] *= np.linspace(0, 1, fi)
    fo = int(o.get('fade', .03) * SR); fo = min(fo, len(x) // 2)
    if fo: x[-fo:] *= np.linspace(1, 0, fo) ** 2
    x = x / (abs(x).max() + 1e-9)
    sync = 0.0
    if o.get('sync') == 'peak': e = _env(x, 960); sync = float(np.argmax(np.convolve(e, np.ones(3) / 3, 'same'))) * 960 / SR
    sf.write(p, x, SR, subtype='PCM_24'); open(p + '.txt', 'w', encoding='utf-8').write('%.4f %s' % (sync, r['rel']))
    return x, sync, r['rel']

if __name__ == '__main__':
    import sys
    for k in CLIPS:
        x, s, rel = prep(k, force='-f' in sys.argv); print('%-14s %6.2fs sync %.2f  %s' % (k, len(x) / SR, s, rel.encode('ascii', 'replace').decode()))
