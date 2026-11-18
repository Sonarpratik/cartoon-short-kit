"""Painted textures for the density test (system Python + PIL; Blender only loads the PNGs).
DENSITY LAW B: every surface gets pattern + wear. Fields with furrows + hedges + ruts, grass with tufts + tyre ruts,
tent canvas with seams + patches + stains, crate planks with nail heads + stencil blocks, drums with bands + rust,
sandbag burlap weave, a cratered moon, cirrus streaks."""
import os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

T = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")
os.makedirs(T, exist_ok=True)


def ground_camp(size=2048, seed=43):
    rng = np.random.default_rng(seed); n = 160
    seeds = rng.uniform(0, size, (n, 2)); yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    best = np.full((size, size), 1e12, np.float32); fid = np.zeros((size, size), np.int32)
    for i, (sx, sy) in enumerate(seeds):
        d = (xx - sx) ** 2 + (yy - sy) ** 2; m = d < best; best[m] = d[m]; fid[m] = i
    tones = np.array([(70, 92, 104), (80, 98, 96), (60, 80, 98), (90, 102, 112), (66, 90, 82), (96, 106, 100), (74, 86, 110)], np.float32)
    img = tones[rng.integers(0, len(tones), n)][fid]
    a = rng.uniform(0, np.pi, n)[fid]; per = rng.uniform(6, 11, n)[fid]
    img = img + (np.sin((xx * np.cos(a) + yy * np.sin(a)) * 2 * np.pi / per) * 10)[..., None]
    img = img + rng.normal(0, 6, (size, size))[..., None]
    edge = np.zeros((size, size), bool); edge[:-1] |= fid[:-1] != fid[1:]; edge[:, :-1] |= fid[:, :-1] != fid[:, 1:]
    e = np.asarray(Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    img[e] = (32, 44, 50)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im); r = random.Random(seed)
    for k in range(900):
        y, x = r.randrange(size), r.randrange(size)
        if e[y, x]:
            d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(28, 40, 46))
    c = size / 2
    d.rounded_rectangle([c - 520, c - 520, c + 520, c + 520], radius=60, fill=(86, 90, 100))
    for k in range(400):
        x0, y0 = r.uniform(c - 500, c + 500), r.uniform(c - 500, c + 500); dx, dy = r.uniform(-90, 90), r.uniform(-90, 90)
        d.line([(x0, y0), (x0 + dx, y0 + dy)], fill=(56, 58, 68), width=5)
        d.line([(x0 + 6, y0), (x0 + dx + 6, y0 + dy)], fill=(56, 58, 68), width=5)
        if k % 7 == 0:
            d.ellipse([x0 - 14, y0 - 8, x0 + 14, y0 + 8], fill=(118, 128, 160))
    for k in range(3):
        pts = []; x = r.uniform(0, size); y = 0
        while y < size + 200:
            pts.append((x, y)); x += r.uniform(-90, 90); y += r.uniform(80, 160)
        d.line(pts, fill=(124, 126, 132), width=18, joint="curve"); d.line(pts, fill=(98, 100, 108), width=6, joint="curve")
    im.filter(ImageFilter.GaussianBlur(0.7)).save(os.path.join(T, "ground_camp.png"))


def grass_field(size=2048, seed=11):
    r = random.Random(seed); im = Image.new("RGB", (size, size), (44, 70, 74)); d = ImageDraw.Draw(im)
    for k in range(26000):
        x, y = r.uniform(0, size), r.uniform(0, size)
        c = r.choice([(36, 58, 64), (52, 80, 82), (40, 64, 70), (58, 86, 84), (70, 96, 88)])
        d.line([(x, y), (x + r.uniform(-4, 4), y - r.uniform(6, 18))], fill=c, width=2)
    for k in range(140):
        x, y = r.uniform(0, size), r.uniform(0, size); d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(150, 160, 170))
        if k % 5 == 0:
            d.ellipse([x - 16, y - 10, x + 16, y + 10], fill=(60, 58, 62))
    c = size / 2
    d.rectangle([c - 110, 0, c + 110, size], fill=(70, 86, 86))
    for dx in (-70, 70):
        d.line([(c + dx, 0), (c + dx + 10, size)], fill=(40, 52, 56), width=14)
    for k in range(300):
        y = r.uniform(0, size); d.line([(c - 100, y), (c - 100 + r.uniform(20, 200), y + r.uniform(-4, 4))], fill=(60, 74, 76), width=3)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(T, "grass_field.png"))


def canvas(size=1024, seed=5):
    r = random.Random(seed); im = Image.new("RGB", (size, size), (168, 170, 140)); d = ImageDraw.Draw(im)
    for x in range(0, size, 128):
        d.line([(x, 0), (x, size)], fill=(130, 132, 108), width=6); d.line([(x + 8, 0), (x + 8, size)], fill=(186, 188, 160), width=2)
    for k in range(14):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(30, 120)
        d.ellipse([x - rr, y - rr * 0.6, x + rr, y + rr * 0.6], fill=(150, 146, 118))
    for k in range(10):
        x, y = r.uniform(0, size - 140), r.uniform(0, size - 140); w, h = r.uniform(60, 140), r.uniform(50, 120)
        d.rectangle([x, y, x + w, y + h], fill=(150, 150, 118), outline=(110, 110, 90), width=4)
        for s in range(0, int(w), 14):
            d.line([(x + s, y - 4), (x + s + 4, y + 4)], fill=(90, 90, 74), width=2)
    im.filter(ImageFilter.GaussianBlur(1.2)).save(os.path.join(T, "canvas.png"))


def planks(size=512, seed=6):
    r = random.Random(seed); im = Image.new("RGB", (size, size), (150, 116, 76)); d = ImageDraw.Draw(im)
    for y in range(0, size, 64):
        d.rectangle([0, y, size, y + 60], fill=r.choice([(150, 116, 76), (136, 104, 68), (160, 126, 84)]))
        d.line([(0, y + 62), (size, y + 62)], fill=(70, 50, 34), width=5)
        for k in range(6):
            xx = r.uniform(0, size); d.line([(xx, y + 6), (xx + r.uniform(40, 120), y + 6 + r.uniform(-3, 3))], fill=(120, 90, 60), width=2)
        for xx in (14, size - 14):
            d.ellipse([xx - 4, y + 26, xx + 4, y + 34], fill=(40, 36, 34))
    d.rectangle([150, 200, 360, 310], outline=(40, 40, 38), width=8)
    for k in range(4):
        d.rectangle([170 + k * 46, 230, 200 + k * 46, 280], fill=(40, 40, 38))
    im.save(os.path.join(T, "planks.png"))


def drum(size=512, seed=7):
    r = random.Random(seed); im = Image.new("RGB", (size, size), (96, 100, 80)); d = ImageDraw.Draw(im)
    for y in (size * 0.3, size * 0.7):
        d.rectangle([0, y - 10, size, y + 10], fill=(70, 72, 60))
    for k in range(60):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(4, 22); d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(120, 80, 50))
    for k in range(20):
        x = r.uniform(0, size); d.line([(x, 0), (x + r.uniform(-6, 6), r.uniform(60, 200))], fill=(80, 70, 56), width=3)
    im.filter(ImageFilter.GaussianBlur(1.0)).save(os.path.join(T, "drum.png"))


def burlap(size=512, seed=8):
    a = np.zeros((size, size, 3), np.float32) + (150, 132, 98)
    yy, xx = np.mgrid[0:size, 0:size]; a += ((np.sin(xx / 3.0) * np.sin(yy / 3.0)) * 14)[..., None]
    a += np.random.default_rng(seed).normal(0, 8, (size, size, 1))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for y in range(40, size, 120):
        d.line([(0, y), (size, y)], fill=(100, 86, 64), width=6)
    im.save(os.path.join(T, "burlap.png"))


def moon(size=1024, seed=7):
    r = random.Random(seed); im = Image.new("RGB", (size, size), (255, 246, 222)); d = ImageDraw.Draw(im)
    for k in range(9):
        x, y, rr = r.uniform(200, 820), r.uniform(200, 820), r.uniform(60, 190); d.ellipse([x - rr, y - rr * 0.8, x + rr, y + rr * 0.8], fill=(214, 210, 214))
    for k in range(40):
        x, y, rr = r.uniform(120, 900), r.uniform(120, 900), r.uniform(8, 30); d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(222, 214, 210), width=4)
    im.filter(ImageFilter.GaussianBlur(6)).save(os.path.join(T, "moon.png"))


def cirrus(w=2048, h=512, seed=3):
    r = random.Random(seed); im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(140):
        x, y = r.uniform(-200, w), r.uniform(40, h - 40); L = r.uniform(200, 700)
        d.line([(x, y), (x + L, y + r.uniform(-20, 20))], fill=(196, 200, 240, int(r.uniform(70, 170))), width=int(r.uniform(3, 12)))
    im.filter(ImageFilter.GaussianBlur(4)).save(os.path.join(T, "cirrus.png"))


def grass_tile(size=1024, seed=12):
    """high-contrast tiling turf (tile = 12 m): blade strokes, clover, dandelions, pebbles, bare patches, cart ruts."""
    r = random.Random(seed); im = Image.new("RGB", (size, size), (70, 110, 108)); d = ImageDraw.Draw(im)
    for k in range(30):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(30, 90); d.ellipse([x - rr, y - rr * 0.6, x + rr, y + rr * 0.6], fill=r.choice([(96, 104, 100), (58, 92, 96), (110, 130, 110)]))
    for k in range(9000):
        x, y = r.uniform(0, size), r.uniform(0, size); c = r.choice([(30, 56, 62), (96, 150, 130), (50, 86, 90), (120, 170, 140), (40, 70, 76)])
        d.line([(x, y), (x + r.uniform(-5, 5), y - r.uniform(8, 22))], fill=c, width=3)
    for k in range(260):
        x, y = r.uniform(0, size), r.uniform(0, size); c = r.choice([(236, 236, 220), (250, 220, 90), (200, 200, 230)]); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=c)
    for k in range(160):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(4, 10); d.ellipse([x - rr, y - rr * 0.7, x + rr, y + rr * 0.7], fill=(150, 150, 160), outline=(30, 30, 40), width=2)
    for k in range(80):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(10, 26); d.ellipse([x - rr, y - rr * 0.5, x + rr, y + rr * 0.5], fill=(26, 40, 50))
    im.save(os.path.join(T, "grass_tile.png"))


def mud_tile(size=1024, seed=21):
    """camp mud (tile = 10 m): tyre ruts, boot prints, puddles with moon glints, stones, straw, a lost glove."""
    r = random.Random(seed); im = Image.new("RGB", (size, size), (104, 96, 100)); d = ImageDraw.Draw(im)
    for k in range(40):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(40, 120); d.ellipse([x - rr, y - rr * 0.6, x + rr, y + rr * 0.6], fill=r.choice([(86, 80, 88), (120, 110, 108), (96, 100, 96)]))
    for k in range(6):
        x0 = r.uniform(0, size)
        for dx in (0, 90):
            d.line([(x0 + dx, 0), (x0 + dx + r.uniform(-60, 60), size)], fill=(56, 50, 60), width=26)
            for y in range(0, size, 22): d.line([(x0 + dx - 12, y), (x0 + dx + 12, y + 8)], fill=(76, 70, 78), width=4)
    for k in range(120):
        x, y = r.uniform(0, size), r.uniform(0, size); a = r.uniform(0, 6.28)
        d.ellipse([x - 10, y - 18, x + 10, y + 18], fill=(60, 54, 62)); d.ellipse([x - 7, y + 20, x + 7, y + 32], fill=(60, 54, 62))
    for k in range(14):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(30, 80); d.ellipse([x - rr, y - rr * 0.45, x + rr, y + rr * 0.45], fill=(70, 86, 140), outline=(40, 36, 46), width=5)
        d.line([(x - rr * 0.5, y - rr * 0.1), (x + rr * 0.3, y - rr * 0.1)], fill=(200, 210, 250), width=4)
    for k in range(300):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(3, 9); d.ellipse([x - rr, y - rr * 0.7, x + rr, y + rr * 0.7], fill=(160, 156, 160), outline=(36, 32, 40), width=2)
    for k in range(500):
        x, y = r.uniform(0, size), r.uniform(0, size); d.line([(x, y), (x + r.uniform(-14, 14), y + r.uniform(-14, 14))], fill=(196, 170, 100), width=2)
    im.save(os.path.join(T, "mud_tile.png"))


if __name__ == "__main__":
    for fn in (ground_camp, grass_field, grass_tile, mud_tile, canvas, planks, drum, burlap, moon, cirrus):
        fn(); print("painted", fn.__name__)
