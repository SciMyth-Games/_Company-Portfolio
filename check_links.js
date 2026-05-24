const fs = require('fs');

async function run() {
  const res = await fetch('https://rez26.github.io/_Portfolio/data/cv.json');
  const data = await res.json();
  const ss = data.projects.find(p => p.title.includes('Surprise Sprint'));
  const wd = data.projects.find(p => p.title.includes('Word Dash'));
  console.log('Surprise Sprint:', ss);
  console.log('Word Dash:', wd);
}

run();
