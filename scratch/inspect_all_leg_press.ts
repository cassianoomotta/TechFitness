import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_raw.json');
const rawData: any[] = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const lp = rawData.filter(e => e.name.toLowerCase().includes('leg press'));
for (const item of lp) {
  console.log(`\nID: ${item.id} | Name: "${item.name}"`);
  console.log(`Equipment: ${item.equipment} | Body Part: ${item.body_part} | Target: ${item.target}`);
  console.log(`GIF: ${item.gif_url}`);
}
