from pathlib import Path
root=Path(__file__).resolve().parents[1]
replacements={
 'references/characters/bootstrap-paradox':'projects/bootstrap-paradox/character-references/original',
 'references/characters/flying-dutchman-motion-v3':'projects/flying-dutchman/character-references/motion-v3',
 'references/characters/flying-dutchman-v2':'projects/flying-dutchman/character-references/v2',
 'references/characters/flying-dutchman':'projects/flying-dutchman/character-references/original',
 'references/characters/mkultra':'projects/mkultra/character-references/original',
 'references/characters/shared':'character-library/shared',
 'references/characters/cast.json':'character-library/cast.json',
 'references/characters/<project>/':'projects/<project>/character-references/original/',
}
paths=[root/'SKILL.md',root/'README.md',root/'references/character-motion.md',root/'character-library/README.md']
paths += [p for folder in ['character-library','character-studio','projects/flying-dutchman/scripts'] for p in (root/folder).glob('*.mjs') if p.name not in ['paths.mjs']]
for p in paths:
 s=p.read_text(encoding='utf-8');updated=s
 for old,new in replacements.items():updated=updated.replace(old,new)
 if updated!=s:p.write_text(updated,encoding='utf-8')
# Future projects store their selected renderer/cast and sheets locally.
p=root/'character-library/snapshot.mjs';s=p.read_text();s=s.replace("console.log('Preserved cast", "await mkdir(join(actual,'character-references','original'),{recursive:true});\nawait writeFile(join(actual,'character-references','original','cast-design.json'),JSON.stringify({schemaVersion:1,characters},null,2)+'\\n');\nconsole.log('Preserved cast");p.write_text(s)
print('Updated current tools and workflow documentation to project-owned references.')
