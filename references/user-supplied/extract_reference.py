"""Copy a user-supplied reference video into references/user-supplied/<name>/ and extract study frames.

Usage: python extract_reference.py <video> <folder-name> [seconds-between-frames]
Writes reference.mp4, provenance.json, study-frames/fNNN.jpg and study-frames/contact.jpg (private study material).
"""
import hashlib, json, shutil, subprocess, sys
from pathlib import Path
import imageio_ffmpeg
from PIL import Image, ImageDraw

src = Path(sys.argv[1]); name = sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
out = Path(__file__).resolve().parent / name; frames = out / 'study-frames'
frames.mkdir(parents=True, exist_ok=False)
shutil.copy2(src, out / 'reference.mp4')
sha = hashlib.sha256((out / 'reference.mp4').read_bytes()).hexdigest()
ff = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-i', str(out / 'reference.mp4'), '-vf', f'fps=1/{step}', '-q:v', '3', str(frames / 'f%03d.jpg')], check=True)
files = sorted(frames.glob('f*.jpg'))
w, h = Image.open(files[0]).size
tw = 180; th = round(tw * h / w); cols = 10
sheet = Image.new('RGB', (cols * tw, ((len(files) + cols - 1) // cols) * (th + 18)), '#111')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    x, y = (i % cols) * tw, (i // cols) * (th + 18)
    sheet.paste(Image.open(f).convert('RGB').resize((tw, th)), (x, y + 18)); d.text((x + 3, y + 3), f'{f.stem} {i * step:.1f}s', fill='#ff0')
sheet.save(frames / 'contact.jpg', quality=88)
(out / 'provenance.json').write_text(json.dumps({'source': str(src), 'sha256': sha, 'frameStepSeconds': step, 'frameSize': [w, h], 'frames': len(files),
    'usage': 'User-supplied private visual reference. Study frames are extracted from the video. Do not publish or include in video delivery.'}, indent=2), encoding='utf-8')
print(out, len(files), 'frames', (w, h))
