import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_raw.json');
const rawData: any[] = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const candidateIds = ['0869', '2318', '0190', '0597', '0868', '2611', '2335', '0548'];

console.log('--- DETALHES DOS CANDIDATOS ---');
for (const id of candidateIds) {
  const item = rawData.find(e => e.id === id);
  if (item) {
    console.log(`\nID: ${item.id} | Name: "${item.name}"`);
    console.log(`Equipment: ${item.equipment} | Body Part: ${item.body_part} | Target: ${item.target}`);
    console.log(`GIF: ${item.gif_url}`);
    console.log(`Instructions: ${item.instructions?.en?.substring(0, 160)}...`);
  }
}
