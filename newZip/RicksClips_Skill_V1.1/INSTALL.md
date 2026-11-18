# Install

1. Unzip the release to a folder with no special characters in the path. Example: `C:\RicksClips_Skill_V1.1`.
2. Install the three.js kit packages:
   ```
   cd templates/threejs_film
   npm install
   ```
3. Install the Python packages:
   ```
   pip install pillow numpy faster-whisper
   ```
4. Check ffmpeg: type `ffmpeg -version`. If it fails, install ffmpeg and add it to PATH.
5. Save your Fish Audio key. Make a file `%USERPROFILE%\.fish_api_key`. Put the key on the first line. Nothing else.
6. Set your sound folders. Some files hold the placeholders `<YOUR_SFX_FOLDER>` and `<YOUR_MUSIC_FOLDER>`. Replace them with your real folders. The files are:
   - `CB_RULES.md` and `rules/CB_RULES.md`
   - `SKILL.md`
   - `agents/sound-designer.md`
   - `rules/dept/lead.md`, `sound-designer.md`, `camera-director.md`, `stretch-builder.md`, `vfx-artist.md`, `background-painter.md`
   - `examples/lightning-spear/sound/clipdefs.py`

   Do this step before step 7 if you want the installed copy to show your folders.
7. Run the installer from the skill folder:
   ```
   python install.py
   ```
   It fills in the real path of this folder (`<SKILL_ROOT>`) in every text file. It installs the skill to `~/.claude/skills/ricks-clips-v1-1/` and the agents to `~/.claude/agents/`. It prints what it did. You can run it again any time. It also works after you move the folder.
8. Open Claude Code in the skill folder. Paste this first prompt:

   > Read START_HERE.md, then make me a new Ricks Clips style short. Pitch me three true stories first.
