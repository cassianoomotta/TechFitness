const fs = require('fs');
const path = require('path');

const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const rawEnglishList = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));

const targets = new Set();
const categories = new Set();
const equipments = new Set();

rawEnglishList.forEach(ex => {
  if (ex.target) targets.add(ex.target);
  if (ex.category) categories.add(ex.category);
  if (ex.equipment) equipments.add(ex.equipment);
});

console.log("Targets:", Array.from(targets));
console.log("Categories:", Array.from(categories));
console.log("Equipments:", Array.from(equipments));
