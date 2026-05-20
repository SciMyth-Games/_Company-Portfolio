ï»¿const orbit = document.getElementById('orbit');
const cards = [...orbit.querySelectorAll('.card')];
const modal = document.getElementById('modal');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const modalClose = document.getElementById('modalClose');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const filters = document.querySelectorAll('.filter');
let rotation = 0;
let tilt = 0;
let activeIndex = 0;

function placeCards(){
  const n = cards.length;
  cards.forEach((c,i)=>{
    const angle = (i / n) * 360;
    c.dataset.index = i;
    c.style.transform = `rotate(${angle}deg) translateY(calc(var(--orbit-size) / -2.6)) rotate(-${angle}deg)`;
  });
}
placeCards();

function updateOrbit(){
  orbit.style.transform = `rotateX(${tilt}deg) rotateZ(${rotation}deg)`;
}

// mouse / touch to rotate
let dragging=false, startX=0, startY=0, startRot=0, startTilt=0;
document.getElementById('stage').addEventListener('pointerdown', e=>{
  dragging=true; startX=e.clientX; startY=e.clientY; startRot=rotation; startTilt=tilt;
});
window.addEventListener('pointermove', e=>{
  if(!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  rotation = startRot + dx * 0.12;
  tilt = Math.max(-40, Math.min(40, startTilt - dy * 0.08));
  updateOrbit();
});
window.addEventListener('pointerup', ()=> dragging=false);

// keyboard navigation
document.addEventListener('keydown', e=>{
  if(modal.getAttribute('aria-hidden') === 'false'){
    if(e.key === 'ArrowLeft') nav(-1);
    if(e.key === 'ArrowRight') nav(1);
    if(e.key === 'Escape') closeModal();
    return;
  }
  if(e.key === 'ArrowLeft') rotateBy(-20);
  if(e.key === 'ArrowRight') rotateBy(20);
  if(e.key === 'Enter' && document.activeElement.classList.contains('card')) {
    openCard(document.activeElement);
  }
});

function rotateBy(delta){ rotation += delta; updateOrbit(); }

cards.forEach((c, idx)=>{
  c.addEventListener('click', ()=> openCard(c));
  c.addEventListener('keydown', (e)=>{ if(e.key==='Enter') openCard(c) });
});

function openCard(card){
  activeIndex = Number(card.dataset.index);
  mTitle.textContent = card.dataset.title;
  mDesc.textContent = card.dataset.desc;
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  modal.setAttribute('aria-hidden','true');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

function nav(dir){
  activeIndex = (activeIndex + dir + cards.length) % cards.length;
  const next = cards[activeIndex];
  openCard(next);
}

prevBtn.addEventListener('click', ()=>nav(-1));
nextBtn.addEventListener('click', ()=>nav(1));

// filters
filters.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // update active button
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    const tag = btn.dataset.tag;

    // show/hide cards safely
    cards.forEach(c=>{
      const tags = (c.dataset.tags || '').split(/\s+/).filter(Boolean);
      if(tag === 'all' || tags.indexOf(tag) !== -1) {
        c.style.display = '';
      } else {
        c.style.display = 'none';
      }
    });

    // re-place visible cards evenly
    const vis = cards.filter(c=>c.style.display !== 'none');
    if(vis.length === 0) return;
    vis.forEach((c,i)=>{
      const angle = (i / vis.length) * 360;
      c.style.transform = `rotate(${angle}deg) translateY(calc(var(--orbit-size) / -2.6)) rotate(-${angle}deg)`;
      c.dataset.index = i;
    });
  });
});

// theme toggle
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const root = document.documentElement;
  if(root.style.getPropertyValue('--bg') === '#0f1724'){
    root.style.setProperty('--bg','#f7fafc');
    root.style.setProperty('--card','#ffffff');
    root.style.setProperty('--accent','#0b6bff');
    root.style.setProperty('--muted','#334155');
  } else {
    root.style.setProperty('--bg','#0f1724');
    root.style.setProperty('--card','#0b1220');
    root.style.setProperty('--accent','#6ee7b7');
    root.style.setProperty('--muted','#98a8bf');
  }
});

