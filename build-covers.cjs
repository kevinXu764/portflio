/* Rebuild embedded textures after editing works.js or the cover files. No dependencies. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'works.js'),'utf8'),context);
const urls=context.window.CARD_WORKS.map(work=>{
 const file=path.resolve(root,work.cover);
 if(!file.startsWith(root+path.sep))throw Error('Cover must be inside this website');
 const ext=path.extname(file).toLowerCase(),mime={'.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'}[ext];
 if(!mime)throw Error('Unsupported cover format: '+ext);
 return 'data:'+mime+';base64,'+fs.readFileSync(file).toString('base64');
});
fs.writeFileSync(path.join(root,'assets/covers.js'),'/* Embedded for direct local-file viewing. Source artwork is kept beside this file. */\nwindow.CARD_COVERS='+JSON.stringify(urls)+';\n');
console.log('Embedded '+urls.length+' cover textures');
