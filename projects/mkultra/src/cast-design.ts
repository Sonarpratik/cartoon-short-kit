import {CHARACTER_ARCHETYPES} from './engine/director';
import type {Outfit} from './engine/toon';
export type CharacterKind='civilian'|'researcher'|'official'|'investigator'|'archivist';
export const CAST_DESIGNS:Record<CharacterKind,{name:string;seed:number;outfit:Outfit}>={
 civilian:{name:'Civilian',seed:3,outfit:{...CHARACTER_ARCHETYPES.civilian}},
 researcher:{name:'Researcher',seed:5,outfit:{...CHARACTER_ARCHETYPES.researcher}},
 official:{name:'Official',seed:12,outfit:{...CHARACTER_ARCHETYPES.official}},
 investigator:{name:'Investigator',seed:9,outfit:{...CHARACTER_ARCHETYPES.investigator}},
 archivist:{name:'Archivist',seed:6,outfit:{...CHARACTER_ARCHETYPES.archivist}},
};
