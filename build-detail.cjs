/* Rebuild only; the delivered detail.html runs from file:// without Node or an HTTP server. */
const path=require('path');
const esbuild=require(process.argv[2]?path.resolve(process.argv[2]):'esbuild');
esbuild.buildSync({absWorkingDir:__dirname,entryPoints:['detail.js'],outfile:'assets/detail.bundle.js',bundle:true,format:'iife',platform:'browser',target:['es2020'],minify:true,charset:'utf8',legalComments:'inline',banner:{js:'/* Generated from detail.js and the original case modules by build-detail.cjs. */'}});
console.log('Built assets/detail.bundle.js');
