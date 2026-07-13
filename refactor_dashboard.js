const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/student/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

console.log("Refactoring page.tsx...");
