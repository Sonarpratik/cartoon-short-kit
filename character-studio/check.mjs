import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('character-studio/review',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8787');await page.waitForFunction(()=>window.studioReady);await page.click('#play');
await page.screenshot({path:'character-studio/review/studio.png',fullPage:true});
await page.click('#sheet');await page.waitForTimeout(500);await page.screenshot({path:'character-studio/review/12-views.png',fullPage:true});
await page.getByRole('button',{name:'Inventor · future',exact:false}).click();await page.waitForTimeout(300);await page.screenshot({path:'character-studio/review/future-12-views.png',fullPage:true});
const stats=await page.evaluate(async()=>{
 const {drawCharacter,ACTIONS,EXPRESSIONS,VIEWS}=await import('/character-rig.js'),{characters}=await fetch('/api/cast').then(r=>r.json());
 const c=document.createElement('canvas');c.width=120;c.height=200;const g=c.getContext('2d');let tested=0,empty=[],clipped=[];
 for(const d of characters)for(const yaw of VIEWS)for(const pitch of [0,90,-90])for(const action of ACTIONS){g.setTransform(.2,0,0,.2,0,0);g.clearRect(0,0,600,1000);drawCharacter(g,d,{yaw,pitch,action,time:.71});const p=g.getImageData(0,0,120,200).data;let n=0,edge=0;for(let i=3;i<p.length;i+=4)if(p[i]){n++;const j=(i-3)/4,x=j%120,y=Math.floor(j/120);if(x===0||y===0||x===119||y===199)edge++;}if(n<25)empty.push([d.id,yaw,pitch,action]);if(edge)clipped.push([d.id,yaw,pitch,action,edge]);tested++;}
 const hashes=[];for(const expr of EXPRESSIONS){g.clearRect(0,0,600,1000);drawCharacter(g,characters[0],{expression:expr,time:1});hashes.push(c.toDataURL());}
 g.clearRect(0,0,600,1000);drawCharacter(g,characters[0],{time:2});const first=c.toDataURL();g.clearRect(0,0,600,1000);drawCharacter(g,characters[0],{time:2});const deterministic=first===c.toDataURL();
 return {tested,empty,clipped,expressionCount:EXPRESSIONS.length,distinctExpressions:new Set(hashes).size,deterministic};
});
// Persistence checks are separate in check-library.mjs.
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'character-studio/review/mobile.png',fullPage:true});
await writeFile('character-studio/review/report.json',JSON.stringify({errors,...stats},null,2));console.log(JSON.stringify({errors,...stats}));await browser.close();
if(errors.length||stats.empty.length||stats.clipped.length||!stats.deterministic)process.exitCode=1;
