// Admin dashboard HTML — served directly by the worker at /admin
export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin · Naturally Elevated Co.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root{--bg:#0C0B09;--sf:#141210;--sf2:#1A1714;--br:#2E2822;--tx:#EDE8DC;--mu:#7A6A58;--gd:#D4952A;--tc:#C4602A;--gr:#3A7A3A}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--bg);color:var(--tx);font-family:'Outfit',sans-serif;min-height:100vh}
    #login{display:flex;align-items:center;justify-content:center;min-height:100vh}
    .lc{background:var(--sf);border:1px solid var(--br);border-radius:12px;padding:2.5rem 2rem;width:300px;text-align:center}
    .lm{width:52px;height:52px;margin:0 auto 1.25rem}
    .lt{font-size:.78rem;font-weight:700;letter-spacing:4px;color:var(--mu);margin-bottom:.2rem}
    .ls{font-size:.7rem;color:var(--mu);margin-bottom:1.5rem;opacity:.7}
    .li{width:100%;background:var(--bg);border:1px solid var(--br);border-radius:6px;color:var(--tx);font-family:'Outfit',sans-serif;font-size:.9rem;padding:.65rem 1rem;margin-bottom:.75rem;outline:none;transition:border-color .2s}
    .li:focus{border-color:var(--gd)}
    .lb{width:100%;background:var(--gd);border:none;border-radius:6px;color:#0C0B09;cursor:pointer;font-family:'Outfit',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:2px;padding:.72rem;transition:opacity .2s}
    .lb:hover{opacity:.85}.lb:disabled{opacity:.5;cursor:default}
    .le{color:var(--tc);font-size:.75rem;margin-top:.5rem;min-height:1.1em}
    #dashboard{display:none}
    .ah{background:var(--sf);border-bottom:1px solid var(--br);padding:.9rem 1.75rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
    .ab{display:flex;align-items:center;gap:.65rem;font-size:.72rem;font-weight:700;letter-spacing:3px;color:var(--mu)}
    .aa{display:flex;align-items:center;gap:.75rem}
    .tk{font-size:.7rem;color:var(--mu)}
    .bx{background:transparent;border:1px solid var(--br);border-radius:4px;color:var(--mu);cursor:pointer;font-family:'Outfit',sans-serif;font-size:.68rem;letter-spacing:1px;padding:.35rem .7rem;transition:border-color .18s,color .18s}
    .bx:hover{border-color:var(--gd);color:var(--gd)}
    .body{max-width:1100px;margin:0 auto;padding:1.75rem 1.5rem}
    .sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.85rem;margin-bottom:2rem}
    .sc{background:var(--sf);border:1px solid var(--br);border-radius:8px;padding:1.1rem 1.25rem}
    .sl{font-size:.6rem;font-weight:700;letter-spacing:2.5px;color:var(--mu);text-transform:uppercase;margin-bottom:.4rem}
    .sv{font-size:1.65rem;font-weight:700}.sv.gd{color:var(--gd)}
    .sh{font-size:.7rem;color:var(--mu);margin-top:.2rem}
    .sec{margin-bottom:2.25rem}
    .stl{font-size:.62rem;font-weight:700;letter-spacing:3px;color:var(--mu);text-transform:uppercase;margin-bottom:.8rem}
    .tw{background:var(--sf);border:1px solid var(--br);border-radius:8px;overflow:hidden;overflow-x:auto}
    table{width:100%;border-collapse:collapse}
    th{font-size:.6rem;font-weight:700;letter-spacing:2px;color:var(--mu);text-align:left;padding:.7rem 1rem;border-bottom:1px solid var(--br)}
    td{font-size:.8rem;padding:.7rem 1rem;border-bottom:1px solid var(--br);color:var(--tx)}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:var(--sf2)}
    .am{font-weight:600;color:var(--gd)}.dm{color:var(--mu)}
    .er td{text-align:center;padding:2rem;color:var(--mu);font-size:.82rem}
    .badge{display:inline-block;border-radius:20px;font-size:.6rem;font-weight:700;letter-spacing:.5px;padding:.18rem .55rem;text-transform:uppercase}
    .bg{background:rgba(58,122,58,.12);color:#6acf6a;border:1px solid rgba(58,122,58,.25)}
    .bo{background:rgba(212,149,42,.12);color:var(--gd);border:1px solid rgba(212,149,42,.25)}
    .bm{background:rgba(122,106,88,.12);color:var(--mu);border:1px solid rgba(122,106,88,.18)}
    .br2{background:rgba(196,96,42,.12);color:var(--tc);border:1px solid rgba(196,96,42,.25)}
    .spin{text-align:center;padding:3.5rem;color:var(--mu)}
    .dots{display:inline-flex;gap:5px}
    .dots span{width:6px;height:6px;border-radius:50%;background:var(--gd);animation:dp 1.2s ease-in-out infinite}
    .dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
    @keyframes dp{0%,80%,100%{opacity:.25;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}
    .sparkbar{display:inline-block;width:3px;background:var(--gd);border-radius:1px;vertical-align:bottom;margin:0 1px;opacity:.7}
    @media(max-width:600px){.ah{padding:.7rem 1rem}.body{padding:1rem}.sv{font-size:1.3rem}th,td{padding:.55rem .75rem;font-size:.75rem}.tk{display:none}}
  </style>
</head>
<body>
<div id="login">
  <div class="lc">
    <svg class="lm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#141210"/>
      <g fill="#D4952A"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
      <g fill="#D4952A" transform="rotate(180 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
      <g fill="#D4952A" transform="rotate(90 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
      <g fill="#D4952A" transform="rotate(270 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
      <circle cx="50" cy="50" r="16" fill="#D4952A"/>
      <rect x="46.5" y="26" width="7" height="30" rx="3.5" fill="#C4602A"/>
      <rect x="33" y="36" width="13.5" height="6" rx="3" fill="#C4602A"/>
      <rect x="33" y="26" width="6" height="16" rx="3" fill="#C4602A"/>
      <rect x="53.5" y="36" width="13.5" height="6" rx="3" fill="#C4602A"/>
      <rect x="61" y="26" width="6" height="16" rx="3" fill="#C4602A"/>
    </svg>
    <p class="lt">ADMIN</p>
    <p class="ls">Naturally Elevated Co.</p>
    <input type="password" id="pwd" class="li" placeholder="Password" autocomplete="current-password">
    <button class="lb" id="lbtn">SIGN IN</button>
    <p class="le" id="lerr"></p>
  </div>
</div>

<div id="dashboard">
  <header class="ah">
    <div class="ab">
      <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#141210"/>
        <g fill="#D4952A"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
        <g fill="#D4952A" transform="rotate(180 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
        <g fill="#D4952A" transform="rotate(90 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
        <g fill="#D4952A" transform="rotate(270 50 50)"><rect x="45.5" y="10" width="3" height="10" rx="1.5"/><rect x="48.5" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="52" y="7.5" width="3.5" height="12" rx="1.75"/><rect x="55.5" y="10" width="3" height="10" rx="1.5"/></g>
        <circle cx="50" cy="50" r="16" fill="#D4952A"/>
        <rect x="46.5" y="26" width="7" height="30" rx="3.5" fill="#C4602A"/>
        <rect x="33" y="36" width="13.5" height="6" rx="3" fill="#C4602A"/>
        <rect x="33" y="26" width="6" height="16" rx="3" fill="#C4602A"/>
        <rect x="53.5" y="36" width="13.5" height="6" rx="3" fill="#C4602A"/>
        <rect x="61" y="26" width="6" height="16" rx="3" fill="#C4602A"/>
      </svg>
      ADMIN
    </div>
    <div class="aa">
      <span class="tk" id="tk">Refreshing in 60s</span>
      <button class="bx" id="rbtn">↻ REFRESH</button>
      <button class="bx" id="obtn">SIGN OUT</button>
    </div>
  </header>

  <div class="body">
    <div id="spin" class="spin"><div class="dots"><span></span><span></span><span></span></div></div>
    <div id="ct" style="display:none">

      <!-- Revenue + Traffic stats -->
      <div class="sg">
        <div class="sc"><div class="sl">Revenue Today</div><div class="sv gd" id="s1">—</div></div>
        <div class="sc"><div class="sl">Revenue (30d)</div><div class="sv gd" id="s2">—</div></div>
        <div class="sc"><div class="sl">All-Time Revenue</div><div class="sv gd" id="s3">—</div></div>
        <div class="sc"><div class="sl">Stripe Balance</div><div class="sv" id="s4">—</div><div class="sh" id="s5">—</div></div>
        <div class="sc"><div class="sl">Visitors Today</div><div class="sv" id="s6">—</div><div class="sh" id="s6b">— pageviews</div></div>
        <div class="sc"><div class="sl">Visitors (7d)</div><div class="sv" id="s7">—</div><div class="sh" id="s7b">— pageviews</div></div>
        <div class="sc"><div class="sl">Visitors (30d)</div><div class="sv" id="s8">—</div><div class="sh" id="s8b">— pageviews</div></div>
        <div class="sc"><div class="sl">Requests (1h)</div><div class="sv" id="s9">—</div><div class="sh">last hour</div></div>
      </div>

      <!-- Recent Orders -->
      <div class="sec">
        <div class="stl">Recent Orders — Stripe</div>
        <div class="tw"><table>
          <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>AMOUNT</th><th>DATE</th></tr></thead>
          <tbody id="to"></tbody>
        </table></div>
      </div>

      <!-- Two columns: Printify + Top Pages -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem">
        <div class="sec" style="margin-bottom:0">
          <div class="stl">Printify Fulfillment</div>
          <div class="tw"><table>
            <thead><tr><th>ORDER</th><th>STATUS</th><th>DATE</th></tr></thead>
            <tbody id="tp"></tbody>
          </table></div>
        </div>
        <div class="sec" style="margin-bottom:0">
          <div class="stl">Top Pages (7d)</div>
          <div class="tw"><table>
            <thead><tr><th>PATH</th><th>VISITORS</th></tr></thead>
            <tbody id="tt"></tbody>
          </table></div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
const $=id=>document.getElementById(id),K='nec_adm';
let cd=60,tmr;
const f$=n=>'$'+Number(n).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');
const fD=ts=>new Date(ts*1000).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const fn=n=>Number(n).toLocaleString();

function bdg(s){
  const m={fulfilled:['bg','✓ Fulfilled'],shipped:['bg','✓ Shipped'],'in-production':['bo','⚙ In Production'],'sending-to-production':['bo','⚙ Sending'],pending:['bm','· Pending'],'on-hold':['bm','⏸ On Hold'],canceled:['br2','✕ Canceled']};
  const[c,l]=m[s]||['bm',s];return \`<span class="badge \${c}">\${l}</span>\`;
}

async function load(){
  const key=sessionStorage.getItem(K);if(!key)return;
  $('spin').style.display='block';$('ct').style.display='none';
  try{
    const[sr,tr]=await Promise.all([
      fetch('/api/admin/stats',{headers:{'x-admin-key':key}}),
      fetch('/api/admin/traffic',{headers:{'x-admin-key':key}})
    ]);
    if(sr.status===401){logout();return;}
    const d=await sr.json();
    const t=tr.ok?await tr.json():{};

    $('s1').textContent=f$(d.revenue.today);
    $('s2').textContent=f$(d.revenue.month);
    $('s3').textContent=f$(d.revenue.total);
    $('s4').textContent=f$(d.balance.available);
    $('s5').textContent=f$(d.balance.pending)+' pending';

    if(t.today){
      $('s6').textContent=fn(t.today.uniques);$('s6b').textContent=fn(t.today.pageViews)+' pageviews';
      $('s7').textContent=fn(t.week.uniques);$('s7b').textContent=fn(t.week.pageViews)+' pageviews';
      $('s8').textContent=fn(t.month.uniques);$('s8b').textContent=fn(t.month.pageViews)+' pageviews';
      $('s9').textContent=fn(t.lastHour.requests);
    }

    $('to').innerHTML=d.orders.length
      ?d.orders.map(o=>\`<tr><td><code style="color:var(--gd);font-size:.76rem">#\${o.id}</code></td><td>\${o.customer}</td><td class="dm" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${o.items}</td><td class="am">\${f$(o.amount)}</td><td class="dm">\${fD(o.created)}</td></tr>\`).join('')
      :'<tr class="er"><td colspan="5">No orders yet</td></tr>';

    $('tp').innerHTML=d.printifyOrders.length
      ?d.printifyOrders.map(o=>\`<tr><td><code style="color:var(--mu);font-size:.76rem">\${o.label}</code></td><td>\${bdg(o.status)}</td><td class="dm">\${o.created?new Date(o.created).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}</td></tr>\`).join('')
      :'<tr class="er"><td colspan="3">No Printify orders yet</td></tr>';

    $('tt').innerHTML=t.topPaths&&t.topPaths.length
      ?t.topPaths.map(p=>\`<tr><td class="dm" style="font-size:.75rem">\${p.path||'/'}</td><td class="am">\${fn(p.uniques)}</td></tr>\`).join('')
      :'<tr class="er"><td colspan="2">No data</td></tr>';

    $('spin').style.display='none';$('ct').style.display='block';
  }catch(e){$('spin').innerHTML='<p style="color:var(--tc)">Load failed. Retrying…</p>';}
  resetCd();
}

function resetCd(){clearInterval(tmr);cd=60;tmr=setInterval(()=>{cd--;$('tk').textContent=\`Refreshing in \${cd}s\`;if(cd<=0)load();},1000);}
function logout(){sessionStorage.removeItem(K);clearInterval(tmr);$('dashboard').style.display='none';$('login').style.display='flex';$('pwd').value='';}

async function tryLogin(){
  const pw=$('pwd').value.trim();if(!pw)return;
  $('lbtn').disabled=true;$('lbtn').textContent='...';$('lerr').textContent='';
  try{
    const r=await fetch('/api/admin/stats',{headers:{'x-admin-key':pw}});
    if(r.ok){sessionStorage.setItem(K,pw);$('login').style.display='none';$('dashboard').style.display='block';load();}
    else{$('lerr').textContent='Incorrect password.';$('pwd').value='';$('pwd').focus();}
  }catch{$('lerr').textContent='Connection error.';}
  $('lbtn').disabled=false;$('lbtn').textContent='SIGN IN';
}

if(sessionStorage.getItem(K)){$('login').style.display='none';$('dashboard').style.display='block';load();}
$('lbtn').addEventListener('click',tryLogin);
$('pwd').addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin();});
$('obtn').addEventListener('click',logout);
$('rbtn').addEventListener('click',load);
</script>
</body>
</html>`;
