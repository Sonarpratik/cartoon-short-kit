"""Burn one-word-at-a-time captions (Second Draw style) onto out/final.mp4 -> out/Zombie Apocalypse Part 3 - subtitles.mp4."""
import json, subprocess
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
t = json.loads((ROOT / 'work/timing.json').read_text(encoding='utf-8'))
D = t['duration']
words = []
for w in t['words']:
    x = dict(w); x['word'] = x['word'].strip()
    if x['word'] == 'tenon': x['word'] = 'ten'   # transcription slip: "ten men"
    if x['word'] == 'I' and words and words[-1]['word'].startswith('1'): continue   # stray "I" before "never show"
    if x['word'].startswith('-') and words:   # "twenty" "-five," -> "twenty-five,"
        words[-1]['word'] += x['word']; words[-1]['end'] = x['end']
    else:
        words.append(x)
KEY = {'zombies', 'humans', 'gate', 'gates', 'generator', 'safe', 'help', 'gone', 'headlights', 'engines', 'ten', 'rules', 'supplies', 'stash', 'awake', 'trust', 'survive', 'everything', 'stop', '1', '10', '20', '1.', '2.', '3.', '4.', '10.', '20.'}

def ts(s):
    return f"{int(s // 3600)}:{int(s % 3600 // 60):02d}:{s % 60:05.2f}"

head = r"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,Arial Black,100,&H00FFFFFF,&H00FFFFFF,&H00141018,&H8C000000,0,0,0,0,100,100,1,0,1,9,5,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines = []
for i, w in enumerate(words):
    a = w['start']; nxt = words[i + 1]['start'] if i + 1 < len(words) else D
    b = min(nxt, max(w['end'] + .35, a + .25)) if nxt - w['end'] > .6 else nxt
    colour = r'\c&H3AD8FF&' if w['word'].strip('.,?!').lower() in KEY else ''   # warm yellow (BGR)
    tags = r'{\pos(540,1345)\fscx118\fscy118\t(0,90,\fscx100\fscy100)' + colour + '}'
    lines.append(f"Dialogue: 0,{ts(a)},{ts(min(b, D))},Word,,0,0,0,,{tags}{w['word']}")
(OUT / 'captions.ass').write_text(head + '\n'.join(lines) + '\n', encoding='utf-8')
ff = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ff, '-hide_banner', '-loglevel', 'warning', '-i', 'final.mp4', '-vf', 'ass=captions.ass',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-c:a', 'copy', '-movflags', '+faststart', '-metadata', 'title=Zombie Apocalypse Part 3 - The Real Danger Is Humans',
    '-y', 'Zombie Apocalypse Part 3 - subtitles.mp4'], cwd=OUT, check=True)
print(len(lines), 'caption words;', lines[0])
