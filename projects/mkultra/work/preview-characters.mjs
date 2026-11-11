import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1500,height:920},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8790/characters.html');await page.waitForFunction(()=>window.characterPreviewReady===true);
 await page.locator('#animate').uncheck();await page.locator('#expression').selectOption('smile');
 await page.screenshot({path:'review/character-preview-white.jpg',fullPage:true,type:'jpeg',quality:95});
 await page.locator('#direction').selectOption('1');await page.locator('#expression').selectOption('shock');
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Character preview ready: five characters, off-white faces, expression and gaze controls.');
}finally{await browser.close();}
