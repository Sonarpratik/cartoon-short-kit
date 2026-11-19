import {chromium} from 'playwright';
const f=Number(process.argv[2]);const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11']});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:8793/?scale=.25');await page.waitForFunction(()=>window.ready||window.lastError,null,{timeout:180000});
 await page.evaluate(f=>window.renderFrame(f),f);console.log(JSON.stringify(await page.evaluate(()=>window.debugActors())));}finally{await browser.close();}
