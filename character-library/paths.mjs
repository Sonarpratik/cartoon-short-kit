import {existsSync} from 'node:fs';
// Project artwork belongs to its project. Only the reusable index is central.
export const REFERENCE_PATHS={
 'bootstrap-paradox':'projects/bootstrap-paradox/character-references/original',
 'mkultra':'projects/mkultra/character-references/original',
 'flying-dutchman':'projects/flying-dutchman/character-references/original',
 'flying-dutchman-v2':'projects/flying-dutchman/character-references/v2',
 'flying-dutchman-motion-v3':'projects/flying-dutchman/character-references/motion-v3',
 'flying-dutchman-current':'projects/flying-dutchman/character-references/current',
};
export function characterReferencePath(project){if(!/^[a-zA-Z0-9_-]+$/.test(project))throw Error('Invalid project name');return REFERENCE_PATHS[project]??`projects/${project}/character-references/original`;}
// Renderer the Studio uses for a project's characters: explicit version aliases first, then the archived
// final rig (character-references/final, written by archive-project-code.mjs), then original.
export function characterRendererPath(project,root=new URL('../',import.meta.url)){
 if(REFERENCE_PATHS[project])return REFERENCE_PATHS[project];
 const final=`projects/${characterReferencePath(project).split('/')[1]}/character-references/final`;
 return existsSync(new URL(final+'/engine/character-rig.ts',root))?final:characterReferencePath(project);
}
