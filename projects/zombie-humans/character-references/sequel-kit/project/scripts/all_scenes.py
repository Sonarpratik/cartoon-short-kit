"""Assemble review/<version>_ALL_SCENES/: numbered frames, one labelled sheet per scene and an overview.
Usage: python scripts/all_scenes.py v1"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, shutil, sys, textwrap

root = Path(__file__).resolve().parents[1]
version = sys.argv[1] if len(sys.argv) > 1 else 'v1'
manifest = json.loads((root / f'review/manifest_{version}.json').read_text(encoding='utf-8'))
out = root / f'review/{version}_ALL_SCENES'
if out.exists():
    raise SystemExit(f'{out} exists; use a new version')
out.mkdir(parents=True)
font = lambda n, b=False: ImageFont.truetype('C:/Windows/Fonts/' + ('arialbd.ttf' if b else 'arial.ttf'), n)

n = 0
thumbs = []
for s in manifest:
    # Numbered full-size frames, in story order.
    for f, p in zip(s['review'], s['paths']):
        n += 1
        shutil.copy(root / p, out / f'{n:03d}_{s["id"]}_f{f:04d}.jpg')
    # Per-scene sheet.
    tw, th, gap, header = 300, 533, 14, 112
    sheet = Image.new('RGB', (gap + (tw + gap) * len(s['paths']), header + th + 44), '#16232e')
    d = ImageDraw.Draw(sheet)
    d.text((16, 12), f'{s["id"]} · {s["title"]}   (frames {s["f0"]}–{s["f1"] - 1}, {s["f0"] / 30:.1f}–{s["f1"] / 30:.1f}s)', font=font(24, True), fill='#f1d5ae')
    for j, line in enumerate(textwrap.wrap(s['words'], width=max(60, len(s['paths']) * 26))[:2]):
        d.text((16, 50 + j * 24), line, font=font(18), fill='#f3eee1')
    for i, p in enumerate(s['paths']):
        im = Image.open(root / p).convert('RGB').resize((tw, th), Image.Resampling.LANCZOS)
        x = gap + i * (tw + gap)
        sheet.paste(im, (x, header))
        d.text((x, header + th + 10), f'f{s["review"][i]:04d}  {s["review"][i] / 30:.2f}s', font=font(17), fill='#d6e0dd')
    sheet.save(out / f'sheet_{s["id"]}.jpg', quality=92)
    # Overview: the scene's middle review frame.
    mid = s['paths'][len(s['paths']) // 2]
    thumbs.append((s, Image.open(root / mid).convert('RGB').resize((216, 384), Image.Resampling.LANCZOS)))

cols = 6
rows = (len(thumbs) + cols - 1) // cols
ov = Image.new('RGB', (cols * 228 + 12, rows * 440 + 70), '#16232e')
d = ImageDraw.Draw(ov)
d.text((14, 16), f'Zombie Apocalypse Part 3 · The Real Danger Is Humans · review {version} · {len(manifest)} scenes · 90.4 s', font=font(26, True), fill='#f1d5ae')
for i, (s, im) in enumerate(thumbs):
    x, y = 12 + (i % cols) * 228, 64 + (i // cols) * 440
    ov.paste(im, (x, y))
    d.text((x, y + 390), s['id'], font=font(20, True), fill='#f1d5ae')
    d.text((x + 52, y + 393), s['title'][:22], font=font(15), fill='#d6e0dd')
ov.save(out / '000_OVERVIEW.jpg', quality=92)
print(out, n, 'frames')
