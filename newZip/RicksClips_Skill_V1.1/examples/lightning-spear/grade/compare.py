# before (test) 16-frame sheet on top, graded v1 sheet below, one 1600 px image: grade/compare_v1.jpg
import os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(H, "..", "join", "out")
a = Image.open(os.path.join(O, "test_16frames.jpg")); b = Image.open(os.path.join(O, "v1_16frames.jpg"))
c = Image.new("RGB", (a.width, a.height + b.height + 6), (255, 0, 0)); c.paste(a, (0, 0)); c.paste(b, (0, a.height + 6))
ImageDraw.Draw(c).text((a.width - 120, 4), "BEFORE", fill=(255, 255, 0)); ImageDraw.Draw(c).text((a.width - 120, a.height + 10), "AFTER v1", fill=(255, 255, 0))
c.save(os.path.join(H, "compare_v1.jpg"), quality=88); print(c.size)
