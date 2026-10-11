'use strict';
const mobileMenuToggle=document.getElementById('mobileMenuToggle');
const workspaceNav=document.getElementById('workspaceNav');
function closeMobileMenu(){mobileMenuToggle.setAttribute('aria-expanded','false');}
mobileMenuToggle.addEventListener('click',()=>{
  mobileMenuToggle.setAttribute('aria-expanded',String(mobileMenuToggle.getAttribute('aria-expanded')!=='true'));
});
workspaceNav.addEventListener('click',event=>{
  if(event.target.closest('.nav')&&matchMedia('(max-width:900px)').matches){
    closeMobileMenu();
    document.querySelector('main').focus({preventScroll:true});
  }
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&mobileMenuToggle.getAttribute('aria-expanded')==='true'){
    closeMobileMenu();mobileMenuToggle.focus();
  }
});
