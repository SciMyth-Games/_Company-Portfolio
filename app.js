const orbit = document.getElementById('orbit');
let cards = [];
let allProjects = [];
const filters = document.querySelectorAll('.filter');
const stage = document.getElementById('stage');

let rotation = 0;
let tilt = 0;
let activeIndex = 0;
let tiltRaf = null;

// Fetch projects and generate cards
async function initPortfolio() {
  try {
    // Fetch projects.json
    const projectsRes = await fetch('data/projects.json');
    if (!projectsRes.ok) {
      throw new Error(`Failed to load projects.json: ${projectsRes.status}`);
    }
    const projectsData = await projectsRes.json();
    
    allProjects = projectsData.projects;
    let projectDetailsMap = {};
    
    // Try to fetch project-details.json (optional)
    try {
      const detailsRes = await fetch('data/project-details.json');
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        projectDetailsMap = detailsData.projectDetails || {};
      }
    } catch (e) {
      console.warn('Could not load project-details.json:', e);
    }
    
    const detailAliases = {
      "rewind": "rewind-system",
      "prototype-for-rpg-game": "prototype-rpg",
      "indra-vs-virtasure": "legend-of-indra",
      "quest-of-cybertron": "isles-of-echoes"
    };

    // Merge project details into projects
    allProjects = allProjects.map(p => {
      const detailsKey = detailAliases[p.id] || p.id;
      const details = projectDetailsMap[detailsKey] || {};
      return {
        ...p,
        ...details
      };
    });

    // Create card DOM elements
    allProjects.forEach(p => {
      const isUnreal = (p.engine || '').toLowerCase().includes('unreal');
      const isUnity = (p.engine || '').toLowerCase().includes('unity');
      const tags = p.tags ? p.tags.join(' ') : (isUnreal ? 'unreal' : (isUnity ? 'unity' : 'other'));
      const shortEngine = isUnreal ? 'Unreal' : (isUnity ? 'Unity' : (p.type || 'Custom'));
      
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;
      card.dataset.tags = tags;
      card.dataset.title = p.title || '';
      card.dataset.id = p.id || '';
      card.dataset.desc = p.description || '';
      card.dataset.tech = (p.techStack || []).join(', ');
      
      // Store array of images for navigation
      const imagesList = p.images || [];
      card.dataset.images = JSON.stringify(imagesList);
      
      card.dataset.demo = (p.links && p.links.demo) ? p.links.demo : '';
      card.dataset.source = (p.links && p.links.source) ? p.links.source : '';
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
    setupCardTilt();
    console.log(`✓ Portfolio loaded with ${cards.length} projects`);
  } catch (err) {
    console.error('❌ Failed to load portfolio data:', err);
    // Show error message on page
    const orbit = document.getElementById('orbit');
    if (orbit) {
      orbit.innerHTML = `<div style="color: #ff6b6b; text-align: center; padding: 20px;">Error loading projects: ${err.message}</div>`;
    }
  }
}

function placeCards(targetCards){
  const n = targetCards.length;
  // Spread out the elements in a perfect ring
  targetCards.forEach((c,i)=>{
    const angle = (i / n) * 360;
    c.dataset.index = i;
    const baseTransform = `rotate(${angle}deg) translateY(calc(var(--orbit-size) / -2.2)) rotate(-${angle}deg)`;
    c.dataset.baseTransform = baseTransform;
    c.style.transform = baseTransform;
  });
}

function updateOrbit(){
  orbit.style.transform = `rotateX(${tilt}deg) rotateZ(${rotation}deg)`;
}

function setupCursor(){
  if (window.matchMedia('(hover: none)').matches) return;
  document.body.classList.add('use-custom-cursor');

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(dot);

  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;

  function render(){
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }

  document.addEventListener('mousemove', (e)=>{
    x = e.clientX;
    y = e.clientY;
  });

  document.addEventListener('mouseleave', ()=>{
    cursor.classList.add('is-hidden');
    dot.classList.add('is-hidden');
  });

  document.addEventListener('mouseenter', ()=>{
    cursor.classList.remove('is-hidden');
    dot.classList.remove('is-hidden');
  });

  document.addEventListener('mousedown', ()=> cursor.classList.add('is-active'));
  document.addEventListener('mouseup', ()=> cursor.classList.remove('is-active'));

  render();
}

function setupStageTilt(){
  if (!stage) return;
  stage.addEventListener('mousemove', (e)=>{
    const rect = stage.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const targetTilt = Math.max(-8, Math.min(8, -ny * 10));
    if (tiltRaf) cancelAnimationFrame(tiltRaf);
    tiltRaf = requestAnimationFrame(()=>{
      tilt = targetTilt;
      updateOrbit();
    });
  });

  stage.addEventListener('mouseleave', ()=>{
    tilt = 0;
    updateOrbit();
  });
}

function setupCardTilt(){
  cards.forEach((card)=>{
    const baseTransform = card.dataset.baseTransform || card.style.transform;
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const rx = (e.clientY - rect.top) / rect.height - 0.5;
      const ry = (e.clientX - rect.left) / rect.width - 0.5;
      const tiltX = (-rx * 8).toFixed(2);
      const tiltY = (ry * 8).toFixed(2);
      card.style.transform = `${baseTransform} rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', ()=>{
      card.style.transform = baseTransform;
    });
  });
}

// mouse / touch rotation removed to prevent spinning on click/drag

// keyboard navigation
document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft') { rotateBy(-20); nav(-1); }
  if(e.key === 'ArrowRight') { rotateBy(20); nav(1); }
  if(e.key === 'Enter' && document.activeElement.classList.contains('card')) {
    openCard(document.activeElement);
  }
});

function rotateBy(delta){ rotation += delta; updateOrbit(); }

function updateModalImage() {
  // Deprecated, using project page now
}

function openCard(card){
  // Open individual project page using project ID
  const id = card.dataset.id;
  if (id) {
    window.location.href = `projects/${id}/index.html`;
  }
}

function nav(dir){
  const nextIdx = (activeIndex + dir + cards.length) % cards.length;
  const next = cards[nextIdx];
  activeIndex = nextIdx;
  next.focus();
}

// Initialize data injection
initPortfolio();
setupCursor();
setupStageTilt();

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
