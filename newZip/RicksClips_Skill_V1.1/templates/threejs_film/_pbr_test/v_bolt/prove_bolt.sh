#!/usr/bin/env bash
# one command: render the 2 s bolt test (60 frames, GPU queue), then mp4 + numbers + bolt_sheet.jpg
cd "$(dirname "$0")"
rm -rf frames; bash ../../../../episodes/moonrakers/tools_lead/gpu_render.sh film.json --frames 0-59 --scale 1 --stills-dir frames 2>&1 | grep -v "404" | tail -3
ffmpeg -y -v error -framerate 30 -i frames/f_%05d.png -vf scale=540:960 -c:v libx264 -crf 18 -pix_fmt yuv420p bolt_test.mp4 && echo "mp4 ok"
python -I prove_bolt.py
