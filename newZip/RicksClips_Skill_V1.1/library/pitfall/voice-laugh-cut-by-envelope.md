# Pitfall: cutting a laugh out of a voice take by whisper's word times leaves part of it in

**Seen:** goldrush, 2026-11-14. A [laughing] tag turned "He's" into "hee hee hee" right after a shouted "Gold!". The first fix cut from whisper's "Hee" (4.36 s); the laugh really started at 4.08 s, so two laugh bursts stayed in and CB had to ask twice.
**Why:** whisper squeezes shouts and laughs (it put "Gold!" at 3.92-3.94 s); its word times are not the edges of non-speech sounds.
**Fix:** before any splice, print the loudness envelope (20 ms RMS in dB) from 0.5 s before to 0.5 s after the spot and cut at the real silence between the last word and the first burst. Check the envelope of the result: the cut span must read as silence.
**Prevent:** do not put [laughing] on a clause that starts with a short word ("He's", "And") right after a shout; use [excited] or [amused] there. Scan every take's transcript for hee/ha tokens.
