// Compile the preserved pre-refactor CSS independently for browser cascade comparisons.
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';
const root=path.resolve('frontend');
const source=JSON.parse(fs.readFileSync(path.join(root,'test-results/css-refactor/baseline-css.json'),'utf8'));
const input=path.join(root,'test-results/css-refactor/baseline.css');
fs.writeFileSync(input,'@import "tailwindcss";\n@import "./baseline-variables.css";\n'+Object.values(source).join('\n').replaceAll('.account-page',':is(.account-page, .contact-page)'));
await build({root,configFile:false,plugins:[tailwindcss()],build:{outDir:'test-results/css-refactor/baseline-build',emptyOutDir:true,rollupOptions:{input,output:{assetFileNames:'[name][extname]'}}}});
fs.unlinkSync(input);
