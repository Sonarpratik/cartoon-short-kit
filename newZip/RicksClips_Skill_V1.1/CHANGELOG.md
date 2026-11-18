# Changelog

## V1.1 (2026-11-15)

### New
- The lean pipeline: one gate for the user (whole film rough board plus the hook moving), then Claude works alone to the final.
- Rule slices per helper (`rules/dept/`).
- A fresh helper for every fix round.
- Numbers before pictures.
- A token report for every film.
- The look kit kit3d:
  - PBR metal with the sky as reflection.
  - Real-size relief surfaces.
  - Painted storm skies with flash.
  - Kit trees.
  - Real lightning, `fx_bolt`.
  - Hero props built first.
- Face fixes and long-cloth fixes.
- First film on V1.1: 716M tokens instead of 1.66B. 8.9 hours of real work instead of 22.7 hours.

### Bug fixes
- `castkit` ignored `faceShadow`. Fixed.
- `costume_shade` darkened white drawn pixels. Fixed with `keep_drawn_light`.
- Legs are now drawn over long cloth in moves.
- GPU render is now the default (`render_gpu.mjs`).

### Known issue
- The storm sky goes black at a long lens.
