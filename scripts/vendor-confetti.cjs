const fs=require('node:fs');const path=require('node:path');
const source=path.join(__dirname,'..','node_modules','canvas-confetti','dist','confetti.browser.js');
if(!fs.existsSync(source)){console.log('Using included local confetti fallback.');process.exit(0)}
for(const target of ['assets/vendor/canvas-confetti.js','site/assets/vendor/canvas-confetti.js']){
 const dest=path.join(__dirname,'..',target);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest)}
console.log('Installed official canvas-confetti browser distribution (as used by Preline).');
