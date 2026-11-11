import { Pen } from './engine/toon';

export const FACE_COLOR = '#faf9f5';
export const FACE_SHADOW = '#e9e6ef';

// Keep clothing gradients; substitute only the off-white facial edge shade.
export class CharacterPen extends Pen {
  override shadedFill(...args: Parameters<Pen['shadedFill']>) {
    if (args[1] === FACE_COLOR) args[2] = FACE_SHADOW;
    super.shadedFill(...args);
  }
}
