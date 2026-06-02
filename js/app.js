/* app.js — Main application logic */
let currentUser=null;
let D={};
let moodChart,sleepChart,weightChart,pieChart;
let currentTxType='income';
let currentSleepQ=3;

/* ===== STORAGE ===== */
function userKey(suffix){return`sh_data_${currentUser.uid}_${suffix}`}
function loadData(){
  try{return JSON.parse(localStorage.getItem(userKey('main'))||'{}')}catch{return{}}
}
function saveData(){localStorage.setItem(userKey('main'),JSON.stringify(D))}
function getToday(){return new Date().toISOString().slice(0,10)}

/* ===== APP START ===== */
function startApp(user){
  currentUser=user;
  D=loadData();
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  initHeader();
  initHabits();
  renderPriorities();
  renderMeals();
  initMoodUI();
  initSleepUI();
  updateWeightMetrics();
  renderFitness();
  renderNotifs();
  renderProfileCard();
  showTab('daily');
  setInterval(saveData,30000);
}

/* ===== HEADER ===== */
function initHeader(){
  const hr=new Date().getHours();
  const greet=hr<12?'Selamat Pagi':hr<17?'Selamat Siang':hr<20?'Selamat Sore':'Selamat Malam';
  const greeting=hr<12?'Selamat Pagi ☀️':hr<17?'Selamat Siang 🌤️':hr<20?'Selamat Sore 🌅':'Selamat Malam 🌙';
  document.getElementById('header-greeting').textContent=greeting+', '+currentUser.name.split(' ')[0]+'!';
  const now=new Date();
  const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  document.getElementById('header-date').textContent=days[now.getDay()]+', '+now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
  document.getElementById('header-avatar').textContent=currentUser.name.charAt(0).toUpperCase();
}

/* ===== TABS ===== */
function showTab(t){
  document.querySelectorAll('.tab-content').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+t).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${t}"]`)?.classList.add('active');
  document.getElementById('appContent').scrollTop=0;
  if(t==='mood'){setTimeout(()=>{renderMoodChart();renderSleepChart();},50)}
  if(t==='health'){setTimeout(()=>renderWeightChart(),50)}
  if(t==='finance'){renderFinance();setTimeout(()=>renderPieChart(),50)}
}

/* ===== TOAST ===== */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

/* ===== PRIORITIES ===== */
function renderPriorities(){
  if(!D.priorities)D.priorities={};
  const today=getToday();
  if(!D.priorities[today])D.priorities[today]=[];
  const list=D.priorities[today];
  const done=list.filter(p=>p.done).length;
  document.getElementById('pri-count').textContent=done+'/'+list.length;
  const el=document.getElementById('priorities-list');
  if(!list.length){el.innerHTML='<div class="empty-hint">Tambah prioritas kamu hari ini</div>';return}
  el.innerHTML=list.map((p,i)=>`
    <div class="pri-item">
      <div class="check-box${p.done?' checked':''}" onclick="togglePri(${i})">${p.done?'✓':''}</div>
      <span class="pri-text${p.done?' done':''}">${escHtml(p.text)}</span>
      <button class="btn-remove" onclick="removePri(${i})"><i class="ti ti-x"></i></button>
    </div>`).join('');
}
function addPriority(){
  const v=document.getElementById('pri-inp').value.trim();if(!v)return;
  const today=getToday();if(!D.priorities)D.priorities={};if(!D.priorities[today])D.priorities[today]=[];
  D.priorities[today].push({text:v,done:false});saveData();
  document.getElementById('pri-inp').value='';renderPriorities();
}
function togglePri(i){const today=getToday();D.priorities[today][i].done=!D.priorities[today][i].done;saveData();renderPriorities();}
function removePri(i){const today=getToday();D.priorities[today].splice(i,1);saveData();renderPriorities();}

/* ===== HABITS ===== */
const DEFAULT_HABITS=['Meditasi 🧘','Baca 📚','Minum Air Putih 💧','Makan Sehat 🥗','Tidur Cukup 😴','Jurnal ✍️','Ibadah & Bersyukur 🙏','Belajar 📖','Media Sosial Sehat 📱','Lari / Olahraga 🏃','Check Financial 💰','Berkarya 🎨','Bersedekah 🤝'];
function initHabits(){
  if(!D.habits)D.habits=DEFAULT_HABITS.map(n=>({name:n}));
  if(!D.habitLog)D.habitLog={};
  renderHabits();renderHabitEditor();
}
function renderHabits(){
  const today=getToday();if(!D.habitLog[today])D.habitLog[today]={};
  const total=D.habits.length;
  const done=Object.values(D.habitLog[today]).filter(Boolean).length;
  const pct=total>0?Math.round((done/total)*100):0;
  document.getElementById('habit-count').textContent=pct+'%';
  const el=document.getElementById('habits-list');
  el.innerHTML=D.habits.map((h,i)=>{
    const checked=!!D.habitLog[today][i];
    const streak=calcStreak(i);
    return`<div class="habit-row">
      <div class="check-box${checked?' checked':''}" onclick="toggleHabit(${i})">${checked?'✓':''}</div>
      <span class="habit-name">${escHtml(h.name)}</span>
      <span class="habit-streak">${streak>0?'🔥'+streak:''}</span>
    </div>`;
  }).join('');
}
function calcStreak(idx){
  let s=0;const today=new Date();
  for(let i=1;i<=60;i++){const d=new Date(today);d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);if(D.habitLog&&D.habitLog[k]&&D.habitLog[k][idx])s++;else break;}
  return s;
}
function toggleHabit(i){
  const today=getToday();if(!D.habitLog[today])D.habitLog[today]={};
  D.habitLog[today][i]=!D.habitLog[today][i];saveData();renderHabits();
}
function renderHabitEditor(){
  const el=document.getElementById('habit-editor');
  if(!el)return;
  el.innerHTML=D.habits.map((h,i)=>`
    <div class="habit-row">
      <span class="habit-name">${escHtml(h.name)}</span>
      <button class="btn-remove" onclick="removeHabit(${i})"><i class="ti ti-trash"></i></button>
    </div>`).join('');
}
function addHabit(){
  const v=document.getElementById('new-habit-inp').value.trim();if(!v)return;
  D.habits.push({name:v});saveData();document.getElementById('new-habit-inp').value='';
  renderHabits();renderHabitEditor();showToast('Habit ditambah! ✓');
}
function removeHabit(i){
  if(!confirm('Hapus habit ini?'))return;
  D.habits.splice(i,1);saveData();renderHabits();renderHabitEditor();
}

/* ===== MEALS ===== */
const MEAL_TYPES=['Breakfast','Lunch','Dinner','Snacks'];
function renderMeals(){
  if(!D.meals)D.meals={};
  const today=getToday();if(!D.meals[today])D.meals[today]={};
  const el=document.getElementById('meals-card');
  el.innerHTML=MEAL_TYPES.map(m=>`
    <div class="meal-row">
      <span class="meal-label">${m}</span>
      <input class="inp" style="flex:1" placeholder="—" value="${escHtml(D.meals[today][m]||'')}" onchange="saveMeal('${m}',this.value)">
    </div>`).join('');
}
function saveMeal(m,v){
  const today=getToday();if(!D.meals)D.meals={};if(!D.meals[today])D.meals[today]={};
  D.meals[today][m]=v;saveData();
}

/* ===== REFLECTION ===== */
function saveReflection(){
  const today=getToday();if(!D.reflections)D.reflections={};
  D.reflections[today]={mood:document.getElementById('refl-mood').value,best:document.getElementById('refl-best').value,score:document.getElementById('day-score').value,ts:new Date().toISOString()};
  saveData();showToast('Reflection tersimpan ✨');
}

/* ===== MOOD ===== */
const MOOD_LABELS=['Sedih','Biasa aja','Oke','Senang','Luar biasa!'];
function setMood(i){
  if(!D.moods)D.moods={};D.moods[getToday()]=i;saveData();
  document.querySelectorAll('.mood-btn').forEach((b,j)=>b.classList.toggle('sel',j===i));
  showToast('Mood tersimpan: '+MOOD_LABELS[i]);
  renderMoodChart();
}
function initMoodUI(){
  if(!D.moods)return;
  const v=D.moods[getToday()];
  if(v!==undefined)document.querySelectorAll('.mood-btn').forEach((b,j)=>b.classList.toggle('sel',j===v));
}

/* ===== MOOD CHART ===== */
function renderMoodChart(){
  const MOODS=['😔','😐','🙂','😊','🤩'];
  const days=[],vals=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push(k.slice(5));vals.push(D.moods&&D.moods[k]!==undefined?D.moods[k]:null);}
  const ctx=document.getElementById('moodChart');if(!ctx)return;
  if(moodChart)moodChart.destroy();
  moodChart=new Chart(ctx,{type:'line',data:{labels:days,datasets:[{data:vals,borderColor:'#1e6fff',backgroundColor:'rgba(30,111,255,.12)',tension:.4,pointRadius:5,pointBackgroundColor:'#1e6fff',pointBorderColor:'#0a0f1e',pointBorderWidth:2,spanGaps:true,fill:true}]},options:{responsive:false,plugins:{legend:{display:false}},scales:{y:{min:-0.5,max:4.5,ticks:{stepSize:1,callback:v=>MOODS[v]||'',color:'#4a5a88',font:{size:14}},grid:{color:'rgba(30,111,255,.08)'}},x:{ticks:{color:'#4a5a88',font:{size:11}},grid:{color:'rgba(30,111,255,.08)'}}}}});
  ctx.style.width='100%';ctx.style.height='180px';
}

/* ===== SLEEP ===== */
function initSleepUI(){setSleepQ(3);calcSleep();}
function setSleepQ(n){
  currentSleepQ=n;
  document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('on',i<n));
  calcSleep();
}
function calcSleep(){
  const s=document.getElementById('sleep-start')?.value;
  const e=document.getElementById('sleep-end')?.value;
  if(!s||!e)return null;
  let [sh,sm]=[parseInt(s.split(':')[0]),parseInt(s.split(':')[1])];
  let [eh,em]=[parseInt(e.split(':')[0]),parseInt(e.split(':')[1])];
  let mins=(eh*60+em)-(sh*60+sm);if(mins<0)mins+=24*60;
  const h=(mins/60).toFixed(1);
  const el=document.getElementById('sleep-calc');
  if(el){
    const status=parseFloat(h)>=7?'✅ Bagus!':parseFloat(h)>=6?'⚠️ Kurang':'❌ Kurang banget';
    el.textContent='Durasi: '+h+' jam '+status;
  }
  return parseFloat(h);
}
function saveSleep(){
  const h=calcSleep();if(!h)return;
  if(!D.sleep)D.sleep={};
  D.sleep[getToday()]={hours:h,quality:currentSleepQ,start:document.getElementById('sleep-start').value,end:document.getElementById('sleep-end').value};
  saveData();showToast('Sleep tersimpan 💤 '+h+' jam');
}
function renderSleepChart(){
  const days=[],hrs=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push(k.slice(5));const s=D.sleep&&D.sleep[k];hrs.push(s?s.hours:null);}
  const ctx=document.getElementById('sleepChart');if(!ctx)return;
  if(sleepChart)sleepChart.destroy();
  sleepChart=new Chart(ctx,{type:'bar',data:{labels:days,datasets:[{data:hrs,backgroundColor:'rgba(30,111,255,.5)',borderColor:'#1e6fff',borderWidth:1,borderRadius:4}]},options:{responsive:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:12,ticks:{color:'#4a5a88',font:{size:11}},grid:{color:'rgba(30,111,255,.08)'}},x:{ticks:{color:'#4a5a88',font:{size:11}},grid:{display:false}}}}});
  ctx.style.width='100%';ctx.style.height='180px';
}

/* ===== WEIGHT ===== */
function addWeight(){
  const w=parseFloat(document.getElementById('weight-inp').value);
  const h=parseFloat(document.getElementById('height-inp').value);
  if(!w||!h||w<20||w>300||h<100||h>250){showToast('Cek input tinggi/berat');return}
  if(!D.weights)D.weights=[];
  D.weights.push({date:getToday(),kg:w,cm:h});saveData();
  document.getElementById('weight-inp').value='';
  updateWeightMetrics();renderWeightChart();showToast('Berat tersimpan ⚖️');
}
function updateWeightMetrics(){
  if(!D.weights||!D.weights.length)return;
  const last=D.weights[D.weights.length-1];
  const bmi=(last.kg/((last.cm/100)**2)).toFixed(1);
  document.getElementById('curr-weight').textContent=last.kg+'kg';
  document.getElementById('bmi-val').textContent=bmi;
  const bmiNum=parseFloat(bmi);
  const bmiEl=document.getElementById('bmi-val');
  bmiEl.style.color=bmiNum<18.5?'#4488ff':bmiNum<25?'#00cc88':bmiNum<30?'#ffbb00':'#ff3366';
  if(D.weights.length>1){
    const prev=D.weights[D.weights.length-2];
    const diff=(last.kg-prev.kg).toFixed(1);
    const chEl=document.getElementById('weight-change');
    chEl.textContent=(diff>0?'+':'')+diff+'kg';
    chEl.style.color=parseFloat(diff)<=0?'#00cc88':'#ff3366';
  }
  const pct=Math.min(100,Math.max(0,((bmiNum-15)/25)*100));
  const wp=document.getElementById('bmi-pointer-wrap');
  if(wp)wp.innerHTML=`<div class="bmi-pointer" style="left:${pct.toFixed(1)}%">▲</div>`;
}
function renderWeightChart(){
  if(!D.weights||!D.weights.length)return;
  const data=D.weights.slice(-14);
  const ctx=document.getElementById('weightChart');if(!ctx)return;
  if(weightChart)weightChart.destroy();
  weightChart=new Chart(ctx,{type:'line',data:{labels:data.map(w=>w.date.slice(5)),datasets:[{data:data.map(w=>w.kg),borderColor:'#00cc88',backgroundColor:'rgba(0,204,136,.1)',tension:.3,pointRadius:4,pointBackgroundColor:'#00cc88',pointBorderColor:'#080c18',pointBorderWidth:2,fill:true}]},options:{responsive:false,plugins:{legend:{display:false}},scales:{y:{ticks:{color:'#4a5a88',font:{size:11}},grid:{color:'rgba(0,204,136,.08)'}},x:{ticks:{color:'#4a5a88',font:{size:11}},grid:{display:false}}}}});
  ctx.style.width='100%';ctx.style.height='180px';
}
function renderFitness(){
  if(!D.fitness)D.fitness=[];
  const el=document.getElementById('fitness-log');
  if(!el)return;
  const items=D.fitness.slice(-8).reverse();
  el.innerHTML=items.length?items.map(f=>`<div class="fitness-item"><span>${escHtml(f.text)}</span><span class="fitness-date">${f.date.slice(5)}</span></div>`).join(''):'<div class="empty-hint">Belum ada log fitness</div>';
}
function addFitness(){
  const v=document.getElementById('fitness-inp').value.trim();if(!v)return;
  if(!D.fitness)D.fitness=[];D.fitness.push({text:v,date:getToday()});saveData();
  document.getElementById('fitness-inp').value='';renderFitness();showToast('Aktivitas dicatat 💪');
}

/* ===== FINANCE ===== */
function fmtRp(n){if(!n&&n!==0)return'Rp0';const abs=Math.abs(parseInt(n));return(n<0?'-':'')+'Rp'+abs.toLocaleString('id-ID')}
function setTxType(t){
  currentTxType=t;
  document.getElementById('btn-income').className='tx-type-btn'+(t==='income'?' active income-active':'');
  document.getElementById('btn-expense').className='tx-type-btn'+(t==='expense'?' active expense-active':'');
}
function renderFinance(){
  if(!D.transactions)D.transactions=[];
  const inc=D.transactions.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const exp=D.transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const net=inc-exp;
  document.getElementById('total-income').textContent=fmtRp(inc);
  document.getElementById('total-expense').textContent=fmtRp(exp);
  const nel=document.getElementById('net-balance');nel.textContent=fmtRp(net);
  nel.style.color=net>=0?'#00cc88':'#ff3366';
  const bc=document.getElementById('balance-card');
  if(bc)bc.style.borderColor=net>=0?'rgba(0,204,136,.3)':'rgba(255,51,102,.3)';
  renderTxHistory();renderBudget();renderBills();updateSavings();
}
function addTransaction(){
  const desc=document.getElementById('tx-desc').value||document.getElementById('tx-cat').value;
  const amount=parseFloat(document.getElementById('tx-amount').value);
  if(!amount||amount<=0){showToast('Isi jumlah transaksi');return}
  if(!D.transactions)D.transactions=[];
  D.transactions.push({type:currentTxType,cat:document.getElementById('tx-cat').value,desc,amount,date:getToday(),id:Date.now()});
  saveData();document.getElementById('tx-desc').value='';document.getElementById('tx-amount').value='';
  renderFinance();renderPieChart();showToast((currentTxType==='income'?'💚 Pemasukan':'❤️ Pengeluaran')+' dicatat!');
}
function renderTxHistory(){
  const el=document.getElementById('tx-history');if(!el)return;
  if(!D.transactions||!D.transactions.length){el.innerHTML='<div class="empty-hint">Belum ada transaksi</div>';return}
  el.innerHTML=D.transactions.slice(-15).reverse().map(t=>`
    <div class="tx-item">
      <div><div>${escHtml(t.desc)}</div><div class="tx-sub">${t.cat} · ${t.date.slice(5)}</div></div>
      <div class="tx-right ${t.type==='income'?'tx-income':'tx-expense'}">${t.type==='income'?'+':'-'}${fmtRp(t.amount)}</div>
    </div>`).join('');
}
const PIE_COLORS=['#1e6fff','#00cc88','#ffaa00','#ff3366','#9966ff','#00ccff','#ff6600','#cc99ff'];
function renderPieChart(){
  const catTotals={};
  (D.transactions||[]).filter(t=>t.type==='expense').forEach(t=>{catTotals[t.cat]=(catTotals[t.cat]||0)+t.amount;});
  const cats=Object.keys(catTotals);const vals=cats.map(c=>catTotals[c]);const total=vals.reduce((a,v)=>a+v,0)||1;
  const ctx=document.getElementById('pieChart');if(!ctx)return;
  if(pieChart)pieChart.destroy();
  const leg=document.getElementById('pie-legend');
  if(!cats.length){if(leg)leg.innerHTML='<div class="empty-hint">Belum ada pengeluaran</div>';return}
  pieChart=new Chart(ctx,{type:'doughnut',data:{labels:cats,datasets:[{data:vals,backgroundColor:PIE_COLORS.slice(0,cats.length),borderWidth:0,hoverBorderWidth:2,hoverBorderColor:'#fff'}]},options:{responsive:false,cutout:'60%',plugins:{legend:{display:false}}}});
  if(leg)leg.innerHTML=cats.map((c,i)=>`<div class="legend-item"><div class="legend-dot" style="background:${PIE_COLORS[i]}"></div>${escHtml(c)} <strong style="color:var(--text);margin-left:auto">${((catTotals[c]/total)*100).toFixed(0)}%</strong></div>`).join('');
}
function renderBudget(){
  if(!D.budgets)D.budgets={};
  const catExp={};(D.transactions||[]).filter(t=>t.type==='expense').forEach(t=>{catExp[t.cat]=(catExp[t.cat]||0)+t.amount;});
  const el=document.getElementById('budget-list');if(!el)return;
  const cats=Object.keys(D.budgets);
  if(!cats.length){el.innerHTML='<div class="empty-hint">Belum ada budget set</div>';return}
  el.innerHTML=cats.map(c=>{
    const spent=catExp[c]||0;const limit=D.budgets[c];const pct=Math.min(100,Math.round((spent/limit)*100));const over=spent>limit;
    return`<div class="budget-item">
      <div class="budget-item-header">
        <span class="budget-name">${escHtml(c)}</span>
        <span class="budget-pct${over?' budget-over':''}">${fmtRp(spent)} / ${fmtRp(limit)} (${pct}%)</span>
      </div>
      <div class="progress-bar"><div style="width:${pct}%;height:100%;background:${over?'#ff3366':'#1e6fff'};border-radius:3px;box-shadow:${over?'0 0 6px rgba(255,51,102,.4)':'0 0 6px rgba(30,111,255,.4)'}"></div></div>
    </div>`;
  }).join('');
}
function setBudget(){
  const c=document.getElementById('budget-cat-sel').value;const v=parseFloat(document.getElementById('budget-limit').value);
  if(!v||v<=0){showToast('Isi nominal budget');return}
  if(!D.budgets)D.budgets={};D.budgets[c]=v;saveData();
  document.getElementById('budget-limit').value='';renderBudget();showToast('Budget set untuk '+c);
}
function renderBills(){
  if(!D.bills)D.bills=[];
  const today=new Date().getDate();
  const el=document.getElementById('bills-list');if(!el)return;
  if(!D.bills.length){el.innerHTML='<div class="empty-hint">Belum ada tagihan</div>';return}
  const sorted=[...D.bills].sort((a,b)=>{const da=a.dueDay>=today?a.dueDay:a.dueDay+31;const db=b.dueDay>=today?b.dueDay:b.dueDay+31;return da-db;});
  el.innerHTML=sorted.map((b,i)=>{
    const daysLeft=b.dueDay-today;const urgent=daysLeft>=0&&daysLeft<=3;const overdue=daysLeft<0;
    const dotColor=overdue?'#ff3366':urgent?'#ffaa00':'#00cc88';
    return`<div class="bill-item">
      <div class="bill-dot" style="background:${dotColor};box-shadow:0 0 6px ${dotColor}44"></div>
      <span class="bill-name">${escHtml(b.name)}</span>
      <span class="bill-due">Tgl ${b.dueDay}${overdue?' (lewat)':urgent?' (segera)':''}</span>
      <span class="bill-amount">${fmtRp(b.amount)}</span>
      <button class="btn-remove" onclick="removeBill(${D.bills.indexOf(b)})"><i class="ti ti-x"></i></button>
    </div>`;
  }).join('');
}
function addBill(){
  const n=document.getElementById('bill-name').value.trim();
  const d=parseInt(document.getElementById('bill-date').value);
  const a=parseFloat(document.getElementById('bill-amount').value)||0;
  if(!n||!d||d<1||d>31){showToast('Isi nama & tanggal jatuh tempo');return}
  if(!D.bills)D.bills=[];D.bills.push({name:n,dueDay:d,amount:a});saveData();
  document.getElementById('bill-name').value='';document.getElementById('bill-date').value='';document.getElementById('bill-amount').value='';
  renderBills();showToast('Tagihan ditambah!');
}
function removeBill(i){D.bills.splice(i,1);saveData();renderBills();}
function updateSavings(){
  const target=parseFloat(document.getElementById('saving-target')?.value)||D.savings?.target||0;
  const curr=parseFloat(document.getElementById('saving-current')?.value)||D.savings?.current||0;
  const pct=target>0?Math.min(100,(curr/target)*100):0;
  const left=Math.max(0,target-curr);
  const pctEl=document.getElementById('saving-pct');const leftEl=document.getElementById('saving-left');const barEl=document.getElementById('saving-bar');
  if(pctEl)pctEl.textContent=pct.toFixed(1)+'%';
  if(leftEl)leftEl.textContent='Sisa: '+fmtRp(left);
  if(barEl)barEl.style.width=pct+'%';
  if(!D.savings)D.savings={};
  if(target)D.savings.target=target;if(curr)D.savings.current=curr;
  saveData();
}

/* ===== SETTINGS ===== */
function renderProfileCard(){
  const el=document.getElementById('profile-card');if(!el||!currentUser)return;
  el.innerHTML=`
    <div class="profile-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
    <div>
      <div class="profile-name">${escHtml(currentUser.name)}</div>
      <div class="profile-sub">@${escHtml(currentUser.username)} · ${escHtml(currentUser.email)}</div>
    </div>`;
}
const NOTIFS=[{key:'morning',label:'Morning reminder',time:'06:00'},{key:'habit',label:'Habit check-in malam',time:'20:00'},{key:'finance',label:'Catat pengeluaran',time:'21:00'},{key:'sleep',label:'Bedtime reminder',time:'22:30'}];
function renderNotifs(){
  if(!D.notifs)D.notifs={};
  const el=document.getElementById('notif-list');if(!el)return;
  el.innerHTML=NOTIFS.map(n=>`
    <div class="notif-row">
      <span class="notif-label">${n.label}</span>
      <span class="notif-time">${n.time}</span>
      <button class="toggle${D.notifs[n.key]?' on':''}" onclick="toggleNotif('${n.key}')"></button>
    </div>`).join('');
}
function toggleNotif(k){if(!D.notifs)D.notifs={};D.notifs[k]=!D.notifs[k];saveData();renderNotifs();}

/* ===== EXPORT ===== */
function exportCSV(){
  if(!D.transactions||!D.transactions.length){showToast('Belum ada data transaksi');return}
  const h='Tanggal,Tipe,Kategori,Deskripsi,Jumlah\n';
  const rows=D.transactions.map(t=>`${t.date},${t.type},${t.cat},"${t.desc}",${t.amount}`).join('\n');
  dlFile(h+rows,'transaksi_'+getToday()+'.csv','text/csv');
  showToast('CSV di-export!');
}
function exportJSON(){
  dlFile(JSON.stringify(D,null,2),'statistik_hidup_'+getToday()+'.json','application/json');
  showToast('Data JSON di-export!');
}
function dlFile(content,filename,type){
  const blob=new Blob([content],{type});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);
}
function resetUserData(){
  D={};localStorage.removeItem(userKey('main'));saveData();
  initHabits();renderPriorities();renderMeals();renderFinance();
  showToast('Data direset!');
}

/* ===== INIT SAVINGS UI ===== */
function initSavingsUI(){
  if(D.savings){
    const st=document.getElementById('saving-target');const sc=document.getElementById('saving-current');
    if(st&&D.savings.target)st.value=D.savings.target;
    if(sc&&D.savings.current)sc.value=D.savings.current;
    updateSavings();
  }
}

/* ===== UTILS ===== */
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

/* ===== BOOT ===== */
document.addEventListener('DOMContentLoaded',()=>{
  if(!checkSession()){
    document.getElementById('auth-screen').classList.add('active');
  }
  setTxType('income');
});
