const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');
for(const file of ['index.html','src/scripts/app.js','src/scripts/engine.js','src/scripts/sound.js','src/styles/main.css','assets/audio/applause.mp3','assets/vendor/canvas-confetti.js']){
 const src=path.join(root,file),dest=path.join(root,'site',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest)}
console.log('Synced browser distribution.');
