# MKUltra — scene plan v1

Original voice: input/voice.mp3. Decoded duration 34.4555 s; 30 fps; 1,034 frames (0–1033). Source audio is unchanged. Scene intervals below are half-open: start included, end excluded. Alignment uses local faster-whisper word timestamps, checked against the supplied script; reaction leads are within two frames of the target word where possible.

| Scene | Frames | Seconds | Narration | Visual / characters | Camera / light | Props and cue |
|---|---|---|---|---|---|---|
| S01 | 0–74 | 0.00–2.50 | The CIA drugged its own citizens… | Anonymous civilian at a diner table; a covert hand and amber vial in foreground; civilian is unaware | Medium, slow push; warm practical / teal shadows | Coffee, table, blinds, amber bottle; restrained glass tick |
| S02 | 75–140 | 2.50–4.70 | …and they admitted it. | Anonymous official at a public hearing, papers open; no likeness to a real person | Frontal medium, low push; warm cream and navy | Microphone, wood desk, open records; paper movement |
| S03 | 141–350 | 4.70–11.70 | Starting in 1953…MKUltra tested LSD and other drugs on people. | A dated MKULTRA file on a laboratory desk; fictional researcher and civilian behind it | Folder-to-lab reveal, restrained lateral move; sea-green tiled room | 1953 calendar, MKULTRA folder, LSD bottle, test tubes, lamp; switch click |
| S04 | 351–419 | 11.70–14.00 | Some of them never knew they'd been dosed. | Same civilian's face beside a cup; questioning expression after a small drink gesture; no graphic effects | Close medium, slow drift; evening warm/cool contrast | Cup, saucer, window and out-of-focus file; quiet ceramic tick |
| S05 | 420–569 | 14.00–19.00 | The goal? Mind control…and making people talk under interrogation. | Civilian opposite an investigator; recorder runs, question-filled research notes; presents attempted control, not success | Medium two-shot, push toward civilian; overhead pool of light | Desk lamp, tape recorder, chair, research board; recorder motor |
| S06 | 570–701 | 19.00–23.40 | In 1973, the CIA director ordered the files destroyed. | Anonymous director presses a destruction-order stamp; folders slide toward a shredder | Desk medium to closer shredder framing; amber office | 1973 calendar, order sheet, stamp, folders, shredder; stamp + paper crunch |
| S07 | 702–857 | 23.40–28.60 | But about 20,000 documents survived…financial records. | Archive shelves with finance boxes; a red-tabbed MKULTRA folder hidden among ledgers remains intact | Slow shelf reveal, focus on the misplaced file; dusty gold and green | FINANCE labels, ledgers, file boxes, surviving folder; low reveal note |
| S08 | 858–947 | 28.60–31.60 | They were found in 1977. | Archivist pulls out that folder, opens it and looks surprised | Medium push, folder foreground; brighter archive light | 1977 calendar, cabinet, open file, papers; drawer + paper rustle |
| S09 | 948–1033 | 31.60–34.47 | So…what else do you think got shredded? | Shredded strips fall through a warm light pool; anonymous sealed folders remain in shadow | Close insert, slow push; teal darkness with amber accents | Shredder bin, anonymous files, paper strips; music stops, short low sting |

All people are fictional visual stand-ins. No captions; only in-world dates, file labels and prop markings. No logos. The visual treatment is original and informed by private study of the local references. The “20,000 documents” wording is preserved only in the supplied audio; see SOURCES.md for the pages/documents distinction.

## Review and correction boundaries

Each scene owns its build/update function in src/scenes/SNN.ts. Common materials and character helpers are copied into this project under src/engine and src/characters.ts. The templates and reference folders are read-only inputs. Review hashes include scene code plus consumed shared files. No full frame sequence, mix or MP4 is rendered before the user explicitly requests generation.
