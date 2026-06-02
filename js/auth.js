/* auth.js — Local multi-user auth system */
const AUTH_KEY='sh_users';
const SESSION_KEY='sh_session';

function getUsers(){
  try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'{}')}catch{return{}}
}
function saveUsers(u){localStorage.setItem(AUTH_KEY,JSON.stringify(u))}
function getSession(){
  try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}
}
function setSession(user){sessionStorage.setItem(SESSION_KEY,JSON.stringify(user))}
function clearSession(){sessionStorage.removeItem(SESSION_KEY)}

function hashSimple(s){
  let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0}
  return h.toString(16);
}

function switchAuth(mode){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(mode==='login'&&i===0)||(mode==='register'&&i===1)));
  document.getElementById('login-form').classList.toggle('active',mode==='login');
  document.getElementById('register-form').classList.toggle('active',mode==='register');
  document.getElementById('login-error').textContent='';
  document.getElementById('reg-error').textContent='';
}

function togglePw(id,icon){
  const inp=document.getElementById(id);
  inp.type=inp.type==='password'?'text':'password';
  icon.className=`ti ${inp.type==='password'?'ti-eye':'ti-eye-off'} toggle-pw`;
}

function handleLogin(){
  const id=document.getElementById('login-identifier').value.trim();
  const pw=document.getElementById('login-password').value;
  const errEl=document.getElementById('login-error');
  if(!id||!pw){errEl.textContent='Isi semua field ya!';return}
  const users=getUsers();
  const user=Object.values(users).find(u=>u.email===id||u.username===id);
  if(!user||user.password!==hashSimple(pw)){errEl.textContent='Email/username atau password salah.';return}
  const session={uid:user.uid,name:user.name,username:user.username,email:user.email};
  setSession(session);
  startApp(session);
}

function handleRegister(){
  const name=document.getElementById('reg-name').value.trim();
  const username=document.getElementById('reg-username').value.trim().toLowerCase();
  const email=document.getElementById('reg-email').value.trim().toLowerCase();
  const pw=document.getElementById('reg-password').value;
  const errEl=document.getElementById('reg-error');
  if(!name||!username||!email||!pw){errEl.textContent='Isi semua field ya!';return}
  if(username.length<3){errEl.textContent='Username minimal 3 karakter.';return}
  if(!/^[a-z0-9_]+$/.test(username)){errEl.textContent='Username hanya huruf, angka, underscore.';return}
  if(pw.length<6){errEl.textContent='Password minimal 6 karakter.';return}
  if(!/\S+@\S+\.\S+/.test(email)){errEl.textContent='Format email tidak valid.';return}
  const users=getUsers();
  if(Object.values(users).find(u=>u.email===email)){errEl.textContent='Email sudah terdaftar.';return}
  if(Object.values(users).find(u=>u.username===username)){errEl.textContent='Username sudah dipakai.';return}
  const uid='u_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
  users[uid]={uid,name,username,email,password:hashSimple(pw),createdAt:new Date().toISOString()};
  saveUsers(users);
  const session={uid,name,username,email};
  setSession(session);
  startApp(session);
}

function handleLogout(){
  clearSession();
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('login-password').value='';
  showToast('Sampai jumpa! 👋');
}

function checkSession(){
  const s=getSession();
  if(s){startApp(s);return true}
  return false;
}
