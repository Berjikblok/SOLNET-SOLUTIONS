// ========================================
// REUSABLE MODAL SYSTEM
// [data-modal="templateId"] opens a <template>; [data-zoom] images open a zoom viewer
// ========================================
(()=>{
  const modal=document.getElementById('modal'),body=modal.querySelector('.modal-body'),box=modal.querySelector('.modal-content');
  let last=null;
  function open(html,zoom){
    last=document.activeElement;body.innerHTML=html;box.classList.toggle('modal-zoom',!!zoom);
    modal.hidden=false;requestAnimationFrame(()=>modal.classList.add('open'));
    document.body.classList.add('modal-open');modal.querySelector('.modal-close').focus();
    if(window.initFallbacks)window.initFallbacks(body);
  }
  function close(){
    modal.classList.remove('open');document.body.classList.remove('modal-open');
    setTimeout(()=>{modal.hidden=true;body.innerHTML='';},350);last&&last.focus();
  }
  document.addEventListener('click',e=>{
    const trig=e.target.closest('[data-modal]');
    if(trig){const t=document.getElementById(trig.dataset.modal);if(t)open(t.innerHTML);return;}
    const z=e.target.closest('img[data-zoom]');
    if(z){open(`<div class="zoom-wrap"><img src="${z.src}" alt="${z.alt}"></div>`,true);return;}
    const zi=e.target.closest('.zoom-wrap');if(zi){zi.classList.toggle('zoomed');return;}
    if(e.target===modal||e.target.closest('.modal-close'))close();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&modal.classList.contains('open'))close();
    if(e.key==='Tab'&&modal.classList.contains('open')){
      const f=[...modal.querySelectorAll('a,button')];if(!f.length)return;
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}
    }
  });
})();
