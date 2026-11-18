# Ricks Clips Animation Skill V1.1

## What it is
A Claude skill. It makes Ricks Clips style 3D cartoon true-story Shorts on your own PC.

How it works:
- The world is built in a three.js kit and rendered on your graphics card.
- The characters are 2D cards that stand inside the 3D world.
- The voice comes from Fish Audio.
- Captions come word by word.
- Sound is mixed from your own music and sound-effect folders.
- A colour grade finishes the film.

You ask Claude for a Short. Claude pitches true stories, writes the script, builds the film, and hands you an MP4.

## What is new in V1.1
- The lean pipeline. There is one gate for you: the whole film as a rough board, plus the hook moving. After that Claude works alone to the final.
- Each helper reads only its own slice of the rules (`rules/dept/`).
- Every fix round uses a fresh helper.
- Numbers before pictures: checks are measured first, then looked at.
- A token report for every film.
- The new look kit, kit3d:
  - PBR metal that reflects the sky.
  - Real-size relief on surfaces.
  - Painted storm skies with lightning flash.
  - Kit trees.
  - Real lightning with `fx_bolt`.
  - Hero props are built first.
- Face fixes and long-cloth fixes.
- First film made on V1.1: 716M tokens instead of 1.66B, and 8.9 hours of real work instead of 22.7 hours.

See CHANGELOG.md for the bug fixes.

## Requirements
- Claude Max or Ultra plan, with Claude Code.
- A Windows PC with an NVIDIA graphics card.
- Node.js 18 or newer.
- Python 3.11 or newer.
- ffmpeg on your PATH.
- A Fish Audio API key, saved in `%USERPROFILE%\.fish_api_key`.
- Your own music folder and your own sound-effect folder.
- Optional: your own reference clips in `references/video`. The Rick reference checks use them. They are NOT included.

## What is not included, and why
- Another creator's videos, frames and sheets. They are copyrighted.
- BlenderKit assets. They are licensed to the owner's account and cannot be passed on.
- Music and sound effects. Bring your own.
- Old working files, backups and test renders.

## Start
Read INSTALL.md. Then read START_HERE.md.

Licence: see LICENSE.txt.
