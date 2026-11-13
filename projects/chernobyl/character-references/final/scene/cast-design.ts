import {CHARACTER_ARCHETYPES} from './engine/director';
import type {Outfit} from './engine/toon';
export type CharacterKind='civilian'|'researcher'|'official'|'investigator'|'archivist'|'father'|'child'|'plantOperator'|'engineer'|'shiftLead'|'labAssistant'|'labClerk';
export const CAST_DESIGNS:Record<CharacterKind,{name:string;seed:number;outfit:Outfit}>={
 plantOperator:{name:'Plant operator',seed:8,outfit:{...CHARACTER_ARCHETYPES.civilian,hat:'hair',hair:'#695844',hairStyle:'sidepart',jacket:'#8caaa7',pants:'#536b72'}},
 engineer:{name:'Shift engineer',seed:20,outfit:{...CHARACTER_ARCHETYPES.civilian,hat:'hair',hair:'#918b76',hairStyle:'receding',jacket:'#c3c6aa',pants:'#4e6873'}},
 shiftLead:{name:'Shift supervisor',seed:12,outfit:{...CHARACTER_ARCHETYPES.official,hat:'hair',hair:'#776b5e',hairStyle:'sidepart',jacket:'#557b88'}},
 labAssistant:{name:'Laboratory assistant',seed:15,outfit:{...CHARACTER_ARCHETYPES.researcher,hat:'hair',hair:'#86533b',hairStyle:'bob',moustache:undefined,jacket:'#e3e4cb'}},
 labClerk:{name:'Radiation office clerk',seed:29,outfit:{...CHARACTER_ARCHETYPES.official,hat:'hair',hair:'#584c3f',hairStyle:'sidepart',moustache:undefined,jacket:'#7e9994'}},
 father:{name:'Pripyat father',seed:19,outfit:{...CHARACTER_ARCHETYPES.civilian,hat:'hair',hair:'#63452f',hairStyle:'sidepart',moustache:'#59402e',jacket:'#a5794c',pants:'#3f5663'}},
 child:{name:'Pripyat child',seed:17,outfit:{...CHARACTER_ARCHETYPES.civilian,hat:'hair',hair:'#b87c3e',hairStyle:'sidepart',jacket:'#749cae',pants:'#4d6279'}},
 civilian:{name:'Pripyat resident',seed:3,outfit:{...CHARACTER_ARCHETYPES.civilian}},
 researcher:{name:'Radiation technician',seed:5,outfit:{...CHARACTER_ARCHETYPES.researcher}},
 official:{name:'Official',seed:12,outfit:{...CHARACTER_ARCHETYPES.official}},
 investigator:{name:'Reactor operator',seed:9,outfit:{...CHARACTER_ARCHETYPES.civilian,jacket:'#93b4ad',hat:'cap',cap:'#b5c4b5'}},
 archivist:{name:'Pripyat mother',seed:6,outfit:{...CHARACTER_ARCHETYPES.archivist}},
};
