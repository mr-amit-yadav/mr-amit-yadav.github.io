(function(){
  'use strict';

  /* ── Custom cursor ── */
  const cd = document.getElementById('cd');
  const cr = document.getElementById('cr');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; cd.style.left=mx+'px'; cd.style.top=my+'px'; });
  (function animCursor(){
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    cr.style.left=rx+'px'; cr.style.top=ry+'px';
    requestAnimationFrame(animCursor);
  })();
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ cr.style.width='48px'; cr.style.height='48px'; cr.style.opacity='.8'; });
    el.addEventListener('mouseleave',()=>{ cr.style.width='32px'; cr.style.height='32px'; cr.style.opacity='.5'; });
  });

  /* ── Loader ── */
  const loader = document.getElementById('loader');
  window.addEventListener('load',()=>setTimeout(()=>loader.classList.add('out'),500));

  /* ── Day / night theme ── */
  const root=document.documentElement;
  const themeBtn=document.getElementById('themeToggle');
  const mnThemeBtn=document.getElementById('mnThemeToggle');
  const mnThemeLabel=mnThemeBtn?mnThemeBtn.querySelector('.theme-label'):null;

  function applyTheme(theme){
    root.setAttribute('data-theme',theme);
    if(mnThemeLabel) mnThemeLabel.textContent = theme==='dark' ? 'Switch to day' : 'Switch to night';
  }
  function currentTheme(){
    const saved=localStorage.getItem('theme');
    if(saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(currentTheme());

  function toggleTheme(){
    const next = root.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme',next);
  }
  if(themeBtn) themeBtn.addEventListener('click',toggleTheme);
  if(mnThemeBtn) mnThemeBtn.addEventListener('click',toggleTheme);

  /* ── Scroll progress bar ── */
  const sb = document.getElementById('sb');
  window.addEventListener('scroll',()=>{
    const pct=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100;
    sb.style.width=pct+'%';
  },{passive:true});

  /* ── Navbar active link ── */
  const nav=document.getElementById('navbar');
  const sections=document.querySelectorAll('section[id]');
  const navLinks=document.querySelectorAll('.nl a');
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',window.scrollY>50);
    let cur='';
    sections.forEach(s=>{ if(window.scrollY>=s.offsetTop-120) cur=s.id; });
    navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+cur));
  },{passive:true});

  /* ── Footer year ── */
  document.getElementById('fyear').textContent=new Date().getFullYear();

  /* ── Mobile nav ── */
  const mmbtn=document.getElementById('mmbtn');
  const mobnav=document.getElementById('mobnav');
  const mobclose=document.getElementById('mobclose');
  mmbtn.addEventListener('click',()=>{ mobnav.classList.add('open'); document.body.style.overflow='hidden'; });
  mobclose.addEventListener('click',()=>{ mobnav.classList.remove('open'); document.body.style.overflow=''; });
  mobnav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ mobnav.classList.remove('open'); document.body.style.overflow=''; }));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ mobnav.classList.remove('open'); document.body.style.overflow=''; }});

  /* ── Back to top ── */
  const bt=document.getElementById('bt');
  window.addEventListener('scroll',()=>bt.classList.toggle('show',window.scrollY>400),{passive:true});
  bt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const t=document.querySelector(this.getAttribute('href'));
      if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
  });

  /* ── Reveal on scroll ── */
  const revObs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('up'); revObs.unobserve(en.target); }});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rev').forEach(el=>revObs.observe(el));

  /* ── Project filters ── */
  const pfBtns=document.querySelectorAll('.pfb');
  const pcWraps=document.querySelectorAll('.pc-wrap');
  pfBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      pfBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f=btn.dataset.filter;
      pcWraps.forEach(c=>{
        const show=f==='all'||c.dataset.category===f;
        c.classList.toggle('hidden',!show);
      });
    });
  });

  /* ── Contact form ── */
  const form=document.getElementById('contact-form');
  function vf(id,errId,fn){
    const el=document.getElementById(id),err=document.getElementById(errId);
    const ok=fn(el.value.trim());
    el.classList.toggle('err',!ok);
    err.style.display=ok?'none':'block';
    return ok;
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const n=vf('cf-name','name-err',v=>v.length>=2);
    const em=vf('cf-email','email-err',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    const m=vf('cf-message','message-err',v=>v.length>=10);
    if(!(n&&em&&m)) return;

    const submitBtn=form.querySelector('.contact-submit');
    submitBtn.disabled=true;
    const originalHTML=submitBtn.innerHTML;
    submitBtn.innerHTML='<span>Sending…</span>';

    try{
      const res=await fetch('https://api.web3forms.com/submit',{
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data=await res.json();
      if(data.success){
        form.reset();
        const ok=document.getElementById('fok');
        ok.style.display='block';
        setTimeout(()=>ok.style.display='none',5000);
      }else{
        alert('Something went wrong sending your message. Please try emailing me directly at amit.y21c@gmail.com.');
      }
    }catch(err){
      alert('Something went wrong sending your message. Please try emailing me directly at amit.y21c@gmail.com.');
    }finally{
      submitBtn.disabled=false;
      submitBtn.innerHTML=originalHTML;
    }
  });
  form.querySelectorAll('input,textarea').forEach(el=>{
    el.addEventListener('input',()=>el.classList.remove('err'));
  });


  /* ── Story Modal (Yoga & Research) ── */
  const openYogaBtn = document.getElementById('openYogaModal');
  const yogaModal = document.getElementById('yogaModal');
  const closeYogaBtn = document.getElementById('closeYogaModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const paperDownloadBtn = document.getElementById('paperDownloadBtn');

  function openModal() {
    if (!yogaModal) return;
    yogaModal.removeAttribute('hidden');
    setTimeout(() => {
      if (!yogaModal.hasAttribute('hidden')) yogaModal.classList.add('active');
    }, 20);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!yogaModal) return;
    yogaModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!yogaModal.classList.contains('active')) yogaModal.setAttribute('hidden', '');
    }, 300);
  }

  if (openYogaBtn) openYogaBtn.addEventListener('click', openModal);
  if (closeYogaBtn) closeYogaBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && yogaModal && yogaModal.classList.contains('active')) {
      closeModal();
    }
  });

  if (paperDownloadBtn) {
    paperDownloadBtn.addEventListener('click', (e) => {
      fetch(paperDownloadBtn.getAttribute('href'), { method: 'HEAD' })
        .then(res => {
          if (!res.ok) {
            alert('Research paper is being prepared for download. You can also contact Amit directly at amit.y21c@gmail.com for a copy!');
          }
        })
        .catch(() => {});
    });
  }


  /* ── Chess Journey Modal ── */
  const openChessBtn = document.getElementById('openChessModal');
  const chessModal = document.getElementById('chessModal');
  const closeChessBtn = document.getElementById('closeChessModal');
  const chessModalBackdrop = document.getElementById('chessModalBackdrop');
  const chessToYogaLink = document.getElementById('chessToYogaLink');

  function openChess() {
    if (!chessModal) return;
    chessModal.removeAttribute('hidden');
    setTimeout(() => {
      if (!chessModal.hasAttribute('hidden')) chessModal.classList.add('active');
    }, 20);
    document.body.style.overflow = 'hidden';
  }

  function closeChess() {
    if (!chessModal) return;
    chessModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!chessModal.classList.contains('active')) chessModal.setAttribute('hidden', '');
    }, 300);
  }

  if (openChessBtn) openChessBtn.addEventListener('click', openChess);
  if (closeChessBtn) closeChessBtn.addEventListener('click', closeChess);
  if (chessModalBackdrop) chessModalBackdrop.addEventListener('click', closeChess);

  if (chessToYogaLink) {
    chessToYogaLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeChess();
      setTimeout(openModal, 320);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (chessModal && chessModal.classList.contains('active')) closeChess();
      if (yogaModal && yogaModal.classList.contains('active')) closeModal();
    }
  });


  /* ── Sketch Gallery Modal & Filters ── */
  const openSketchBtn = document.getElementById('openSketchModal');
  const sketchModal = document.getElementById('sketchModal');
  const closeSketchBtn = document.getElementById('closeSketchModal');
  const sketchModalBackdrop = document.getElementById('sketchModalBackdrop');

  function openSketch() {
    if (!sketchModal) return;
    sketchModal.removeAttribute('hidden');
    setTimeout(() => {
      if (!sketchModal.hasAttribute('hidden')) sketchModal.classList.add('active');
    }, 20);
    document.body.style.overflow = 'hidden';
  }

  function closeSketch() {
    if (!sketchModal) return;
    sketchModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!sketchModal.classList.contains('active')) sketchModal.setAttribute('hidden', '');
    }, 300);
  }

  if (openSketchBtn) openSketchBtn.addEventListener('click', openSketch);
  if (closeSketchBtn) closeSketchBtn.addEventListener('click', closeSketch);
  if (sketchModalBackdrop) sketchModalBackdrop.addEventListener('click', closeSketch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sketchModal && sketchModal.classList.contains('active')) {
      closeSketch();
    }
  });

  // Sketch Filters
  const sfbBtns = document.querySelectorAll('.sfb-btn');
  const sketchCards = document.querySelectorAll('.sketch-card');
  sfbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfbBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      sketchCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });


  /* ── Travel Journal Modal ── */
  const openTravelBtn = document.getElementById('openTravelModal');
  const travelModal = document.getElementById('travelModal');
  const closeTravelBtn = document.getElementById('closeTravelModal');
  const travelModalBackdrop = document.getElementById('travelModalBackdrop');

  function openTravel() {
    if (!travelModal) return;
    travelModal.removeAttribute('hidden');
    setTimeout(() => {
      if (!travelModal.hasAttribute('hidden')) travelModal.classList.add('active');
    }, 20);
    document.body.style.overflow = 'hidden';
  }

  function closeTravel() {
    if (!travelModal) return;
    travelModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!travelModal.classList.contains('active')) travelModal.setAttribute('hidden', '');
    }, 300);
  }

  if (openTravelBtn) openTravelBtn.addEventListener('click', openTravel);
  if (closeTravelBtn) closeTravelBtn.addEventListener('click', closeTravel);
  if (travelModalBackdrop) travelModalBackdrop.addEventListener('click', closeTravel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && travelModal && travelModal.classList.contains('active')) {
      closeTravel();
    }
  });

})();
