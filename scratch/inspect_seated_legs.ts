import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_raw.json');
const rawData: any[] = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const seatedLegs = rawData.filter(e => 
  (e.body_part === 'upper legs' || e.target === 'quads' || e.target === 'glutes') &&
  (e.name.includes('press') || e.name.includes('squat')) &&
  (e.equipment === 'leverage machine' || e.equipment === 'machine' || e.equipment === 'sled machine')
);
for (const item of seatedLegs) {
  console.log(`\nID: ${item.id} | Name: "${item.name}" | Equip: ${item.equipment}`);
  console.log(`GIF: ${item.gif_url}`);
}
