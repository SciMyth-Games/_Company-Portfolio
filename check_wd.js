const https = require('https');

https.get('https://rez26.github.io/_Portfolio/data/cv.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let cv = JSON.parse(data);
    let wd = cv.projects.find(p => p.title.includes('Word Dash'));
    let ss = cv.projects.find(p => p.title.includes('Surprise Sprint'));
    console.log("Word Dash:", JSON.stringify(wd, null, 2));
    console.log("Surprise Sprint:", JSON.stringify(ss, null, 2));
  });
});
