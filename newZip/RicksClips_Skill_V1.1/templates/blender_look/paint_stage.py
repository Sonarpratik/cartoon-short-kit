"""Painted 2x textures for Stage A (system Python + PIL): soft, tonal, with wear. Output to tex/."""
import os, random
from PIL import Image, ImageDraw, ImageFilter
T = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex"); os.makedirs(T, exist_ok=True)
S = 2048
def base(c, tones, n, a, b, seed, blur):
    r = random.Random(seed); im = Image.new("RGB", (S, S), c); d = ImageDraw.Draw(im)
    for k in range(n):
        x, y, R = r.uniform(0, S), r.uniform(0, S), r.uniform(a, b); d.ellipse([x - R, y - R * .7, x + R, y + R * .7], fill=r.choice(tones))
    return im.filter(ImageFilter.GaussianBlur(blur)), r
def save(im, n, blur=2.0): im.filter(ImageFilter.GaussianBlur(blur)).save(os.path.join(T, n + ".png"))
def cobble():
    im, r = base((122, 118, 118), [(112, 108, 112), (134, 128, 122), (118, 120, 126)], 60, 200, 420, 1, 70); d = ImageDraw.Draw(im); step = 120
    for j in range(-1, S // step + 2):
        for i in range(-1, S // step + 2):
            x, y = i * step + (j % 2) * step / 2 + r.uniform(-12, 12), j * step + r.uniform(-10, 10); w, h = r.uniform(46, 58), r.uniform(44, 56); c = r.choice([(150, 144, 140), (136, 134, 136), (162, 154, 142), (128, 130, 142), (146, 136, 124)])
            d.rounded_rectangle([x - w, y - h, x + w, y + h], radius=26, fill=c, outline=(104, 100, 106), width=8); d.ellipse([x - w * .5, y - h * .55, x + w * .2, y - h * .1], fill=tuple(min(255, v + 14) for v in c))
    save(im, "cobble_tile")
def deck():
    im, r = base((128, 100, 78), [(118, 92, 72), (140, 110, 84), (108, 88, 74)], 40, 200, 420, 2, 60); d = ImageDraw.Draw(im); pw = S // 8
    for j in range(9):
        y = j * pw; c = r.choice([(136, 106, 80), (122, 96, 76), (148, 116, 86), (114, 92, 78)]); d.rectangle([0, y + 5, S, y + pw - 5], fill=c); d.line([(0, y), (S, y)], fill=(54, 42, 40), width=10)
        for k in range(26): x = r.uniform(0, S); yy = y + r.uniform(12, pw - 12); d.line([(x, yy), (x + r.uniform(80, 340), yy + r.uniform(-5, 5))], fill=tuple(v - 16 for v in c), width=3)
        for x in range(120, S, 512): d.ellipse([x - 9, y + 20, x + 9, y + 38], fill=(52, 48, 50)); d.ellipse([x - 9, y + pw - 40, x + 9, y + pw - 22], fill=(52, 48, 50))
    for k in range(22): x, y, R = r.uniform(0, S), r.uniform(0, S), r.uniform(30, 90); d.ellipse([x - R, y - R * .5, x + R, y + R * .5], fill=(98, 90, 92))
    save(im, "deck_tile")
def plaster():
    im, r = base((208, 194, 170), [(196, 180, 156), (220, 208, 184), (186, 172, 156)], 90, 90, 300, 3, 45); d = ImageDraw.Draw(im)
    for k in range(70): x, y = r.uniform(0, S), r.uniform(0, S); d.line([(x, y), (x + r.uniform(-30, 30), y + r.uniform(60, 240))], fill=(168, 152, 134), width=int(r.uniform(4, 10)))
    for k in range(26):
        x, y, w = r.uniform(0, S), r.uniform(0, S), r.uniform(70, 170); d.rectangle([x, y, x + w, y + w * .55], fill=(150, 92, 72))
        for a in range(3):
            d.line([(x, y + a * w * .18), (x + w, y + a * w * .18)], fill=(190, 172, 152), width=5)
    save(im, "plaster_tile")
def brick():
    im, r = base((144, 84, 66), [(134, 78, 62), (156, 94, 72)], 30, 200, 400, 4, 60); d = ImageDraw.Draw(im); h = 74; w = 170
    for j in range(S // h + 1):
        for i in range(-1, S // w + 2):
            x = i * w + (j % 2) * w / 2; c = r.choice([(156, 90, 70), (142, 80, 64), (170, 104, 78), (128, 76, 66), (150, 96, 84)]); d.rectangle([x + 5, j * h + 5, x + w - 5, j * h + h - 5], fill=c)
    save(im, "brick_tile", 1.6)
def roof():
    im, r = base((136, 72, 54), [(124, 66, 52), (150, 82, 60)], 30, 200, 400, 5, 60); d = ImageDraw.Draw(im); h = 128; w = 128
    for j in range(S // h + 1):
        for i in range(-1, S // w + 2):
            x = i * w + (j % 2) * w / 2; c = r.choice([(150, 80, 58), (134, 72, 56), (164, 94, 66), (120, 70, 62), (112, 92, 78)]); d.rounded_rectangle([x + 5, j * h, x + w - 5, j * h + h + 26], radius=38, fill=c, outline=(82, 46, 44), width=6)
    save(im, "roof_tile", 1.6)
def straw():
    im, r = base((206, 168, 88), [(190, 152, 78), (220, 184, 102), (176, 140, 74)], 50, 150, 360, 6, 50); d = ImageDraw.Draw(im)
    for k in range(26000):
        x, y = r.uniform(0, S), r.uniform(0, S); L = r.uniform(40, 150); c = r.choice([(232, 200, 120), (168, 130, 66), (214, 176, 94), (190, 150, 76)]); d.line([(x, y), (x + r.uniform(-30, 30), y + L)], fill=c, width=3)
    save(im, "straw_tile", 2.4)
def water():
    im, r = base((52, 92, 112), [(44, 82, 106), (62, 108, 122), (40, 76, 98)], 90, 100, 380, 7, 50); d = ImageDraw.Draw(im)
    for k in range(900):
        x, y = r.uniform(0, S), r.uniform(0, S); L = r.uniform(40, 200); d.arc([x, y, x + L, y + 24], 200, 340, fill=r.choice([(120, 164, 176), (88, 130, 148), (150, 186, 190)]), width=5)
    save(im, "water_tile", 2.0)
if __name__ == "__main__":
    for f in (cobble, deck, plaster, brick, roof, straw, water): f(); print("painted", f.__name__)
