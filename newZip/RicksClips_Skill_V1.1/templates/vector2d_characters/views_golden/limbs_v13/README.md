# Character template v13 (limbs) - LOCKED by CB 2026-11-12 00:10 Bangkok ("Ok lock")
Builds on character_template_v12 (same folder level). Push to the PC AFTER v12, add-only, back up first.
- code/char2d.mjs, code/bodies.mjs -> templates\vector2d_characters\ (char2d replaces v12's; bodies = v12 + v13 fields)
- threejs_film/poses.mjs -> templates\threejs_film\poses.mjs (new poses sit_chair, cheer; arm() elbow + elbowDir + elbowAt; arms = leg width; bigger fists)
- VIEW_RULES.md -> templates\vector2d_characters\VIEW_RULES.md (rules 22 rewritten, 23 new)
- tools/pose_views_sheet.mjs, tools/chair_scene_test.mjs: render one pose in 4 views / the Rick cashier test (paths to the kit are relative; playwright from /opt/node-tools in the cloud)
- approved/: approved pictures + Rick reference
After copying: run node tools/check_views.mjs (standing views must still PASS; the arm width/fist change may need --update after CB looks at a new sheet), then tools\refresh_installed_skill.py.
