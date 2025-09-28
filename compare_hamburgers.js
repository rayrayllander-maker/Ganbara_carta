#!/usr/bin/env node
/**
 * compare_hamburgers.js
 *
 * Utilidad para comparar los ingredientes de las hamburguesas definidos en la web (index.html)
 * con un archivo de texto plano exportado de la carta impresa (por OCR): carta_texto.txt
 *
 * Uso:
 *   node compare_hamburgers.js
 *
 * Requisitos:
 *   - Estar en el mismo directorio que index.html o ajustar la ruta.
 *   - Generar previamente un archivo carta_texto.txt que contenga el texto legible de la carta.
 *
 * Salida:
 *   - Lista de hamburguesas encontradas en la web con sus ingredientes normalizados.
 *   - Detección de hamburguesas faltantes en la carta_texto.txt.
 *   - Ingredientes que aparecen en web y no se detectan en carta (y viceversa) a nivel token básico.
 */
const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'index.html');
const CARTA_TEXT_PATH = path.join(__dirname, 'carta_texto.txt');

function readFileSafe(p){
  try { return fs.readFileSync(p,'utf8'); } catch(e){ return null; }
}

function extractHamburgers(html){
  // Capturamos secciones hamburguesas y chuletas
  const sections = [];
  const reSection = /<section id="(hamburguesas|chuletas)"[\s\S]*?<\/section>/gi;
  let m;
  while((m = reSection.exec(html))){ sections.push(m[0]); }
  const burgers = [];
  const reArticle = /<article class="card menu-card"[\s\S]*?<\/article>/gi;
  for(const sec of sections){
    let a;
    while((a = reArticle.exec(sec))){
      const block = a[0];
      // Ignore articles without menu-card-header or description
      const titleMatch = block.match(/<span class="menu-card-title(?:[^"]*)?"[^>]*>(.*?)<\/span>/i) ||
                         block.match(/<span class="menu-card-title-wrapper">[\s\S]*?<span class="menu-card-title"[^>]*>(.*?)<\/span>/i);
      const descMatch = block.match(/<div class="menu-card-desc"[^>]*>([\s\S]*?)<\/div>/i);
      if(!titleMatch) continue;
      const name = titleMatch[1].replace(/<[^>]+>/g,'').trim();
      if(!name) continue;
      const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g,'').trim() : '';
      burgers.push({ name, rawDesc });
    }
  }
  return burgers;
}

function normalizeIngredients(desc){
  if(!desc) return [];
  let cleaned = desc
    .replace(/\.+$/,'')
    .replace(/\b\d+\s?gr?\.?/gi, m=> m.toLowerCase()) // mantener pesos
    .replace(/\bdouble\b/gi,'doble')
    .replace(/\bcrispy\b/gi,'crispy');
  // Separar por comas primero
  let parts = cleaned.split(/,/).map(p=>p.trim()).filter(Boolean);
  // Último elemento: separar por ' y ' si procede
  const finalParts = [];
  for(const p of parts){
    if(/\sy\s|\seta\s/i.test(p)){
      p.split(/\s(?:y|eta)\s/i).forEach(x=> { const t = x.trim(); if(t) finalParts.push(t); });
    } else {
      finalParts.push(p);
    }
  }
  return finalParts
    .map(x=>x.toLowerCase())
    .map(x=>x.replace(/\bde\b|\bcon\b|\bla\b|\bel\b|\blos\b|\blas\b|\bun\b|\buna\b/g,'').trim())
    .map(x=>x.replace(/\s{2,}/g,' '))
    .filter(Boolean);
}

function tokenizeCartaText(text){
  // Preparamos una búsqueda por líneas para intentar asociar cada hamburguesa a su línea de ingredientes
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
  return lines;
}

function findCartaLineForBurger(lines, name){
  const nameNorm = name.toLowerCase();
  // buscar coincidencia exacta o sin acentos / variantes
  function normalize(s){ return s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,''); }
  const target = normalize(nameNorm);
  let best = null;
  for(const line of lines){
    const ln = normalize(line);
    if(ln.includes(target)){ best = line; break; }
  }
  return best;
}

function extractIngredientsFromCartaLine(line){
  if(!line) return [];
  // Intentar separar nombre de ingredientes por ':' o '-' o '–'
  const split = line.split(/[:\-–]/);
  let ingPart = split.length>1 ? split.slice(1).join(' ').trim() : line;
  // Eliminar nombre si está repetido al principio
  ingPart = ingPart.replace(/^[A-ZÁÉÍÓÚÜÑ0-9 ]{3,}\s+/,'');
  // separar por comas y ' y '
  let parts = ingPart.split(/,/).map(p=>p.trim()).filter(Boolean);
  const finalParts = [];
  for(const p of parts){
    if(/\sy\s|\seta\s/i.test(p)){
      p.split(/\s(?:y|eta)\s/i).forEach(x=> { const t = x.trim(); if(t) finalParts.push(t); });
    } else finalParts.push(p);
  }
  return finalParts.map(x=>x.toLowerCase());
}

function arrayDiff(a,b){
  const sa = new Set(a); const sb = new Set(b);
  return {
    onlyInA: [...sa].filter(x=>!sb.has(x)),
    onlyInB: [...sb].filter(x=>!sa.has(x))
  };
}

(function main(){
  const html = readFileSafe(INDEX_PATH);
  if(!html){
    console.error('No se pudo leer index.html');
    process.exit(1);
  }
  const burgers = extractHamburgers(html).filter(b=> b.name && b.rawDesc);
  const enriched = burgers.map(b=> ({ ...b, webTokens: normalizeIngredients(b.rawDesc) }));
  const cartaText = readFileSafe(CARTA_TEXT_PATH);
  let cartaLines = [];
  if(cartaText){ cartaLines = tokenizeCartaText(cartaText); }

  const report = [];
  for(const b of enriched){
    const line = cartaText ? findCartaLineForBurger(cartaLines, b.name) : null;
    if(!line){
      report.push({ name: b.name, status: 'NO_ENCONTRADA_EN_CARTA', webTokens: b.webTokens });
      continue;
    }
    const cartaTokens = normalizeIngredients(extractIngredientsFromCartaLine(line).join(', '));
    const diff = arrayDiff(b.webTokens, cartaTokens);
    report.push({ name: b.name, status: diff.onlyInA.length===0 && diff.onlyInB.length===0 ? 'OK' : 'DIFERENCIAS', webTokens: b.webTokens, cartaTokens, diff });
  }

  console.log('=== HAMBURGUESAS WEB ===');
  enriched.forEach(b=> console.log(`- ${b.name}: ${b.rawDesc}`));
  console.log('\n=== RESULTADO COMPARACIÓN ===');
  if(!cartaText){
    console.log('No existe carta_texto.txt -> crea este archivo (OCR) para comparar.');
  }
  report.forEach(r=>{
    console.log(`\n${r.name} -> ${r.status}`);
    if(r.status !== 'OK'){
      if(r.webTokens) console.log('  Web:', r.webTokens.join(', '));
      if(r.cartaTokens) console.log('  Carta:', r.cartaTokens.join(', '));
      if(r.diff){
        if(r.diff.onlyInA.length) console.log('  Solo web:', r.diff.onlyInA.join(', '));
        if(r.diff.onlyInB.length) console.log('  Solo carta:', r.diff.onlyInB.join(', '));
      }
    }
  });
})();
