"""Fine-pass ground paintings (2026-11-07, coordinator brief "finer surface painting"): 2048 px per tile (half the texel
size of v1), thinner softer strokes, painted tonal variation in big soft patches, worn edges on ruts and puddles.
Measured target: surface high-frequency energy in the reference night band (quality_metrics.py hf_surface <= 0.30)."""
import os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
T = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")

def soft_patches(size, base, tones, n, rmin, rmax, seed, blur):
    r = random.Random(seed); im = Image.new("RGB", (size, size), base); d = ImageDraw.Draw(im)
    for k in range(n):
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(rmin, rmax)
        d.ellipse([x - rr, y - rr * 0.6, x + rr, y + rr * 0.6], fill=r.choice(tones))
    return im.filter(ImageFilter.GaussianBlur(blur))

def grass_tile2(size=2048, seed=12):
    r = random.Random(seed)
    im = soft_patches(size, (74, 112, 108), [(86, 116, 104), (64, 100, 104), (96, 124, 108), (70, 96, 98)], 60, 120, 380, seed, 60)
    d = ImageDraw.Draw(im)
    for k in range(52000):  # thin blades, tonal (not black/white) so they read as texture, not noise
        x, y = r.uniform(0, size), r.uniform(0, size); L = r.uniform(14, 40)
        c = r.choice([(58, 92, 94), (96, 140, 122), (70, 110, 104), (108, 150, 128), (62, 98, 98)])
        d.line([(x, y), (x + r.uniform(-8, 8), y - L)], fill=c, width=2)
    for k in range(320):  # clover and small flowers
        x, y = r.uniform(0, size), r.uniform(0, size); c = r.choice([(210, 214, 200), (230, 206, 110), (186, 190, 220)]); d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=c)
    for k in range(70):  # bare earth patches with soft worn rims
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(18, 46)
        d.ellipse([x - rr * 1.25, y - rr * 0.7, x + rr * 1.25, y + rr * 0.7], fill=(78, 92, 92)); d.ellipse([x - rr, y - rr * 0.5, x + rr, y + rr * 0.5], fill=(70, 72, 82))
    im.filter(ImageFilter.GaussianBlur(3.0)).save(os.path.join(T, "grass_tile2.png"))

def mud_tile2(size=2048, seed=21):
    r = random.Random(seed)
    im = soft_patches(size, (104, 98, 102), [(90, 84, 92), (118, 110, 108), (98, 100, 98), (84, 80, 90)], 70, 120, 360, seed, 50)
    d = ImageDraw.Draw(im)
    for k in range(6):  # tyre ruts: dark trough + lighter worn rim + tread marks
        x0 = r.uniform(0, size); x1 = x0 + r.uniform(-120, 120)
        for dx in (0, 180):
            d.line([(x0 + dx, 0), (x1 + dx, size)], fill=(112, 104, 104), width=70)
            d.line([(x0 + dx, 0), (x1 + dx, size)], fill=(70, 64, 74), width=46)
            for y in range(0, size, 40):
                xx = x0 + dx + (x1 - x0) * y / size; d.line([(xx - 18, y), (xx + 18, y + 12)], fill=(84, 78, 86), width=6)
    for k in range(160):  # boot prints
        x, y = r.uniform(0, size), r.uniform(0, size)
        d.ellipse([x - 16, y - 30, x + 16, y + 30], fill=(80, 74, 84)); d.ellipse([x - 12, y + 34, x + 12, y + 54], fill=(80, 74, 84))
    for k in range(18):  # puddles with moonlit sky reflection and a muddy rim
        x, y, rr = r.uniform(0, size), r.uniform(0, size), r.uniform(60, 150)
        d.ellipse([x - rr * 1.1, y - rr * 0.52, x + rr * 1.1, y + rr * 0.52], fill=(76, 70, 80)); d.ellipse([x - rr, y - rr * 0.45, x + rr, y + rr * 0.45], fill=(78, 90, 140))
        d.ellipse([x - rr * 0.6, y - rr * 0.22, x + rr * 0.2, y - rr * 0.08], fill=(150, 160, 210))
    for k in range(700):  # straw
        x, y = r.uniform(0, size), r.uniform(0, size); d.line([(x, y), (x + r.uniform(-26, 26), y + r.uniform(-26, 26))], fill=(176, 156, 100), width=3)
    im.filter(ImageFilter.GaussianBlur(3.0)).save(os.path.join(T, "mud_tile2.png"))

if __name__ == "__main__":
    grass_tile2(); mud_tile2(); print("painted v2")
