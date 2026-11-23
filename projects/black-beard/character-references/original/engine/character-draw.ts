// One entry point for drawing ANY character on its card canvas (600 x 1000 design space, feet near y = 975).
//  - Ricks Clips characters (design.rc) and our characters on the Ricks Clips look (design.look === 'ricks') are drawn by
//    the puppet engine (puppet.ts: 4 views, figure sizes, face categories x emotions, props, 195 moves + our walks).
//  - every other design is drawn by our 12-angle rig (character-rig.ts).
// The puppet engine needs the Ricks Clips kit code: the project's vite.config aliases /vendor/rc to
// newZip/RicksClips_Skill_V1.1/templates (templates/vite.puppet.config.mjs). Personal-use licence: keep the repo private.
//
// Frame-exact capture: puppet frames decode asynchronously, so a player's renderFrame(f) should be
//   api.renderFrame = f => settleFrame(() => drawFrame(f));
// and the capture scripts' `await page.evaluate(f => window.renderFrame(f), f)` then waits for a finished frame.
import { drawCharacter as rigDraw } from './character-rig';
import { drawCharacter as puppetDraw, puppetBusy, puppetSettled } from './puppet';

export const usesPuppet = (d: any) => !!d?.rc || d?.look === 'ricks';

/** Draws any character: the puppet engine or our rig, chosen by the design. Same pose fields for both
 *  (yaw, pitch, time, action, expression, fromExpression, expressionAge, micro, light). */
export function drawAnyCharacter(g: CanvasRenderingContext2D, design: any, pose: any = {}) {
  (usesPuppet(design) ? puppetDraw : rigDraw)(g, design, pose);
}

/** Draw a frame, then redraw until every puppet image it asked for has decoded (at most `rounds` redraws). */
export async function settleFrame(draw: () => void, rounds = 8) {
  draw();
  await settleAfter(draw, rounds);
}
/** The frame is already drawn: redraw until its puppet images have decoded. */
async function settleAfter(redraw: () => void, rounds = 8) {
  for (let i = 0; i < rounds && puppetBusy(); i++) { await puppetSettled(); redraw(); }
}
// The shared player (player.ts) calls this hook after drawing each frame, so any short whose scene code imports this
// module gets frame-exact capture without changing its player.
(globalThis as any).__puppetSettle = (redraw: () => void) => settleAfter(redraw);
