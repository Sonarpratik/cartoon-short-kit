# Adapt finish.py / captions.py for Part 3 and write the approved-review hash list from manifest_v5.
import os, json
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def sub(path, old, new):
    s = open(path, encoding='utf8').read()
    if new in s: return
    assert old in s, (path, old[:70]); s = s.replace(old, new, 1); open(path, 'w', encoding='utf8').write(s)

m = json.load(open('review/manifest_v5.json', encoding='utf8'))
hashes = {s['id']: {'version': s['paths'][0].split('/')[1].split('_', 1)[1], 'frames': s['review']} for s in m}
json.dump(hashes, open('work/hashes.json', 'w', encoding='utf8'), indent=2)

f = 'scripts/finish.py'
sub(f, "d.text((16,15),'ZOMBIE APOCALYPSE PART 2 - FINAL VIDEO QA',font=bold,fill='#efd4ac')", "d.text((16,15),'ZOMBIE APOCALYPSE PART 3 - FINAL VIDEO QA',font=bold,fill='#efd4ac')")
sub(f, "chosen=sorted(set([s['f0'] for s in render['scenes']]+[690,1790,2400,total-1]))", "chosen=sorted(set([s['f0'] for s in render['scenes']]+[1376,1430,2406,total-1]))")
# Planned story effects are not defects: the black before the headlights (S13 1295-1321), the white headlight flash
# (1322-1326) and the S08 freeze frame (1008-1050, 33.6-35.0 s).
sub(f, "if black or white or freeze_lines or pops:raise RuntimeError('Inspect flagged visual QA events before delivery')",
    """PLANNED_BLACK=set(range(1295,1322));PLANNED_WHITE=set(range(1322,1327))
def _t(line):
    m=re.search(r'freeze_(?:start|end|duration): ([0-9.]+)',line);return float(m.group(1)) if m else -1
unplanned_freeze=[l for l in freeze_lines if not ('freeze_duration' in l or 33.4<=_t(l)<=35.2)]
report['plannedBlack']=[x for x in black if x in PLANNED_BLACK];report['plannedWhite']=[x for x in white if x in PLANNED_WHITE]
black=[x for x in black if x not in PLANNED_BLACK];white=[x for x in white if x not in PLANNED_WHITE];freeze_lines=unplanned_freeze
(ROOT/'work'/args.report).write_text(json.dumps({**report,'unplannedBlack':black,'unplannedWhite':white,'unplannedFreeze':freeze_lines},indent=2),encoding='utf-8')
if black or white or freeze_lines or pops:raise RuntimeError('Inspect flagged visual QA events before delivery')""")

c = 'scripts/captions.py'
sub(c, "KEY = {'zombie', 'zombies', 'mall', 'house', 'rooftop', 'boat', 'school', 'police', 'station', 'humans', 'storm', 'gate', 'untouchable', 'generator', 'over', 'change', '5', '4', '3', '2', '1'}",
    "KEY = {'zombies', 'humans', 'gate', 'gates', 'generator', 'safe', 'help', 'gone', 'headlights', 'engines', 'ten', 'rules', 'supplies', 'stash', 'awake', 'trust', 'survive', 'everything', 'stop', '1', '10', '20', '1.', '2.', '3.', '4.', '10.', '20.'}")
sub(c, "    if x['word'].startswith('-') and words:", "    if x['word'] == 'tenon': x['word'] = 'ten'   # transcription slip: \"ten men\"\n    if x['word'] == 'I' and words and words[-1]['word'].startswith('1'): continue   # stray \"I\" before \"never show\"\n    if x['word'].startswith('-') and words:")
print('ok', len(hashes))
