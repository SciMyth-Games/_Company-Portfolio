const orbit = document.getElementById('orbit');
let cards = [];
let allProjects = [];
const stage = document.getElementById('stage');

let rotation = 0;
let tilt = 0;
let activeIndex = 0;
let tiltRaf = null;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  const text = await res.text();
  const clean = text.replace(/^\uFEFF/, '');
  return JSON.parse(clean);
}

// Fetch projects and generate cards
async function initPortfolio() {
  try {
    // Fetch projects.json
    const projectsData = await fetchJson('data/projects.json');
    
    allProjects = projectsData.projects;
    let projectDetailsMap = {};
    
    // Try to fetch project-details.json (optional)
    try {
      const detailsData = await fetchJson('data/project-details.json');
      projectDetailsMap = detailsData.projectDetails || {};
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

    // Delegate clicks to ensure card text clicks always open
    orbit.addEventListener('click', (e)=>{
      const targetCard = e.target && e.target.closest ? e.target.closest('.card') : null;
      if (targetCard) openCard(targetCard);
    });

    placeCards(cards);
    setupCardTilt();
    scheduleCardPlacement();
    console.log(`? Portfolio loaded with ${cards.length} projects`);
  } catch (err) {
    console.error('? Failed to load portfolio data:', err);
    // Show error message on page
    const orbit = document.getElementById('orbit');
    if (orbit) {
      orbit.innerHTML = `<div style="color: #ff6b6b; text-align: center; padding: 20px;">Error loading projects: ${err.message}</div>`;
    }
  }
}

function placeCards(targetCards){
  const n = targetCards.length;
  // Spread out the elements in an ellipse using orbit width/height
  const orbitEl = document.querySelector('.orbit');
  if (!orbitEl) return;
  const rect = orbitEl.getBoundingClientRect();
  let orbitWidth = rect.width;
  let orbitHeight = rect.height;

  if (!orbitWidth || !orbitHeight) {
    const styles = getComputedStyle(orbitEl);
    orbitWidth = parseFloat(styles.width) || orbitWidth;
    orbitHeight = parseFloat(styles.height) || orbitHeight;
  }

  if (!orbitWidth || !orbitHeight) return;

  const radiusX = orbitWidth / 2.2;
  const radiusY = orbitHeight / 2.2;
  const startAngle = -Math.PI / 2;

  targetCards.forEach((c,i)=>{
    const angle = startAngle + (i / n) * Math.PI * 2;
    c.dataset.index = i;
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    const baseTransform = `translate(${x}px, ${y}px)`;
    c.dataset.baseTransform = baseTransform;
    c.style.setProperty('--base-transform', baseTransform);
    c.style.setProperty('--tilt-transform', 'translateZ(0)');
  });
}

function scheduleCardPlacement(){
  if (!cards.length) return;
  requestAnimationFrame(()=> placeCards(cards));
  setTimeout(()=> placeCards(cards), 120);
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
    const hoverTarget = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (hoverTarget) {
      cursor.classList.add('is-hover');
      dot.classList.add('is-hover');
    } else {
      cursor.classList.remove('is-hover');
      dot.classList.remove('is-hover');
    }
  });

  document.addEventListener('mouseleave', ()=>{
    cursor.classList.add('is-hidden');
    dot.classList.add('is-hidden');
    cursor.classList.remove('is-hover');
    dot.classList.remove('is-hover');
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
      card.style.setProperty('--base-transform', baseTransform);
      card.style.setProperty('--tilt-transform', `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`);
    });

    card.addEventListener('mouseleave', ()=>{
      card.style.setProperty('--tilt-transform', 'translateZ(0)');
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
window.addEventListener('resize', scheduleCardPlacement);
window.addEventListener('load', scheduleCardPlacement);
