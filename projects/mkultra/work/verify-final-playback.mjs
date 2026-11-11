import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();await page.setContent('<video id="final" controls src="http://127.0.0.1:8790/out/final.mp4"></video>');
 await page.waitForFunction(()=>document.querySelector('video').readyState>=2,null,{timeout:30000});
 console.log(await page.locator('video').evaluate(async v=>{v.currentTime=12;await v.play();v.pause();return JSON.stringify({width:v.videoWidth,height:v.videoHeight,duration:v.duration,playback:'passed',error:v.error});}));
}finally{await browser.close();}
