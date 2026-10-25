// ========================================
// IMAGE FALLBACKS (placeholders until real images are added)
// ========================================
window.initFallbacks=(root=document)=>root.querySelectorAll('img').forEach(img=>{
  const fail=()=>{
    if(img.dataset.fallback){const s=document.createElement('span');s.className='fb '+img.className;s.textContent=img.dataset.fallback;img.replaceWith(s);}
    else img.closest('.image-wrapper')?.classList.add('img-missing');
  };
  if(img.complete&&img.naturalWidth===0)fail();else img.addEventListener('error',fail,{once:true});
});
window.initFallbacks();
// ========================================
// SUBSTATION EXPAND PANELS
// ========================================
document.querySelectorAll('.expand-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const p=document.getElementById(btn.getAttribute('aria-controls')),o=p.classList.toggle('open');
  btn.setAttribute('aria-expanded',o);btn.firstChild.textContent=o?'HIDE DETAILS ':'VIEW DETAILS ';
}));
// ========================================
// SCHEDULE OF LOADS TABS
// ========================================
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
  document.querySelectorAll('.schedule-panel').forEach(p=>p.hidden=p.id!==tab.dataset.tab);
}));