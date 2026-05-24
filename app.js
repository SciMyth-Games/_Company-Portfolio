const orbit = document.getElementById('orbit');
let cards = [];
let allProjects = [];
const filters = document.querySelectorAll('.filter');

let rotation = 0;
let tilt = 0;
let activeIndex = 0;

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
    
    // Merge project details into projects
    allProjects = allProjects.map(p => {
      const details = projectDetailsMap[p.id] || {};
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
    c.style.transform = `rotate(${angle}deg) translateY(calc(var(--orbit-size) / -2.2)) rotate(-${angle}deg)`;
  });
}

function updateOrbit(){
  orbit.style.transform = `rotateX(${tilt}deg) rotateZ(${rotation}deg)`;
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
