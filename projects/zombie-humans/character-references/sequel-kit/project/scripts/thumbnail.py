"""Thumbnail on the S15 gate frame: headline, goldenrod 'ZOMBIE CAMPS TIER LIST' banner, red 'CHOOSE YOUR CAMPS WISELY', PART 2 badge.
Writes out/thumbnail_vertical.jpg (1080x1920) and out/thumbnail_landscape.jpg (1280x720)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
BLACK = 'C:/Windows/Fonts/ariblk.ttf'
GOLDENROD, RED, INK, WHITE = '#DAA520', '#E3262B', '#140f14', '#ffffff'
font = lambda n: ImageFont.truetype(BLACK, n)


def fit(d, text, max_w, start):
    size = start
    while d.textlength(text, font=font(size)) > max_w and size > 20:
        size -= 2
    return font(size)


def outlined(img, xy, text, f, fill, stroke=10, shadow=True, anchor='mm'):
    """Bold text with a thick ink outline and a soft drop shadow."""
    if shadow:
        sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 8), text, font=f, fill=(0, 0, 0, 170), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 170))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    ImageDraw.Draw(img).text(xy, text, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=INK)


def banner(img, cx, cy, text, max_w, size, pad=(36, 22), tilt=-2.5):
    """Goldenrod plate with ink border and dark lettering, slightly tilted."""
    d = ImageDraw.Draw(img)
    f = fit(d, text, max_w - 2 * pad[0], size)
    l, t, r, b = d.textbbox((0, 0), text, font=f, anchor='lt')
    w, h = r - l + 2 * pad[0], b - t + 2 * pad[1]
    plate = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle((26, 30, w + 26, h + 30), 26, fill=(0, 0, 0, 150))
    plate = plate.filter(ImageFilter.GaussianBlur(5))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle((14, 14, w + 14, h + 14), 26, fill=GOLDENROD, outline=INK, width=10)
    pd.text((14 + w / 2, 14 + h / 2), text, font=f, fill=INK, anchor='mm')
    plate = plate.rotate(tilt, resample=Image.Resampling.BICUBIC, expand=True)
    img.alpha_composite(plate, (int(cx - plate.width / 2), int(cy - plate.height / 2)))


def badge(img, cx, cy, r, tilt=12):
    """Red 'PART 2' sticker: white ring, ink outline, two-line lettering."""
    s = Image.new('RGBA', (r * 2 + 40, r * 2 + 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    c = r + 20
    d.ellipse((c - r + 8, c - r + 12, c + r + 8, c + r + 12), fill=(0, 0, 0, 140))
    s = s.filter(ImageFilter.GaussianBlur(6))
    d = ImageDraw.Draw(s)
    d.ellipse((c - r, c - r, c + r, c + r), fill=WHITE, outline=INK, width=9)
    d.ellipse((c - r + 16, c - r + 16, c + r - 16, c + r - 16), fill=RED, outline=INK, width=6)
    d.text((c, c - r * .26), 'PART', font=font(int(r * .42)), fill=WHITE, anchor='mm', stroke_width=5, stroke_fill=INK)
    d.text((c, c + r * .3), '2', font=font(int(r * .78)), fill=WHITE, anchor='mm', stroke_width=7, stroke_fill=INK)
    s = s.rotate(tilt, resample=Image.Resampling.BICUBIC, expand=True)
    img.alpha_composite(s, (int(cx - s.width / 2), int(cy - s.height / 2)))


def grade(img, top_dark=(0, 520), bottom_dark=(1380, 1920)):
    """Darken the top and bottom so the lettering pops; faces in the middle stay untouched."""
    W, H = img.size
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    for y in range(H):
        a = 0
        if y < top_dark[1]:
            a = int(150 * (1 - y / top_dark[1]) ** 1.2)
        if y > bottom_dark[0]:
            a = max(a, int(165 * ((y - bottom_dark[0]) / (bottom_dark[1] - bottom_dark[0])) ** 1.1))
        d.line((0, y, W, y), fill=(8, 6, 20, a))
    img.alpha_composite(g)


src = Image.open(ROOT / 'input/thumb_frame.jpg').convert('RGBA')

# ---- vertical 1080x1920 (Shorts) ----
v = src.copy()
grade(v)
d = ImageDraw.Draw(v)
lines = ['CONFUSED', 'WHERE TO HIDE', 'IN THE ZOMBIE', 'APOCALYPSE?']
y = 120
for i, line in enumerate(lines):
    f = fit(d, line, 980, 150 if i == 0 else 118)
    outlined(v, (540, y), line, f, '#ffd84a' if i == 0 else WHITE, stroke=11)
    y += (f.size * 1.08)
badge(v, 940, 690, 106)
banner(v, 540, 1530, 'ZOMBIE CAMPS TIER LIST', 1000, 104)
f = fit(d, 'CHOOSE YOUR CAMPS WISELY', 1000, 96)
outlined(v, (540, 1745), 'CHOOSE YOUR CAMPS WISELY', f, RED, stroke=11)
v.convert('RGB').save(OUT / 'thumbnail_vertical.jpg', quality=95)

# ---- landscape 1280x720: host + officer on the left, text panel on the right ----
L = Image.new('RGBA', (1280, 720), '#0f1230')
pic = src.crop((70, 600, 790, 1336)).resize((704, 720), Image.Resampling.LANCZOS)
L.alpha_composite(pic, (0, 0))
fade = Image.new('RGBA', (1280, 720), (0, 0, 0, 0))
fd = ImageDraw.Draw(fade)
for x in range(560, 760):
    fd.line((x, 0, x, 720), fill=(15, 18, 48, int(255 * ((x - 560) / 200) ** 1.4)))
fd.rectangle((760, 0, 1280, 720), fill=(15, 18, 48, 255))
L.alpha_composite(fade)
d = ImageDraw.Draw(L)
y = 90
for i, line in enumerate(['CONFUSED', 'WHERE TO HIDE', 'IN THE ZOMBIE', 'APOCALYPSE?']):
    f = fit(d, line, 540, 88 if i == 0 else 66)
    outlined(L, (985, y), line, f, '#ffd84a' if i == 0 else WHITE, stroke=7)
    y += f.size * 1.1
banner(L, 985, 470, 'ZOMBIE CAMPS TIER LIST', 560, 52, pad=(20, 12))
f = fit(d, 'CHOOSE YOUR CAMPS WISELY', 540, 46)
outlined(L, (985, 600), 'CHOOSE YOUR CAMPS WISELY', f, RED, stroke=7)
badge(L, 640, 105, 82)
L.convert('RGB').save(OUT / 'thumbnail_landscape.jpg', quality=95)
print('wrote', OUT / 'thumbnail_vertical.jpg', OUT / 'thumbnail_landscape.jpg')
