const orbit = document.getElementById('orbit');
let cards = [];
const modal = document.getElementById('modal');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const mTech = document.getElementById('mTech');
const mImgContainer = document.getElementById('mImgContainer');
const mImg = document.getElementById('mImg');
const mLinks = document.getElementById('mLinks');
const modalClose = document.getElementById('modalClose');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const imgPrev = document.getElementById('imgPrev');
const imgNext = document.getElementById('imgNext');
const filters = document.querySelectorAll('.filter');

let rotation = 0;
let tilt = 0;
let activeIndex = 0;
let activeImages = [];
let activeImageIndex = 0;

// Fetch projects and generate cards
async function initPortfolio() {
  try {
    const res = await fetch('https://rez26.github.io/_Portfolio/data/cv.json');
    const data = await res.json();
    
    // Filter projects to only include games (you can modify the condition based on the JSON structure)
    const gamesOnly = data.projects.filter(p => {
      const e = (p.engine || '').toLowerCase();
      const t = (p.type || '').toLowerCase();
      // Assume it's a game if engine is Unreal/Unity or type includes 'game'
      return e.includes('unreal') || e.includes('unity') || t.includes('game');
    });

    // Create card DOM elements
    gamesOnly.forEach(p => {
      const isUnreal = (p.engine || '').toLowerCase().includes('unreal');
      const isUnity = (p.engine || '').toLowerCase().includes('unity');
      const tags = isUnreal ? 'unreal' : (isUnity ? 'unity' : 'game');
      const shortEngine = isUnreal ? 'Unreal' : (isUnity ? 'Unity' : 'Custom');
      
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;
      card.dataset.tags = tags;
      card.dataset.title = p.title || '';
      card.dataset.desc = p.description || '';
      card.dataset.tech = p.tech || '';
      
      // Store array of images for navigation
      const imagesList = p.images || p.screenshots || [p.image].filter(Boolean);
      card.dataset.images = JSON.stringify(imagesList.map(img => img.startsWith('http') ? img : `https://rez26.github.io/_Portfolio/${img}`));
      
      card.dataset.demo = p.demo ? `https://rez26.github.io/_Portfolio/${p.demo}` : '';
      card.dataset.source = p.source || p.github || '';
      card.dataset.video = p.video || '';
      card.dataset.download = p.download || '';
      card.dataset.linksObj = JSON.stringify(p.links || {});
      
      card.innerHTML = `<h3>${p.title}</h3><p>${shortEngine}</p>`;
      orbit.appendChild(card);
    });
    
    // Store reference to generated cards
    cards = [...orbit.querySelectorAll('.card')];
    
    // Add event listeners
    cards.forEach((c) => {
      c.addEventListener('click', ()=> openCard(c));
      c.addEventListener('keydown', (e)=>{ if(e.key==='Enter') openCard(c) });
    });
    
    placeCards(cards);
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }
}

function placeCards(targetCards){
  const n = targetCards.length;
  // Overlap and spread out the elements in a thicker ring
  targetCards.forEach((c,i)=>{
    const angle = (i / n) * 360;
    c.dataset.index = i;
    const stagger = (Math.sin(i * 8765.43) * 180); // Increased factor to spread/overlap items
    c.style.transform = `rotate(${angle}deg) translateY(calc(var(--orbit-size) / -2.2 + ${stagger}px)) rotate(-${angle}deg)`;
  });
}

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

function updateModalImage() {
  if (activeImages.length > 0) {
    mImg.src = activeImages[activeImageIndex];
    mImgContainer.style.display = 'block';
    
    // Toggle image navigation buttons
    const showImgNav = activeImages.length > 1 ? 'block' : 'none';
    imgPrev.style.display = showImgNav;
    imgNext.style.display = showImgNav;
  } else {
    mImgContainer.style.display = 'none';
  }
}

function openCard(card){
  activeIndex = Number(card.dataset.index);
  mTitle.textContent = card.dataset.title;
  mDesc.textContent = card.dataset.desc;
  
  if (card.dataset.tech) {
    mTech.textContent = card.dataset.tech;
    mTech.style.display = 'block';
  } else {
    mTech.style.display = 'none';
  }
  
  // Handle images
  activeImages = JSON.parse(card.dataset.images || '[]');
  activeImageIndex = 0;
  updateModalImage();
  
  mLinks.innerHTML = '';
  
  const addLink = (url, text) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url.startsWith('http') ? url : `https://rez26.github.io/_Portfolio/${url}`;
    a.target = '_blank';
    a.textContent = text + ' ↗';
    a.style.cssText = 'padding:6px 12px; background:var(--glass); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); text-decoration:none; font-size:13px; font-weight:500; transition:0.2s;';
    
    // Simple hover effect using JS
    a.addEventListener('mouseenter', () => a.style.background = 'rgba(255,255,255,0.1)');
    a.addEventListener('mouseleave', () => a.style.background = 'var(--glass)');
    
    mLinks.appendChild(a);
  };

  addLink(card.dataset.demo, 'View Demo');
  addLink(card.dataset.video, 'Watch Video');
  addLink(card.dataset.download, 'Download');
  addLink(card.dataset.source, 'Source Code');
  
  // Add dynamically parsed links from JSON
  const parsedLinks = JSON.parse(card.dataset.linksObj || '{}');
  Object.keys(parsedLinks).forEach(key => {
    if (typeof parsedLinks[key] === 'string') {
      addLink(parsedLinks[key], key.charAt(0).toUpperCase() + key.slice(1));
    }
  });
  
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

// Image Navigation overrides
imgPrev.addEventListener('click', (e)=> {
  e.stopPropagation();
  activeImageIndex = (activeImageIndex - 1 + activeImages.length) % activeImages.length;
  updateModalImage();
});

imgNext.addEventListener('click', (e)=> {
  e.stopPropagation();
  activeImageIndex = (activeImageIndex + 1) % activeImages.length;
  updateModalImage();
});

// Initialize data injection
initPortfolio();

// filters
filters.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // update active button
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    const tag = btn.dataset.tag;
    const visibleCards = [];

    // show/hide cards safely
    cards.forEach(c=>{
      const tags = (c.dataset.tags || '').split(/\s+/).filter(Boolean);
      if(tag === 'all' || tags.indexOf(tag) !== -1) {
        c.style.display = '';
        visibleCards.push(c);
      } else {
        c.style.display = 'none';
      }
    });

    if(visibleCards.length > 0) {
      placeCards(visibleCards);
    }
  });
});
