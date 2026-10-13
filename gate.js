"use strict";
(function(){
const $=id=>document.getElementById(id),PX='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7#x=';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let KEY=null,DB=null;const SK='vault_state_v1',RK='vault_k';
async function deriveRaw(pw,meta){const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64(meta.salt),iterations:meta.iter,hash:'SHA-256'},km,256))}
const imp=raw=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
async function dec(buf){buf=new Uint8Array(buf);return crypto.subtle.decrypt({name:'AES-GCM',iv:buf.slice(0,12)},KEY,buf.slice(12))}
// state local (marcas y reseñas en este navegador)
const st=()=>{try{return JSON.parse(localStorage.getItem(SK))||{}}catch(e){return{}}},save=s=>localStorage.setItem(SK,JSON.stringify(s));
function px(v){return typeof v==='string'&&v.startsWith('enc:')?PX+v.slice(4):v}
function view(g){const s=st(),o=(s.played||{})[g.id];const r=allRev().filter(x=>x.game_id===g.id);
 const out={...g,cover:px(g.cover),hero:px(g.hero),header:px(g.header),screens:(g.screens||[]).map(px)};
 if(o)Object.assign(out,o);out.rating=r.length?Math.round(r.reduce((a,x)=>a+x.stars,0)/r.length*10)/10:null;return out}
function allRev(){const s=st(),del=new Set(s.delRev||[]);return DB.reviews.filter(r=>!del.has(r.id)).concat(s.reviews||[])}
const live=()=>{const h=new Set(st().hidden||[]);return DB.games.filter(g=>!h.has(g.id))};
window.VAULT_API=async(u,o={})=>{const m=(o.method||'GET'),b=o.body?JSON.parse(o.body):{};let x;
 if(u==='/api/games'&&m==='GET')return live().map(view);
 if(u==='/api/games'&&m==='POST')throw new Error('Agregar juegos solo funciona en la versión de la Raspberry');
 if(x=u.match(/^\/api\/games\/([\w-]+)\/reviews$/)){const s=st();s.reviews=s.reviews||[];const r={id:'l'+Date.now(),game_id:x[1],stars:Math.max(1,Math.min(5,+b.stars)),text:(b.text||'').trim(),author:(b.author||'Bruno').trim()||'Bruno',created_at:Date.now()/1000};s.reviews.push(r);save(s);return r}
 if(x=u.match(/^\/api\/reviews\/(\w+)$/)){const s=st();s.reviews=(s.reviews||[]).filter(r=>String(r.id)!==x[1]);s.delRev=(s.delRev||[]).concat([isNaN(x[1])?x[1]:+x[1]]);save(s);return{ok:true}}
 if(x=u.match(/^\/api\/games\/([\w-]+)$/)){const g=live().find(g=>g.id===x[1]);if(!g)throw new Error('No existe');
  if(m==='GET'){const v=view(g);v.reviews=allRev().filter(r=>r.game_id===g.id).sort((a,b)=>b.created_at-a.created_at);return v}
  if(m==='PATCH'){const s=st();s.played=s.played||{};const p=!!b.played;s.played[g.id]={played:p,played_at:p?new Date().toISOString().slice(0,10):null};save(s);return view(g)}
  if(m==='DELETE'){const s=st();s.hidden=(s.hidden||[]).concat([g.id]);save(s);return{ok:true}}}
 throw new Error('No disponible')};
// imágenes cifradas: se descargan y descifran a demanda
const cache={};
function getImg(id){return cache[id]||(cache[id]=fetch('d/'+id+'.bin').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(dec).then(p=>URL.createObjectURL(new Blob([p],{type:'image/jpeg'}))))}
function fix(el){if(el.tagName==='IMG'){const s=el.getAttribute('src')||'';const i=s.indexOf('#x=');if(s.startsWith('data:image/gif')&&i>0){const id=s.slice(i+3);el.setAttribute('src',PX.slice(0,PX.indexOf('#')));getImg(id).then(u=>el.src=u,()=>el.style.display='none')}}
 const st_=el.getAttribute&&el.getAttribute('style');if(st_&&st_.includes('#x=')){const mm=st_.match(/data:image\/gif;base64,[^"')]*#x=([0-9a-f]+)/);if(mm){const id=mm[1];el.style.backgroundImage='none';getImg(id).then(u=>el.style.backgroundImage=`url("${u}")`)}}}
function scan(root){if(root.nodeType!==1)return;fix(root);root.querySelectorAll('img,[style]').forEach(fix)}
new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='attributes')fix(m.target);else m.addedNodes.forEach(scan)})).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
async function unlock(pw,raw,silent){const err=$('lerr'),go=$('go');err.textContent='';go.disabled=true;go.textContent='Desbloqueando…';
 try{const meta=await (await fetch('d/vault.json',{cache:'no-cache'})).json();raw=raw||await deriveRaw(pw,meta);KEY=await imp(raw);
  const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(meta.iv)},KEY,b64(meta.ct));DB=JSON.parse(new TextDecoder().decode(p));
  if($('rem').checked)localStorage.setItem(RK,meta.salt+':'+btoa(String.fromCharCode(...raw)));
  $('lock').remove();document.body.classList.remove('locked');window.VAULT_START();
 }catch(e){localStorage.removeItem(RK);if(!silent)err.textContent='Contraseña incorrecta.';go.disabled=false;go.textContent='Desbloquear'}}
$('lf').addEventListener('submit',e=>{e.preventDefault();unlock($('pw').value)});
const sv=localStorage.getItem(RK);if(sv){const [salt,k]=sv.split(':');$('rem').checked=true;unlock(null,b64(k),true)}
})();
