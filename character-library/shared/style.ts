// Shared art direction. Keep these defaults when creating a new story.
export const STYLE = {
  character: { outline: 4.15, outlineTaper: 0.5, headVariation: 0.14, tiltDegrees: 10 },
  ink: { color: '#241e28', near: 3.2, far: 1.8, crease: 0.55, farOpacity: 0.65 },
  lens: { strength: 0.55, maxCoC: 8 },
  paint: { grainLines: 8, figureLines: 2, stoneSpeckles: 5, grassTufts: 480 },
} as const;
