(function(){
'use strict';
const D = window.MEV_DATA || {};
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const C = ['#0f766e','#c2410c','#4338ca','#a16207','#be185d','#0369a1'];
const fmt=(v,d=3)=>v==null?'–':Number(v).toLocaleString('en-GB',{maximumFractionDigits:d});

/* ---------- theme ---------- */
const root=document.documentElement;
try{const t=localStorage.getItem('theme'); if(t) root.dataset.theme=t; else if(matchMedia('(prefers-color-scheme:dark)').matches) root.dataset.theme='dark';}catch(e){}
$('#theme').onclick=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('theme',root.dataset.theme)}catch(e){}};

/* ---------- pages / nav ---------- */
const pages=$$('.page'); const order=pages.map(p=>p.id);
const groups={};
const rail=$('#rail');
let lastG='';
pages.forEach((p,i)=>{
  const g=p.dataset.group||''; if(g!==lastG){const h=document.createElement('h6');h.textContent=g;rail.appendChild(h);lastG=g;}
  const a=document.createElement('a');a.href='#'+p.id;a.dataset.id=p.id;a.innerHTML=`<i>${String(i+1).padStart(2,'0')}</i>${p.dataset.title}`;rail.appendChild(a);
});
function go(){
  let id=location.hash.slice(1).split('/')[0]; if(!order.includes(id)) id=order[0];
  const sub=location.hash.slice(1).split('/')[1];
  pages.forEach(p=>p.classList.toggle('on',p.id===id));
  $$('#rail a').forEach(a=>a.classList.toggle('on',a.dataset.id===id));
  rail.classList.remove('open');
  buildToc(id);
  if(sub){const el=document.getElementById(sub); if(el) el.scrollIntoView();} else window.scrollTo({top:0,behavior:'instant'});
  document.title=$('#'+id).dataset.title+' · MEV Detector Docs';
  const i=order.indexOf(id); const pn=$('.pn',$('#'+id));
  if(pn&&!pn.dataset.done){pn.dataset.done=1;
    pn.innerHTML=(i>0?`<a href="#${order[i-1]}"><small>Previous</small>${$('#'+order[i-1]).dataset.title}</a>`:'<span></span>')+
                 (i<order.length-1?`<a href="#${order[i+1]}" style="text-align:right"><small>Next</small>${$('#'+order[i+1]).dataset.title}</a>`:'<span></span>');}
  drawCharts($('#'+id));
}
function buildToc(id){
  const t=$('#toc'); t.innerHTML='<h6>On this page</h6>';
  $$('h2',$('#'+id)).forEach(h=>{ if(!h.id) h.id=id+'-'+h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const a=document.createElement('a');a.href='#'+id+'/'+h.id;a.textContent=h.textContent;a.onclick=e=>{e.preventDefault();h.scrollIntoView();history.replaceState(null,'','#'+id+'/'+h.id)};t.appendChild(a);});
}
addEventListener('scroll',()=>{const hs=$$('.page.on h2');let cur=null;hs.forEach(h=>{if(h.getBoundingClientRect().top<120)cur=h.id});
  $$('#toc a').forEach(a=>a.classList.toggle('on',cur&&a.getAttribute('href').endsWith('/'+cur)));},{passive:true});
addEventListener('hashchange',go);
$('#menu').onclick=()=>rail.classList.toggle('open');

/* ---------- code copy ---------- */
$$('.code').forEach(c=>{const b=document.createElement('button');b.className='cp';b.textContent='Copy';
  b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText($('pre',c).innerText).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1200)})};c.appendChild(b);});

/* ---------- search ---------- */
const idx=[];
pages.forEach(p=>{ $$('h1,h2,h3',p).forEach(h=>{ if(!h.id) h.id=p.id+'-'+h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let txt='';let n=h.nextElementSibling;let k=0;while(n&&!/^H[123]$/.test(n.tagName)&&k++<4){txt+=' '+n.textContent;n=n.nextElementSibling}
  idx.push({page:p.dataset.title,id:p.id,hid:h.id,title:h.textContent,text:(h.textContent+' '+txt).toLowerCase(),snip:txt.trim().slice(0,110)});});});
const sx=$('#sx'),si=$('#si'),sr=$('#sr');let sel=0,res=[];
function openS(){sx.classList.add('on');si.value='';render('');si.focus()}
function closeS(){sx.classList.remove('on')}
function render(q){q=q.toLowerCase().trim();const w=q.split(/\s+/).filter(Boolean);
  res=(w.length?idx.map(e=>({e,s:w.reduce((a,x)=>a+(e.title.toLowerCase().includes(x)?3:0)+(e.text.includes(x)?1:-99),0)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).map(o=>o.e):idx.filter(e=>/^H1$/.test(document.getElementById(e.hid).tagName))).slice(0,12);
  sel=0;sr.innerHTML=res.map((e,i)=>`<a href="#${e.id}/${e.hid}" class="${i?'':'sel'}"><b>${e.title}</b><small>${e.page} · ${e.snip}</small></a>`).join('')||'<a><small>No results</small></a>';}
si.oninput=()=>render(si.value);
sr.onclick=closeS;sx.onclick=e=>{if(e.target===sx)closeS()};$('#sbtn').onclick=openS;
addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openS()}
  else if(e.key==='Escape'){closeS();$('#lb').classList.remove('on')}
  else if(sx.classList.contains('on')){const as=$$('a',sr);
    if(e.key==='ArrowDown'){sel=Math.min(sel+1,as.length-1)}else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0)}
    else if(e.key==='Enter'&&as[sel]){location.hash=as[sel].getAttribute('href');closeS();return}else return;
    as.forEach((a,i)=>a.classList.toggle('sel',i===sel));as[sel]&&as[sel].scrollIntoView({block:'nearest'});e.preventDefault();}
  else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();openS()}
});

/* ---------- tooltip ---------- */
const tip=$('#tip');
function showTip(e,t){tip.textContent=t;tip.style.opacity=1;tip.style.left=Math.min(e.clientX+14,innerWidth-200)+'px';tip.style.top=(e.clientY+14)+'px'}
function hideTip(){tip.style.opacity=0}

/* ---------- charts ---------- */
const NS='http://www.w3.org/2000/svg';
function el(n,a={},p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function niceMax(v){const p=Math.pow(10,Math.floor(Math.log10(v||1)));const m=v/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p}
/* cfg: {el,title,sub,type:'line'|'bar',x:[labels],series:[{name,data,color,dash}],yMax,yMin,yTitle,xTitle,yFmt,log} */
function chart(cfg){
  const host=typeof cfg.el==='string'?$(cfg.el):cfg.el; if(!host) return; host.classList.add('chart');
  host.innerHTML=`<h4>${cfg.title||''}</h4><div class="sub">${cfg.sub||''}</div><div class="svgw"></div><div class="legend"></div>`;
  const hidden=new Set();
  const draw=()=>{
    const W=760,H=300,m={l:58,r:16,t:12,b:44};const iw=W-m.l-m.r,ih=H-m.t-m.b;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`});const g=el('g',{transform:`translate(${m.l},${m.t})`},svg);
    const vis=cfg.series.filter(s=>!hidden.has(s.name));
    const all=vis.flatMap(s=>s.data.filter(v=>v!=null));
    let ymax=cfg.yMax!=null?cfg.yMax:niceMax(Math.max(...all,1e-9)*1.05), ymin=cfg.yMin!=null?cfg.yMin:0;
    const log=!!cfg.log; if(log){ymin=cfg.yMin||Math.pow(10,Math.floor(Math.log10(Math.min(...all.filter(v=>v>0)))));ymax=Math.pow(10,Math.ceil(Math.log10(Math.max(...all))))}
    const Y=v=>log?ih-(Math.log10(Math.max(v,ymin))-Math.log10(ymin))/(Math.log10(ymax)-Math.log10(ymin))*ih:ih-(v-ymin)/(ymax-ymin)*ih;
    const n=cfg.x.length; const bw=iw/n; const X=i=>cfg.type==='bar'?bw*(i+.5):(n===1?iw/2:i*iw/(n-1));
    const ticks=log?[...Array(Math.round(Math.log10(ymax/ymin))+1)].map((_,i)=>ymin*Math.pow(10,i)):[...Array(6)].map((_,i)=>ymin+(ymax-ymin)*i/5);
    ticks.forEach(t=>{el('line',{x1:0,x2:iw,y1:Y(t),y2:Y(t),class:'gl'},g);el('text',{x:-8,y:Y(t)+4,'text-anchor':'end'},g).textContent=(cfg.yFmt||(v=>fmt(v,2)))(t)});
    el('line',{x1:0,x2:iw,y1:ih,y2:ih,class:'ax'},g);
    const step=Math.ceil(n/12);
    cfg.x.forEach((l,i)=>{if(i%step===0)el('text',{x:X(i),y:ih+18,'text-anchor':'middle'},g).textContent=l});
    if(cfg.xTitle)el('text',{x:iw/2,y:ih+38,'text-anchor':'middle'},g).textContent=cfg.xTitle;
    if(cfg.yTitle){const t=el('text',{transform:`translate(-46,${ih/2}) rotate(-90)`,'text-anchor':'middle'},g);t.textContent=cfg.yTitle}
    const ns=vis.length;
    vis.forEach((s,si)=>{const col=s.color||C[cfg.series.indexOf(s)%C.length];
      if(cfg.type==='bar'){
        s.data.forEach((v,i)=>{if(v==null)return;const w=bw*.78/ns;const x=X(i)-bw*.39+si*w;
          const r=el('rect',{x,y:Y(v),width:w-2,height:Math.max(0,ih-Y(v)),fill:col,rx:3},g);
          r.onmousemove=e=>showTip(e,`${cfg.x[i]}\n${s.name}: ${(cfg.tipFmt||fmt)(v)}`);r.onmouseleave=hideTip;});
      }else{
        let d='';s.data.forEach((v,i)=>{if(v==null)return;d+=(d?'L':'M')+X(i)+','+Y(v)});
        el('path',{d,fill:'none',stroke:col,'stroke-width':2.4,'stroke-dasharray':s.dash||'','stroke-linejoin':'round'},g);
        s.data.forEach((v,i)=>{if(v==null||n>40)return;const c=el('circle',{cx:X(i),cy:Y(v),r:4,fill:'var(--panel)',stroke:col,'stroke-width':2},g);
          c.onmousemove=e=>showTip(e,`${cfg.x[i]}\n${s.name}: ${(cfg.tipFmt||fmt)(v)}`);c.onmouseleave=hideTip;});
        if(n>40){const ov=el('rect',{x:0,y:0,width:iw,height:ih,fill:'transparent'},g);
          ov.onmousemove=e=>{const b=ov.getBoundingClientRect();const i=Math.max(0,Math.min(n-1,Math.round((e.clientX-b.left)/b.width*(n-1))));showTip(e,`${cfg.x[i]}\n`+vis.map(q=>`${q.name}: ${(cfg.tipFmt||fmt)(q.data[i])}`).join('\n'))};ov.onmouseleave=hideTip;}
      }});
    const w=$('.svgw',host);w.innerHTML='';w.appendChild(svg);
  };
  const lg=$('.legend',host);
  if(cfg.series.length>1||cfg.series[0].name){cfg.series.forEach((s,i)=>{const sp=document.createElement('span');sp.innerHTML=`<i style="background:${s.color||C[i%C.length]}"></i>${s.name}`;
    sp.onclick=()=>{hidden.has(s.name)?hidden.delete(s.name):hidden.add(s.name);sp.classList.toggle('off');draw()};lg.appendChild(sp)})}
  draw();
}
function table(host,cols,rows){host.innerHTML='<div class="tw"><table><thead><tr>'+cols.map(c=>`<th class="${c.n?'n':''}">${c.h}</th>`).join('')+'</tr></thead><tbody>'+
  rows.map(r=>'<tr>'+cols.map(c=>`<td class="${c.n?'n':''}">${c.f?c.f(r):r[c.k]}</td>`).join('')+'</tr>').join('')+'</tbody></table></div>'}

const drawn=new Set();
function drawCharts(page){ if(drawn.has(page.id)||!D.s1) return; drawn.add(page.id);
  $$('[data-chart]',page).forEach(h=>{const f=CH[h.dataset.chart];f&&f(h)});
  $$('[data-table]',page).forEach(h=>{const f=TB[h.dataset.table];f&&f(h)});
  $$('[data-tabs]',page).forEach(initTabs);
}
function initTabs(box){
  const names=$$('[data-tab]',box);const bar=document.createElement('div');bar.className='tabs';box.prepend(bar);
  names.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n.dataset.tab;b.onclick=()=>{$$('button',bar).forEach(x=>x.classList.remove('on'));b.classList.add('on');names.forEach(x=>x.style.display=x===n?'':'none')};bar.appendChild(b);if(i)n.style.display='none';else b.classList.add('on')})}

const tx=D.s1?D.s1.map(r=>String(r.tx)):[];
const CH={
 acc1:h=>chart({el:h,title:'Layer 2 accuracy vs block size',sub:'Synthetic workload, 1 node, mean of 5 repetitions. Recall falls above 400 tx/block because of the cap of five detections per block.',type:'line',x:tx,yMax:1,
   series:[{name:'Precision',data:D.s1.map(r=>r.p)},{name:'Recall',data:D.s1.map(r=>r.r)},{name:'F1',data:D.s1.map(r=>r.f1)}],xTitle:'transactions per block'}),
 accNodes:h=>chart({el:h,title:'Layer 2 accuracy vs worker threads',sub:'200 tx/block × 10 000 blocks. Identical for every node count (the analysis of a block is independent).',type:'line',x:D.s2.map(r=>String(r.n)),yMax:1,
   series:[{name:'Precision',data:D.s2.map(r=>r.p)},{name:'Recall',data:D.s2.map(r=>r.r)}],xTitle:'worker threads'}),
 decoy:h=>chart({el:h,title:'Precision vs decoy rate',sub:'Decoys are non-attack look-alikes. Prediction: precision = 0.75 / (0.75 + d), d in decoys per 100 tx.',type:'line',x:D.sens.map(r=>r.d+'%'),yMax:1,
   series:[{name:'Precision',data:D.sens.map(r=>r.p)},{name:'Recall',data:D.sens.map(r=>r.r)},{name:'F1',data:D.sens.map(r=>r.f1)},{name:'Formula',data:D.sens.map(r=>+(0.75/(0.75+r.d)).toFixed(3)),dash:'5 4',color:'#8a8a8a'}],xTitle:'decoys per 100 transactions'}),
 l1:h=>chart({el:h,title:'Layer 1 recall: corrected vs as first built',sub:'Precision was 1.00 in every run. The as-built version loses almost everything once the buffer fills.',type:'bar',x:tx,yMax:.16,
   series:[{name:'Corrected',data:D.s1.map(r=>r.l1r)},{name:'As first built',data:D.s1.map(r=>r.l1abr),color:'#c2410c'}],tipFmt:v=>fmt(v,4),xTitle:'transactions per block'}),
 lat1:h=>chart({el:h,title:'Layer 2 analysis time per block',sub:'Mean and 95th percentile, 1 node.',type:'line',x:tx,series:[{name:'Mean (ms)',data:D.s1.map(r=>r.lat)},{name:'95th percentile (ms)',data:D.s1.map(r=>r.p95)}],yTitle:'ms',xTitle:'transactions per block'}),
 lat2:h=>chart({el:h,title:'Latency against worker threads',sub:'Threads compete for the same cores, so the latency of one block rises as workers are added.',type:'line',x:D.s2.map(r=>String(r.n)),series:[{name:'Mean (ms)',data:D.s2.map(r=>r.lat)},{name:'95th percentile (ms)',data:D.s2.map(r=>r.p95)}],yTitle:'ms',xTitle:'worker threads'}),
 thr1:h=>chart({el:h,title:'Throughput vs block size (log scale)',sub:'In-memory analysis only. Layer 2 in tx/s ×10⁶ is converted to tx/s here; Layer 1 in tx/s.',type:'line',log:true,x:tx,
   series:[{name:'Layer 2 (tx/s)',data:D.s1.map(r=>r.thr*1e6)},{name:'Layer 1 (tx/s)',data:D.s1.map(r=>r.l1thr*1e3)}],yFmt:v=>v>=1e6?(v/1e6)+'M':v>=1e3?(v/1e3)+'k':v,xTitle:'transactions per block',tipFmt:v=>fmt(v,0)}),
 speed:h=>chart({el:h,title:'Speed-up over one worker thread',sub:'Six physical cores / 12 threads. Scaling on one machine only.',type:'line',x:D.s2.map(r=>String(r.n)),
   series:[{name:'Measured',data:D.s2.map(r=>r.speed)},{name:'Ideal',data:D.s2.map(r=>r.n),dash:'5 4',color:'#8a8a8a'}],yMax:16,xTitle:'worker threads'}),
 eff:h=>chart({el:h,title:'Parallel efficiency',sub:'E(n) = S(n) / n.',type:'bar',x:D.s2.map(r=>String(r.n)),series:[{name:'Efficiency',data:D.s2.map(r=>r.eff)}],yMax:1,xTitle:'worker threads'}),
 incl1:h=>chart({el:h,title:'Transaction inclusion vs burst size',sub:'Local Hardhat chain, one account. As built: only one transaction per burst is mined (1/n). Explicit nonces: all are mined.',type:'line',x:D.c1.map(r=>String(r.n)),yMax:1.05,
   series:[{name:'As built (concurrent)',data:D.c1.map(r=>r.incAB),color:'#c2410c'},{name:'Explicit nonces',data:D.c1.map(r=>r.incEN)}],xTitle:'detections in one burst'}),
 incl2:h=>chart({el:h,title:'Inclusion vs submitter nodes (batch of 20)',sub:'Sharded: batch split across nodes. Replicated: every node submits the whole batch.',type:'line',x:D.c2.map(r=>String(r.n)),yMax:1.05,
   series:[{name:'Sharded, as built',data:D.c2.map(r=>r.shAB_inc),color:'#c2410c'},{name:'Replicated, as built',data:D.c2.map(r=>r.repAB_inc),color:'#be185d'},{name:'Explicit nonces (both)',data:D.c2.map(r=>r.shEN_inc),color:'#0f766e'}],xTitle:'submitter nodes'}),
 gas1:h=>chart({el:h,title:'Total gas vs burst size (explicit nonces)',sub:'Linear growth: each detection in the test was a new address (70 922 gas each).',type:'bar',x:D.c1.map(r=>String(r.n)),series:[{name:'Gas',data:D.c1.map(r=>r.gasEN)}],yFmt:v=>v>=1e6?(v/1e6).toFixed(1)+'M':v/1e3+'k',tipFmt:v=>fmt(v,0),xTitle:'detections'}),
 gas2:h=>chart({el:h,title:'Total gas vs submitter nodes (explicit nonces)',sub:'Sharding keeps gas flat. Replication repeats the writes.',type:'bar',x:D.c2.map(r=>String(r.n)),series:[{name:'Sharded',data:D.c2.map(r=>r.shEN_gas)},{name:'Replicated',data:D.c2.map(r=>r.repEN_gas),color:'#c2410c'}],yFmt:v=>v>=1e6?(v/1e6).toFixed(1)+'M':v/1e3+'k',tipFmt:v=>fmt(v,0),xTitle:'submitter nodes'}),
 flaglat:h=>chart({el:h,title:'Flag confirmation time (local chain)',sub:'Matches the 2 s block interval set for the node. Base Sepolia was not measured.',type:'line',x:D.c1.map(r=>String(r.n)),yMin:1000,yMax:2500,
   series:[{name:'As built (ms)',data:D.c1.map(r=>r.latAB)},{name:'Explicit nonces (ms)',data:D.c1.map(r=>r.latEN)}],xTitle:'detections in burst'}),
 cum:h=>chart({el:h,title:'Cumulative Layer 2 candidates (live mainnet, 120 min)',sub:'Roughly 3 per minute. 367 in total, 25 validated.',type:'line',x:D.liveCum.map(r=>String(r.m)),series:[{name:'Candidates',data:D.liveCum.map(r=>r.c)}],yMax:400,xTitle:'minutes since start'}),
 bins:h=>chart({el:h,title:'Candidates per 100 blocks by block size',sub:'The last two bins hold 5 and 3 blocks only, so they are noisy.',type:'bar',x:D.liveBins.map(r=>r.label),series:[{name:'Per 100 blocks',data:D.liveBins.map(r=>r.per100)}],tipFmt:v=>fmt(v,1),xTitle:'transactions in block'}),
 reasons:h=>chart({el:h,title:'Why 342 candidates were rejected',sub:'Token-flow validation, reasons in order of frequency.',type:'bar',x:D.reasons.map(r=>r.k.replace(/_/g,' ').replace('victim ','v. ').slice(0,18)),series:[{name:'Candidates',data:D.reasons.map(r=>r.v)}],tipFmt:v=>fmt(v,0)}),
 cdf:h=>chart({el:h,title:'Delay from block header to flagged candidate, by percentile',sub:'Median (50) 523 ms, 95th percentile 1 125 ms. Each point is the delay not exceeded by that percentage of candidates.',type:'line',x:D.delayCdf.map(r=>String(Math.round(r.q*100))),series:[{name:'Delay (ms)',data:D.delayCdf.map(r=>r.x)}],yTitle:'ms',xTitle:'percentile'}),
 pend:h=>chart({el:h,title:'Pending hashes received vs fetched (per minute)',sub:'Layer 1 intake. About 4 060 hashes per minute arrive; about 813 are fetched successfully.',type:'line',x:D.pend.map(r=>r.m+''),series:[{name:'Received',data:D.pend.map(r=>r.rec)},{name:'Fetched OK',data:D.pend.map(r=>r.ok)},{name:'Dropped from queue',data:D.pend.map(r=>r.drop),color:'#c2410c'}],xTitle:'minute of run'}),
 buf:h=>chart({el:h,title:'Layer 1 buffer and queue size',sub:'Buffer (limit 3 000) fills by about minute 4; the fetch queue (limit 2 000) is full all run.',type:'line',x:D.pend.map(r=>r.m+''),series:[{name:'Rolling buffer',data:D.pend.map(r=>r.buf)},{name:'Fetch queue',data:D.pend.map(r=>r.q)}],yMax:3500,xTitle:'minute of run'}),
};
const TB={
 s1:h=>table(h,[{h:'Tx / block',k:'tx',n:1},{h:'Precision',f:r=>fmt(r.p),n:1},{h:'Recall',f:r=>fmt(r.r),n:1},{h:'F1',f:r=>fmt(r.f1),n:1},{h:'Victim correct',f:r=>fmt(r.victim,2),n:1},{h:'Mean ms',f:r=>fmt(r.lat),n:1},{h:'p95 ms',f:r=>fmt(r.p95),n:1},{h:'L2 M tx/s',f:r=>fmt(r.thr,2),n:1},{h:'L1 k tx/s',f:r=>fmt(r.l1thr,1),n:1}],D.s1),
 s2:h=>table(h,[{h:'Nodes',k:'n',n:1},{h:'Precision',f:r=>fmt(r.p),n:1},{h:'Recall',f:r=>fmt(r.r),n:1},{h:'Mean ms',f:r=>fmt(r.lat),n:1},{h:'p95 ms',f:r=>fmt(r.p95),n:1},{h:'M tx/s',f:r=>fmt(r.thr,2),n:1},{h:'Blocks/s',f:r=>fmt(r.bps,0),n:1},{h:'Speed-up',f:r=>fmt(r.speed,2),n:1},{h:'Efficiency',f:r=>fmt(r.eff,2),n:1}],D.s2),
 sens:h=>table(h,[{h:'Decoys per 100 tx',f:r=>r.d.toFixed(2)+' %',n:1},{h:'Precision',f:r=>fmt(r.p),n:1},{h:'Recall',f:r=>fmt(r.r),n:1},{h:'F1',f:r=>fmt(r.f1),n:1}],D.sens),
 l1:h=>table(h,[{h:'Tx / block',k:'tx',n:1},{h:'Recall (corrected)',f:r=>fmt(r.l1r),n:1},{h:'Recall (as built)',f:r=>fmt(r.l1abr,4),n:1}],D.s1),
 reasons:h=>table(h,[{h:'Rejection reason',f:r=>`<code>${r.k}</code>`},{h:'Candidates',k:'v',n:1}],D.reasons),
 bins:h=>table(h,[{h:'Tx per block',k:'label'},{h:'Blocks',k:'n',n:1},{h:'Mean tx',k:'tx',n:1},{h:'Fetch ms',k:'fetch',n:1},{h:'Analysis ms',f:r=>fmt(r.an),n:1},{h:'Candidates',k:'det',n:1},{h:'Per 100 blocks',f:r=>fmt(r.per100,1),n:1}],D.liveBins),
 valid:h=>table(h,[{h:'#',k:'i',n:1},{h:'Block',k:'block',n:1},{h:'Attacker',f:r=>`<code>${r.att}</code>`},{h:'Unwind ratio',f:r=>fmt(r.ratio,4),n:1},{h:'Validation ms',k:'ms',n:1},{h:'Label',f:r=>`<span class="tag ${r.label==='TP'?'ok':r.label==='FP'?'bad':'warn'}">${r.label}</span>`}],D.valid),
 c1:h=>table(h,[{h:'Burst',k:'n',n:1},{h:'Inclusion, as built',f:r=>fmt(r.incAB,2),n:1},{h:'Inclusion, explicit nonces',f:r=>fmt(r.incEN,2),n:1},{h:'Total gas (explicit)',f:r=>fmt(r.gasEN,0),n:1},{h:'Mean confirm ms',f:r=>fmt(r.latEN,0),n:1}],D.c1),
 c2:h=>table(h,[{h:'Nodes',k:'n',n:1},{h:'Sharded, as built',f:r=>fmt(r.shAB_inc,3),n:1},{h:'Replicated, as built',f:r=>fmt(r.repAB_inc,3),n:1},{h:'Sharded, nonces',f:r=>fmt(r.shEN_inc,2),n:1},{h:'Replicated, nonces',f:r=>fmt(r.repEN_inc,2),n:1},{h:'Gas sharded',f:r=>fmt(r.shEN_gas,0),n:1},{h:'Gas replicated',f:r=>fmt(r.repEN_gas,0),n:1}],D.c2),
 gas:h=>table(h,[{h:'Function',f:r=>`<code>${r.fn}</code>`},{h:'Gas (local node)',f:r=>fmt(r.gas,0),n:1}],D.gas),
};

/* ---------- gallery ---------- */
const FIG=[['s1_accuracy','Scenario 1 · accuracy'],['s2_accuracy','Scenario 2 · accuracy'],['sens_decoys','Decoy sensitivity'],['s1_layer1','Layer 1 cost'],['s1_latency','S1 · latency'],['s2_latency','S2 · latency'],['s1_throughput','S1 · throughput'],['s2_throughput','S2 · throughput'],['s1_scalability','S1 · cost per tx'],['s2_scalability_speedup','S2 · speed-up'],['s2_scalability_efficiency','S2 · efficiency'],['s1_inclusion','Chain S1 · inclusion'],['s2_inclusion','Chain S2 · inclusion'],['s1_gas','Chain S1 · gas'],['s2_gas','Chain S2 · gas'],['s1_flaglatency','Chain S1 · flag latency'],['s2_flaglatency','Chain S2 · flag latency'],['live_cumulative_detections','Live · cumulative'],['live_detection_rate_vs_blocksize','Live · rate vs size'],['live_validation_funnel','Live · funnel'],['live_validation_reasons','Live · rejections'],['live_latency_cdf','Live · delay CDF'],['live_latency_vs_blocksize','Live · time vs size'],['live_layer1_buffer','Live · L1 buffer'],['live_pending_throughput','Live · pending intake'],['live_fetch_age','Live · fetch age']];
const gal=$('#galgrid');if(gal){gal.innerHTML=FIG.map(([f,t])=>`<figure data-f="${f}"><img loading="lazy" src="assets/figures/${f}.png" alt="${t}"><figcaption>${t}</figcaption></figure>`).join('');
  gal.onclick=e=>{const f=e.target.closest('figure');if(!f)return;$('#lbi').src=f.querySelector('img').src;$('#lbt').textContent=f.querySelector('figcaption').textContent;$('#lb').classList.add('on')}}
$('#lb').onclick=()=>$('#lb').classList.remove('on');
$$('img[data-zoom]').forEach(i=>i.onclick=()=>{$('#lbi').src=i.src;$('#lbt').textContent=i.alt;$('#lb').classList.add('on')});

if(!location.hash) location.hash='#'+order[0]; go();
})();
