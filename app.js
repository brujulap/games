const $=s=>document.querySelector(s),app=$('#app');let G=[],heroT=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=window.VAULT_API;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)};
const pcls=p=>p==='Switch 2'?'sw':p;
const mc=s=>s==null?'':`<span class="mc ${s<50?'low':s<75?'mid':''}" title="Metacritic">${s}</span>`;
const stars=(n,sz='')=>{let h='';for(let i=1;i<=5;i++)h+=`<span class="${i<=Math.round(n)?'':'off'}">★</span>`;return `<span class="stars" style="${sz}">${h}</span>`};
const ph=g=>`<div class="ph"><em>🎮</em>${esc(g.title)}</div>`;
const pic=g=>g.cover?`<img loading="lazy" src="${g.cover}" alt="${esc(g.title)}" onerror="this.style.display='none'">`:ph(g);
const card=g=>`<div class="card ${g.played?'played':''}" data-id="${g.id}"><div class="pic">${pic(g)}<span class="badge">${esc(g.platform)}</span>
<button class="chk ${g.played?'on':''}" data-t="${g.id}" title="${g.played?'Jugado — tocá para desmarcar':'Marcar como jugado'}">${g.played?'✓':'○'}</button>
<div class="ov"><b>${esc(g.title)}</b><small>${[g.year,(g.genres||[])[0]].filter(Boolean).join(' · ')}${g.rating?' · ★ '+g.rating:''}</small></div></div><div class="cap">${esc(g.title)}</div></div>`;
function rail(title,list,link){if(!list.length)return'';return `<section class="rowsec"><h2>${title}${link?` <a href="${link}">Ver todo ›</a>`:''}</h2><div class="rail-wrap"><button class="arrow l">‹</button><div class="rail">${list.map(card).join('')}</div><button class="arrow r">›</button></div></section>`}
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
async function load(){G=await api('/api/games')}
function setTab(p){document.querySelectorAll('#tabs a').forEach(a=>a.classList.toggle('on',a.dataset.p===p))}
function mtabs(p){return `<div class="mtabs">${[['','Inicio','#/'],['PS5','PS5','#/lib/PS5'],['PS4','PS4','#/lib/PS4'],['Switch 2','Switch 2','#/lib/Switch%202'],['all','Todo','#/lib/all']].map(([k,l,h])=>`<a class="${k===p?'on':''}" href="${h}">${l}</a>`).join('')}</div>`}
function home(){setTab('');const feat=shuffle(G.filter(g=>g.hero&&g.description)).slice(0,6);const played=G.filter(g=>g.played).length;
 const by=p=>G.filter(g=>g.platform===p),top=[...G].filter(g=>g.metacritic).sort((a,b)=>b.metacritic-a.metacritic).slice(0,15);
 app.innerHTML=mtabs('')+`<section class="hero" id="hero"><div class="bg"></div><div class="in"></div><div class="dots">${feat.map((_,i)=>`<i data-i="${i}"></i>`).join('')}</div></section>
 <div class="stats"><div class="stat glass"><b>${G.length}</b><span>juegos en la colección</span></div><div class="stat glass"><b>${played}</b><span>jugados</span><div class="bar"><i style="width:${G.length?played/G.length*100:0}%"></i></div></div><div class="stat glass"><b>${G.length-played}</b><span>pendientes</span></div>
 ${['PS5','PS4','Switch 2'].map(p=>`<div class="stat glass"><b>${by(p).length}</b><span>${p}</span></div>`).join('')}</div>
 ${rail('Pendientes para jugar',shuffle(G.filter(g=>!g.played)).slice(0,20),'#/lib/all?f=pending')}
 ${rail('PlayStation 5',by('PS5'),'#/lib/PS5')}${rail('Mejor valorados por la crítica',top)}${rail('PlayStation 4',by('PS4'),'#/lib/PS4')}${rail('Nintendo Switch 2',by('Switch 2'),'#/lib/Switch%202')}
 ${rail('Ya jugados',G.filter(g=>g.played),'#/lib/all?f=played')}`;
 let i=0;const show=k=>{const g=feat[k];if(!g)return;i=k;const h=$('#hero');if(!h)return;h.querySelector('.bg').style.backgroundImage=`url("${g.hero}")`;
  h.querySelector('.in').outerHTML=`<div class="in"><span class="kick">◆ Destacado · <span class="pill ${pcls(g.platform)}">${esc(g.platform)}</span></span><h1>${esc(g.title)}</h1>
  <div class="meta">${mc(g.metacritic)}${g.year?`<span>${g.year}</span>`:''}${(g.genres||[]).slice(0,3).map(x=>`<span class="pill">${esc(x)}</span>`).join('')}${g.played?'<span class="pill" style="background:#16c78433;color:#5ff0b5">✓ Jugado</span>':''}</div>
  <p>${esc(g.description)}</p><div class="actions"><a class="btn light" href="#/game/${g.id}">▶ Ver ficha</a><button class="btn ghost" data-t="${g.id}">${g.played?'✓ Jugado':'＋ Marcar jugado'}</button></div></div>`;
  h.querySelectorAll('.dots i').forEach((d,j)=>d.classList.toggle('on',j===k))};
 show(0);clearInterval(heroT);heroT=setInterval(()=>{if(!$('#hero'))return clearInterval(heroT);show((i+1)%feat.length)},8000);
 $('#hero').querySelector('.dots').onclick=e=>{if(e.target.dataset.i){show(+e.target.dataset.i)}}}
function lib(p,qs){const all=p==='all';setTab(p);const st={f:qs.get('f')||'all',s:qs.get('s')||'recent',q:$('#q').value.trim()};
 app.innerHTML=mtabs(p)+`<div class="page"><h1>${all?'Toda la biblioteca':esc(p)}</h1><div class="muted" id="cnt"></div>
 <div class="filters glass"><div class="seg" id="fseg">${[['all','Todos'],['pending','Pendientes'],['played','Jugados']].map(([k,l])=>`<button data-f="${k}">${l}</button>`).join('')}</div>
 ${all?`<select class="sel" id="plat"><option value="">Todas las plataformas</option><option>PS5</option><option>PS4</option><option>Switch 2</option></select>`:''}
 <select class="sel" id="sort"><option value="recent">Agregados recientemente</option><option value="az">A → Z</option><option value="za">Z → A</option><option value="year">Más nuevos</option><option value="yearo">Más antiguos</option><option value="mc">Nota de la crítica</option><option value="mine">Mi nota</option></select>
 <input class="field" id="q2" placeholder="Filtrar…" style="max-width:220px;border-radius:999px;padding:8px 14px" value="${esc(st.q)}"></div><div class="grid" id="grid"></div></div>`;
 $('#sort').value=st.s;const draw=()=>{const q=$('#q2').value.trim().toLowerCase(),pl=all?$('#plat').value:p;
  let L=G.filter(g=>(!pl||g.platform===pl)&&(st.f==='all'||(st.f==='played')===g.played)&&(!q||(g.title+' '+(g.edition||'')+' '+(g.developer||'')+' '+(g.genres||[]).join(' ')).toLowerCase().includes(q)));
  const s=$('#sort').value,c=(a,b)=>a.title.localeCompare(b.title,'es');
  L.sort({az:c,za:(a,b)=>-c(a,b),year:(a,b)=>(b.year||0)-(a.year||0),yearo:(a,b)=>(a.year||9999)-(b.year||9999),mc:(a,b)=>(b.metacritic||0)-(a.metacritic||0),mine:(a,b)=>(b.rating||0)-(a.rating||0),recent:()=>0}[s]);
  document.querySelectorAll('#fseg button').forEach(b=>b.classList.toggle('on',b.dataset.f===st.f));
  $('#cnt').textContent=`${L.length} juego${L.length===1?'':'s'} · ${L.filter(g=>g.played).length} jugados`;
  $('#grid').innerHTML=L.map(card).join('')||'<div class="empty">No hay juegos con esos filtros.</div>'};
 $('#fseg').onclick=e=>{if(e.target.dataset.f){st.f=e.target.dataset.f;draw()}};['#sort','#plat'].forEach(s=>$(s)&&($(s).onchange=draw));$('#q2').oninput=draw;draw();window._redraw=draw}
async function detail(id){setTab(null);let g;try{g=await api('/api/games/'+id)}catch(e){app.innerHTML='<div class="page empty">Ese juego no existe.</div>';return}
 const bg=g.hero||g.header||g.screens?.[0]||'',r=g.reviews||[];
 app.innerHTML=`<section class="det-hero"><div class="bg" style="${bg?`background-image:url('${bg}')`:'background:radial-gradient(circle at 70% 30%,#7c5cff44,transparent 60%),#0d0f18'}"></div><div class="det"><div class="poster">${pic(g)}</div><div>
 <span class="kick"><span class="pill ${pcls(g.platform)}">${esc(g.platform)}</span>${g.edition?` · ${esc(g.edition)}`:''}</span><h1>${esc(g.title)}</h1>
 <div class="meta">${mc(g.metacritic)}${g.year?`<span>${g.year}</span>`:''}${(g.genres||[]).slice(0,4).map(x=>`<span class="pill">${esc(x)}</span>`).join('')}${g.rating?`<span>${stars(g.rating,'font-size:16px')} ${g.rating}/5</span>`:''}</div>
 <div class="desc">${g.description?esc(g.description):'<span class="muted">Todavía no hay descripción para este juego.</span>'}</div>
 <div class="actions"><button class="btn ${g.played?'done':'primary'}" id="tg">${g.played?'✓ Jugado'+(g.played_at?' · '+g.played_at:''):'＋ Marcar como jugado'}</button><a class="btn ghost" href="#rv">★ Escribir reseña</a><button class="btn danger" id="del">Quitar</button></div></div></div></section>
 <div class="sec"><h2>Ficha</h2><div class="info">${[['Desarrollador',g.developer],['Editor',g.publisher],['Lanzamiento',g.year],['Plataforma',g.platform+(g.edition?' · '+g.edition:'')],['Crítica',g.metacritic!=null?`${mc(g.metacritic)} <a class="small muted" target="_blank" href="${esc(g.metacritic_url||'#')}">Metacritic ↗</a>`:null],['Estado',g.played?'Jugado':'Pendiente']].map(([k,v])=>`<div class="glass"><small>${k}</small>${v==null||v===''?'<span class="muted">—</span>':(k==='Crítica'?v:esc(v))}</div>`).join('')}</div>
 ${g.screens?.length?`<h2>Capturas</h2><div class="shots">${g.screens.map(s=>`<img loading="lazy" src="${s}">`).join('')}</div>`:''}
 <h2 id="rv">Reseñas</h2><div class="revwrap"><div><div class="score glass"><b>${g.rating??'–'}</b>${stars(g.rating||0,'font-size:24px')}<div class="muted">${r.length?`${r.length} reseña${r.length>1?'s':''}`:'Sin reseñas todavía'}</div></div></div>
 <div><form class="rform glass" id="rf"><div class="muted small">Tu nota</div><div class="pick" id="pick">${[1,2,3,4,5].map(i=>`<span data-v="${i}">★</span>`).join('')}</div>
 <textarea id="rt" rows="3" placeholder="¿Qué te pareció?"></textarea><div class="row"><input class="field" id="ra" value="Bruno" style="max-width:180px"><button class="btn primary">Publicar reseña</button></div></form>
 ${r.map(x=>`<div class="rev glass"><header><div class="av">${esc((x.author||'?')[0].toUpperCase())}</div><div><b>${esc(x.author)}</b><div class="muted small">${new Date(x.created_at*1000).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</div></div><span style="margin-left:12px">${stars(x.stars)}</span><button class="x" data-r="${x.id}" title="Borrar">✕</button></header>${x.text?`<p>${esc(x.text)}</p>`:''}</div>`).join('')}</div></div>
 ${g.sources?.length?`<p class="muted small src" style="margin-top:30px">Datos: ${g.sources.map(s=>`<a target="_blank" href="${esc(s.url)}">${esc(s.name)}</a>`).join(' · ')}</p>`:''}</div>`;
 let v=0;const pk=$('#pick'),paint=n=>pk.querySelectorAll('span').forEach(s=>s.classList.toggle('on',+s.dataset.v<=n));
 pk.onmouseover=e=>e.target.dataset.v&&paint(+e.target.dataset.v);pk.onmouseleave=()=>paint(v);pk.onclick=e=>{if(e.target.dataset.v){v=+e.target.dataset.v;paint(v)}};
 $('#rf').onsubmit=async e=>{e.preventDefault();if(!v)return toast('Elegí de 1 a 5 estrellas');await api(`/api/games/${id}/reviews`,{method:'POST',body:JSON.stringify({stars:v,text:$('#rt').value,author:$('#ra').value})});await load();toast('Reseña publicada ★');detail(id)};
 app.querySelectorAll('.x').forEach(b=>b.onclick=async()=>{if(!confirm('¿Borrar esta reseña?'))return;await api('/api/reviews/'+b.dataset.r,{method:'DELETE'});await load();detail(id)});
 $('#tg').onclick=async()=>{await toggle(id);detail(id)};
 $('#del').onclick=async()=>{if(!confirm(`¿Quitar «${g.title}» de la biblioteca?`))return;await api('/api/games/'+id,{method:'DELETE'});await load();toast('Juego quitado');location.hash='#/'};
 app.querySelectorAll('.shots img').forEach(i=>i.onclick=()=>{const d=document.createElement('div');d.className='lb';d.innerHTML=`<img src="${i.src}">`;d.onclick=()=>d.remove();document.body.append(d)});scrollTo(0,0)}
async function toggle(id){const g=G.find(x=>x.id===id);const n=await api('/api/games/'+id,{method:'PATCH',body:JSON.stringify({played:!g.played})});Object.assign(g,{played:n.played,played_at:n.played_at});toast(n.played?`✓ ${n.title} marcado como jugado`:`${n.title} vuelve a pendientes`);return n}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-t]');if(t&&!t.id){e.stopPropagation();e.preventDefault();await toggle(t.dataset.t);
  const g=G.find(x=>x.id===t.dataset.t);if(t.classList.contains('chk')){t.classList.toggle('on',g.played);t.textContent=g.played?'✓':'○';t.closest('.card').classList.toggle('played',g.played)}else route();return}
 const a=e.target.closest('.arrow');if(a){const r=a.parentElement.querySelector('.rail');r.scrollBy({left:(a.classList.contains('r')?1:-1)*r.clientWidth*.85,behavior:'smooth'});return}
 const c=e.target.closest('.card');if(c)location.hash='#/game/'+c.dataset.id});
function route(){const h=location.hash.slice(1)||'/',[path,qs]=h.split('?'),p=path.split('/').filter(Boolean),Q=new URLSearchParams(qs||'');
 if(p[0]==='game')return detail(p[1]);if(p[0]==='lib')return lib(decodeURIComponent(p[1]||'all'),Q);scrollTo(0,0);home()}
addEventListener('hashchange',route);addEventListener('scroll',()=>$('#nav').classList.toggle('solid',scrollY>30));
$('#q').addEventListener('input',e=>{if(!location.hash.startsWith('#/lib/all'))location.hash='#/lib/all';else{const q2=$('#q2');if(q2){q2.value=e.target.value;window._redraw?.()}}});
$('#addBtn').onclick=()=>$('#addDlg').showModal();
$('#addForm').onsubmit=async e=>{if(e.submitter?.value!=='ok')return;e.preventDefault();const f=new FormData(e.target),b=$('#addGo');b.innerHTML='<span class="spin"></span> Buscando datos…';b.disabled=true;
 try{const g=await api('/api/games',{method:'POST',body:JSON.stringify(Object.fromEntries(f))});await load();$('#addDlg').close();e.target.reset();toast('Agregado: '+g.title);location.hash='#/game/'+g.id}catch(err){toast(err.message)}finally{b.textContent='Agregar';b.disabled=false}};
window.VAULT_START=()=>load().then(route);
