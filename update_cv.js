const fs = require('fs');
const path = require('path');

const projectsDir = 'D:/_Portfolio/projects';
let cv = JSON.parse(fs.readFileSync('D:/_Company Portfolio/cv.json', 'utf8'));

fs.readdirSync(projectsDir).forEach(folder => {
  const pPath = path.join(projectsDir, folder, 'index.html');
  if (fs.existsSync(pPath)) {
    const html = fs.readFileSync(pPath, 'utf8');
    
    // Extract Play Game / Download link
    let dlMatch = html.match(/href="([^"]+)"[^>]*>Play Game/);
    if (!dlMatch) dlMatch = html.match(/href="([^"]+)"[^>]*>Download/);
    
    // Extract Video
    let vidMatch = html.match(/youtube\.com\/embed\/([^"?]+)/);
    
    // Find matching project in cv.json by folder name mapping 
    // Find the one where `demo` contains the folder name
    const proj = cv.projects.find(p => p.demo && p.demo.includes(folder + '/'));
    if (proj) {
      if (vidMatch) {
         proj.video = "https://youtu.be/" + vidMatch[1];
      }
      if (dlMatch) {
         proj.download = dlMatch[1];
      }
    }
  }
});

fs.writeFileSync('D:/_Company Portfolio/cv.json', JSON.stringify(cv, null, 2));
console.log("Updated local cv.json with correct links from local project files!");

