const fs = require('fs');
const content = fs.readFileSync('data/project-details.json', 'utf8');
const noBom = content.replace(/^\uFEFF/, '');
const data = JSON.parse(noBom);

function printKeys() {
  const pd = data.projectDetails;
  console.log("Keys:", Object.keys(pd));
}
printKeys();
