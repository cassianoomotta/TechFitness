// Script to build the final seed from extracted playlist data + playlist 1 shorts
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load extracted playlist 2 videos
const playlist2 = JSON.parse(fs.readFileSync('scripts/playlist-videos.json', 'utf8'));

// Playlist 1 shorts (already extracted previously)
const playlist1 = [
  { title: "Remada Curvada Pronada", videoId: "ZCLySTuhTyg" },
  { title: "Puxada Alta Pronada", videoId: "58l3JzLKhf8" },
  { title: "Remada Baixa Triângulo", videoId: "na-lNfQQkYk" },
  { title: "Puxada Alta Triângulo", videoId: "3IGToev6BEo" },
  { title: "Remada Unilateral Serrote", videoId: "95WbXV7LKCo" },
  { title: "Levantamento Terra Tradicional", videoId: "k6eZCDVNWco" },
  { title: "Supino Reto com Barra", videoId: "ZL-sw4fqkE4" },
  { title: "Supino Reto com Halteres", videoId: "JlnIpcMpkuw" },
  { title: "Crucifixo Máquina (Peck Deck)", videoId: "3NzHyUoRJ0A" },
  { title: "Agachamento no Smith", videoId: "RQhnPIIk4BU" },
  { title: "Leg Press 45 Bilateral", videoId: "HITlVV4eXSA" },
  { title: "Cadeira Extensora Bilateral", videoId: "Pj4zPwCDLN0" },
  { title: "Cadeira Flexora Bilateral", videoId: "DYfZ_m-yciE" },
  { title: "Afundo com Halteres", videoId: "BeOtD76Z6nU" },
  { title: "Stiff / Terra Sumô", videoId: "Z4aQruKglOM" },
  { title: "Desenvolvimento com Halteres Sentado", videoId: "4yNsA3Vf1g8" },
  { title: "Elevação Lateral com Halteres", videoId: "0WxSGB5cvEw" },
  { title: "Crucifixo Invertido na Máquina", videoId: "uY5kRo_iyl8" },
  { title: "Rosca Direta com Halteres", videoId: "BH4RDHryDbU" },
  { title: "Rosca Alternada com Halteres", videoId: "l5b_u4OW2GY" },
  { title: "Tríceps Corda na Polia", videoId: "nkhwFKpEhgw" },
  { title: "Tríceps Testa com Barra W", videoId: "x9lbdH8qbHM" },
  { title: "Flexão de Braço", videoId: "dTCO9wDonTE" },
  { title: "Prancha Isométrica", videoId: "fKkarqjGve8" },
  { title: "Anti Rotação / Estabilização", videoId: "dTCO9wDonTE" },
];

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function guessMusleGroup(title) {
  const t = title.toLowerCase();
  if (/peit|supino|crucifixo(?!.*inver)|cross.*over|peck|fly|voador/i.test(t)) return 'Peito';
  if (/costa|remada|puxad|pulley.*costa|serrote|lat.*pull|barra fixa|escapula|cavalinho/i.test(t)) return 'Costas';
  if (/perna|agach|leg|extensor|flexor|hack|afundo|stiff|búlgar|cadeira.*ext|cadeira.*flex|sissy|passada|terra.*sum/i.test(t)) return 'Pernas';
  if (/ombro|deltoid|desenvolvimento|elevação lateral|arnold|elevação frontal|crucifixo.*inver/i.test(t)) return 'Ombros';
  if (/bícep|rosca|trícep|francês|testa|pulley.*corda|martelo|punho|antebraço|spider|scott/i.test(t)) return 'Braços';
  if (/abdom|prancha|oblíqu|core|crunch|infra|canivete|giro.*russo|canoa|bicicleta|serrote.*polia/i.test(t)) return 'Core';
  if (/panturr|gêmeo|sóleo|calf|tibial/i.test(t)) return 'Pernas';
  if (/glút|elevação pélvica|hip.*thrust|abdução.*quadril/i.test(t)) return 'Pernas';
  if (/trapéz|encolhimento/i.test(t)) return 'Costas';
  if (/along|mobilidade|flexão.*quadril|elevação.*Y|caranguejo/i.test(t)) return 'Mobilidade';
  if (/cardio|esteira|bicicl|elíptic/i.test(t)) return 'Cardio';
  if (/thruster|landmine/i.test(t)) return 'Ombros';
  return 'Outros';
}

function guessEquipment(title) {
  const t = title.toLowerCase();
  if (/halter|dumbbell/i.test(t)) return 'Halteres';
  if (/barra\s*(w|h|reta|guiada)|smith|landmine/i.test(t)) return 'Barra';
  if (/máquina|aparelho|hack|leg.*press|extensor|flexor|peck|scott|articulado/i.test(t)) return 'Máquina';
  if (/polia|cross|pulley|cabo|corda/i.test(t)) return 'Polia';
  if (/elástico|fita|faixa/i.test(t)) return 'Elástico';
  if (/anilha/i.test(t)) return 'Anilha';
  if (/peso corporal|flexão|prancha|barra fixa|paralela|solo|parede|step|banco/i.test(t)) return 'Peso Corporal';
  if (/giri|kettlebell/i.test(t)) return 'Kettlebell';
  return 'Outros';
}

async function main() {
  console.log('Building comprehensive exercise seed...');
  
  // Combine both playlists, dedup by videoId
  const seen = new Set();
  const allVideos = [];
  
  // Add playlist 1
  for (const v of playlist1) {
    if (!seen.has(v.videoId)) {
      seen.add(v.videoId);
      allVideos.push({
        name: capitalize(v.title),
        videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        muscleGroup: guessMusleGroup(v.title),
        equipment: guessEquipment(v.title),
      });
    }
  }
  
  // Add playlist 2
  for (const v of playlist2) {
    if (!seen.has(v.videoId)) {
      seen.add(v.videoId);
      allVideos.push({
        name: capitalize(v.title),
        videoUrl: v.url,
        muscleGroup: guessMusleGroup(v.title),
        equipment: guessEquipment(v.title),
      });
    }
  }
  
  // Dedup by name (keep first occurrence)
  const namesSeen = new Set();
  const unique = [];
  for (const v of allVideos) {
    const key = v.name.toLowerCase().trim();
    if (!namesSeen.has(key)) {
      namesSeen.add(key);
      unique.push(v);
    }
  }
  
  console.log(`Total unique exercises: ${unique.length}`);
  
  // Clear existing exercises
  await prisma.exercise.deleteMany({});
  console.log('Cleared existing exercises.');
  
  // Insert all
  let count = 0;
  for (const ex of unique) {
    try {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          description: null,
          videoUrl: ex.videoUrl,
        }
      });
      count++;
    } catch (e) {
      console.log(`Skipping duplicate: ${ex.name}`);
    }
  }
  
  console.log(`Seed complete! ${count} exercises created.`);
  
  // Print summary by muscle group
  const groups = {};
  for (const ex of unique) {
    groups[ex.muscleGroup] = (groups[ex.muscleGroup] || 0) + 1;
  }
  console.log('\nBy muscle group:');
  for (const [g, c] of Object.entries(groups).sort((a,b) => b[1] - a[1])) {
    console.log(`  ${g}: ${c}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
