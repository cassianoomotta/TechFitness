const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting script to seed missing exercises from playlist...");
  
  if (!fs.existsSync('scripts/playlist-seed-data.json')) {
    console.error("Error: scripts/playlist-seed-data.json does not exist. Run extract-playlist-full.py first.");
    return;
  }
  
  const seedData = JSON.parse(fs.readFileSync('scripts/playlist-seed-data.json', 'utf8'));
  console.log(`Loaded ${seedData.length} exercises from playlist-seed-data.json`);
  
  // Get existing exercises in DB
  const dbExercises = await prisma.exercise.findMany();
  const dbNames = new Set(dbExercises.map(e => e.name.toLowerCase().trim()));
  const dbUrls = new Set(dbExercises.map(e => e.videoUrl ? e.videoUrl.toLowerCase().trim() : ''));
  console.log(`Current exercises in DB: ${dbExercises.length}`);
  
  let insertedCount = 0;
  let skippedCount = 0;
  
  for (const ex of seedData) {
    const nameLower = ex.name.toLowerCase().trim();
    const urlLower = ex.videoUrl ? ex.videoUrl.toLowerCase().trim() : '';
    
    // Check if name or videoUrl already exists in DB
    if (dbNames.has(nameLower) || (urlLower && dbUrls.has(urlLower))) {
      skippedCount++;
      continue;
    }
    
    try {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          videoUrl: ex.videoUrl,
          description: ex.description || null
        }
      });
      // Add to sets to prevent duplicates inside this seed loop
      dbNames.add(nameLower);
      if (urlLower) dbUrls.add(urlLower);
      insertedCount++;
    } catch (e) {
      console.error(`Error inserting ${ex.name}:`, e.message);
    }
  }
  
  console.log(`Seeding completed:`);
  console.log(`- Inserted: ${insertedCount} missing exercises`);
  console.log(`- Skipped (already existed): ${skippedCount} exercises`);
  
  const total = await prisma.exercise.count();
  console.log(`New total exercises in DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
