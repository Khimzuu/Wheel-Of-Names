const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../src/scripts/engine.js');
test('Full names count as one line each',()=>assert.deepEqual(engine.entriesFromText('Kim Carlo Tolentino\nMaria Sofia Reyes\r\n'),['Kim Carlo Tolentino','Maria Sofia Reyes']));
test('Random selection stays inside range at 1000 names',()=>{for(let i=0;i<4000;i++){const v=engine.randomInt(1000);assert.ok(v>=0&&v<1000)}});
test('Forced winner index is selected',()=>assert.equal(engine.chooseIndex(['One','Two','Three'],'Two'),1));
test('Landing pointer is within winning slice, not centered',()=>{for(const n of [2,6,200,1000]){const i=n-1,frac=.23;const a=engine.landingRotation(3.4,i,n,7,frac),rotation=((a%engine.TAU)+engine.TAU)%engine.TAU;const pointed=(((engine.TAU-rotation)%engine.TAU)+engine.TAU)%engine.TAU;const slice=engine.TAU/n;assert.ok(Math.abs(pointed-(i+frac)*slice)<1e-8)}});
