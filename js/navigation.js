// ========================================
// MOBILE NAVIGATION
// ========================================
(()=>{
  const t=document.querySelector('.nav-toggle'),p=document.getElementById('navPanel');
  if(!t||!p)return;
  const set=o=>{p.classList.toggle('open',o);t.setAttribute('aria-expanded',o);t.setAttribute('aria-label',o?'Close menu':'Open menu');};
  t.addEventListener('click',()=>set(!p.classList.contains('open')));
  p.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
})();
