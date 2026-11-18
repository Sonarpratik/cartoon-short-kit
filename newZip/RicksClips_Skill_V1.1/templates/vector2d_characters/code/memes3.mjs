// v2 face sets hub (CB 22:28): TEEN, VILLAIN, MONSTER. Use in a cast spec as face: ['teen', name] / ['villain', name] / ['monster', name].
import { TEEN, TEEN_DEFS } from './faces_teen.mjs';
import { VILLAIN, VILLAIN_DEFS } from './faces_villain.mjs';
import { MONSTER, MONSTER_DEFS } from './faces_monster.mjs';
import { memes2Defs } from './memes2.mjs';
export { TEEN, VILLAIN, MONSTER };
export const memes3Defs = () => memes2Defs() + TEEN_DEFS + VILLAIN_DEFS + MONSTER_DEFS;
