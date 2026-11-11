# Reusable detailed interior

This library is independent of projects/mkultra and has no imports from that project. It preserves the detailed room, window geometry, palettes and furniture used while developing the user's preferred look.

- world.ts: room(), setLight(), warm/lab/night/archive palettes, wood/tile floors, window frames, wall panels and stocked shelves.
- props.ts: detailed desks with drawers/pulls/stretchers, chairs, cabinets, shelves, bottles, cups, papers, lamps, recorder and shredder helpers.
- types.ts: palette names.

The library imports the shared paint, shade, lighting and ink helpers from ../bridge. A new project should copy these room/prop modules locally with the shared engine, then adjust import paths to its layout. Also copy the current ../bridge/director.ts and use CharacterPen, cardShade and cameraJourney for the character and camera defaults.

Set up the directional key consistently with the window projector: position(-12,3.4,7.2), target(0,1,0), shadows enabled. Call setLight for the current palette each frame. See ../../references/lighting-guide.md for the opening geometry, shadow handling and source alignment. Reuse the post-processing setup from the source example if needed; room() alone does not set up the browser renderer or composer.

Adapt props, labels, storage and room dimensions to the new story rather than reusing an identical room everywhere. The generic defaults use RECORDS and SAMPLE. No external assets or narration are included.
