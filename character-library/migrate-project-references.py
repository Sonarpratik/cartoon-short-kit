from pathlib import Path
import shutil,json,hashlib

root=Path(__file__).resolve().parents[1]
mapping={
 'bootstrap-paradox':'projects/bootstrap-paradox/character-references/original',
 'mkultra':'projects/mkultra/character-references/original',
 'flying-dutchman':'projects/flying-dutchman/character-references/original',
 'flying-dutchman-v2':'projects/flying-dutchman/character-references/v2',
 'flying-dutchman-motion-v3':'projects/flying-dutchman/character-references/motion-v3',
 'shared':'character-library/shared',
}
def checked(relative):
 p=(root/relative).resolve()
 if not p.is_relative_to(root):raise ValueError('Path outside workspace: '+str(p))
 return p
report=[]
for name,destination in mapping.items():
 source=checked('references/characters/'+name);target=checked(destination)
 if source.exists():
  if target.exists():raise ValueError('Refusing to overwrite '+str(target))
  hashes={str(p.relative_to(source)):hashlib.sha256(p.read_bytes()).hexdigest() for p in source.rglob('*') if p.is_file()}
  target.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(source),str(target))
  assert all(hashlib.sha256((target/p).read_bytes()).hexdigest()==h for p,h in hashes.items())
  report.append({'from':str(source.relative_to(root)),'to':destination,'files':len(hashes),'hashesVerified':True})
old=checked('references/characters/cast.json');new=checked('character-library/cast.json')
if old.exists():
 if new.exists():raise ValueError('Catalog already exists')
 shutil.move(str(old),str(new))
# Shared references contain supplied media; project-owned designs stay local.
media=checked('references/user-supplied/pirate-cannonballs');media.mkdir(parents=True,exist_ok=True)
source=Path(r'C:\Users\admin\Downloads\vidssave.com Levels of Pirate Cannonballs 720P.mp4');target=media/'reference.mp4'
shutil.copy2(source,target);assert hashlib.sha256(source.read_bytes()).digest()==hashlib.sha256(target.read_bytes()).digest()
study=root/'projects/flying-dutchman/work/private-motion-study'
if study.exists():shutil.copytree(study,media/'study-frames',dirs_exist_ok=True)
(media/'provenance.json').write_text(json.dumps({'source':str(source),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'usage':'User-supplied private visual reference. Study frames are extracted from the video, not separately supplied still images. Do not publish or include in video delivery.'},indent=2))
(root/'character-library/migration-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
