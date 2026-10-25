// ========================================
// SCROLL REVEAL
// ========================================
(()=>{
  const els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('visible'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
})();
// ========================================
// PAGE TRANSITIONS
// ========================================
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a||a.target||e.metaKey||e.ctrlKey||e.shiftKey)return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin&&location.protocol!=='file:')return;
  if(u.protocol!==location.protocol||(u.pathname===location.pathname&&u.hash)||a.getAttribute('href')==='#')return;
  e.preventDefault();document.body.classList.add('page-leaving');
  setTimeout(()=>{location.href=a.href;},300);
});
window.addEventListener('pageshow',()=>document.body.classList.remove('page-leaving'));
