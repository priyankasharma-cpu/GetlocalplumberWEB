import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
const root=fileURLToPath(new URL('../src/',import.meta.url));
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
const all=files(root);
test('primary navbar token stays exactly 15px',()=>{
  const ast=postcss.parse(fs.readFileSync(path.join(root,'styles/variables.css'),'utf8'));
  const sizes=[];ast.walkDecls('--navbar-font-size',d=>sizes.push(d.value));
  assert.deepEqual(sizes,['15px']);
});
test('colocated stylesheet imports exist and CSS parses without duplicate selector definitions',()=>{
  const definitions=new Map();
  for(const file of all){
    if(/\.(jsx|js|css)$/.test(file)){
      const source=fs.readFileSync(file,'utf8');
      for(const [,relative] of source.matchAll(/(?:import\s*["']|@import\s*["'])(\.[^"']+\.css)["']/g))assert.ok(fs.existsSync(path.resolve(path.dirname(file),relative)),`${file}: ${relative}`);
    }
    if(!file.endsWith('.css'))continue;
    postcss.parse(fs.readFileSync(file,'utf8'),{from:file}).walkRules(rule=>{
      const context=[];for(let p=rule.parent;p?.type!=='root';p=p.parent)if(p.type==='atrule')context.unshift(p.name+' '+p.params);
      for(const selector of postcss.list.comma(rule.selector)){
        for(const declaration of rule.nodes.filter(n=>n.type==='decl')){
          const key=context.join('|')+'|'+selector+'|'+declaration.prop;
          assert.ok(!definitions.has(key),`Duplicate ${key} in ${file} and ${definitions.get(key)}`);definitions.set(key,file);
        }
      }
    });
  }
});
test('global reset excludes component rules and component-specific breakpoints',()=>{
  assert.ok(!fs.existsSync(path.join(root,'styles/globals.css')),'Old monolithic stylesheet must remain removed');
  const ast=postcss.parse(fs.readFileSync(path.join(root,'styles/global.css'),'utf8'));
  ast.walkAtRules('media',node=>assert.match(node.params,/prefers-reduced-motion/));
  ast.walkRules(node=>assert.doesNotMatch(node.selector,/header|footer|hero|service-|project-|modal|\.button/));
});
test('local React module graph has no circular imports',()=>{
  const graph=new Map();
  for(const file of all.filter(f=>/\.(jsx|js)$/.test(f))){
    const deps=[];for(const [,relative] of fs.readFileSync(file,'utf8').matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)){
      const base=path.resolve(path.dirname(file),relative),target=[base,base+'.jsx',base+'.js'].find(f=>fs.existsSync(f)&&/\.(jsx|js)$/.test(f));if(target)deps.push(target);
    }graph.set(file,deps);
  }
  const done=new Set(),active=new Set();
  function visit(file){if(done.has(file))return;assert.ok(!active.has(file),'Circular import at '+file);active.add(file);for(const dep of graph.get(file)||[])visit(dep);active.delete(file);done.add(file);}
  for(const file of graph.keys())visit(file);
});
