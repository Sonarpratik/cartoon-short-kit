import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const source = new URL('./templates/bridge/toon.ts', import.meta.url);
const page = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Character preview</title>
<style>
body{font:16px system-ui;background:#ece8df;color:#241726;margin:24px}
header{position:sticky;top:0;background:#ece8df;padding:12px 0;z-index:1}
h1{margin:0 0 12px}label{margin-right:18px}select,button{font:inherit;padding:6px}
main{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0;background:#faf8f1;border-radius:12px;padding:12px}
canvas{width:240px;height:400px;display:block}figcaption{text-align:center}
#error{color:#a02020;white-space:pre-wrap}
</style>
<header><h1>Character preview</h1>
<label>View <select id="view"><option>Front</option><option>Side</option></select></label>
<label>Expression <select id="expr"></select></label>
<label>Action <select id="action"><option value="stand">Stand</option><option value="march">March</option></select></label>
<button id="pause">Pause</button>
<p>Edit templates/bridge/toon.ts and refresh to see your changes.</p></header>
<p id="error"></p><main></main>
<script type="module">
try {
const T = await import('/toon.js');
const expr = document.querySelector('#expr');
for(const name of ['neutral','stern','grin','laugh','whistle','nervous','shock','relief','relief_open','dazed','pained','smile','smile_closed','lick']) expr.add(new Option(name,name));
const characters = [['Rifleman',T.RIFLEMAN],['Officer',T.OFFICER],['Kid',T.KID],['Parent',T.PARENT],['Townsfolk 1',T.townsfolk(0)],['Townsfolk 2',T.townsfolk(1)]];
const cards = characters.map(([name,outfit],i)=>{
 const figure=document.createElement('figure'), canvas=document.createElement('canvas'), caption=document.createElement('figcaption');
 canvas.width=600;canvas.height=1000;caption.textContent=name;figure.append(canvas,caption);document.querySelector('main').append(figure);
 return {g:canvas.getContext('2d'),outfit,seed:i+1};
});
let paused=false, time=0, previous;
document.querySelector('#pause').onclick=(event)=>{paused=!paused;event.target.textContent=paused?'Play':'Pause';};
function draw(now){
 if(previous!==undefined&&!paused)time+=(now-previous)/1000;previous=now;
 for(const {g,outfit,seed} of cards){
  g.clearRect(0,0,600,1000);
  const opts={seed,expr:expr.value,mode:document.querySelector('#action').value,phase:time%1,blink:!paused&&(time+seed*.3)%4<.12};
  (document.querySelector('#view').value==='Side'?T.bodySide:T.bodyFront)(new T.Pen(g),outfit,opts);
 }
 requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
}catch(error){document.querySelector('#error').textContent=error.stack;}
</script></html>`;

const server = createServer(async (req, res) => {
  try {
    if (req.url === '/toon.js') {
      const js = stripTypeScriptTypes(await readFile(source, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
      res.end(js);
    } else if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page);
    } else {
      res.writeHead(404); res.end('Not found');
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500); res.end('Could not load character source. See terminal.');
  }
});
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
const port = Number(process.env.PORT || 8787);
server.listen(port, '127.0.0.1', () => console.log(`Character preview: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
