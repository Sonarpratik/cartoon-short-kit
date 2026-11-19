# Replace Part 2's score/SFX block in scripts/audio.py with Part 3's beat map.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
p = 'scripts/audio.py'; s = open(p, encoding='utf8').read()
a = s.index('# Original score (synthesized, no samples)'); b = s.index('# One gain per stem.')
new = open('work/audio_part3_block.txt', encoding='utf8').read()
s = s[:a] + new + s[b:]
s = s.replace("'music':'Original synthesized score: tense D-minor pulse, drum roll and hit on the reveal, D-major winner theme, dark drone and sting for the twist.'",
              "'music':'Original synthesized score: D-minor pulse, warm D-major safe beat, dark drones, hits on the freeze / headlights / ten men / trust, menace drums, raider toms.'")
open(p, 'w', encoding='utf8').write(s); print('ok')
