const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { translate } = require('bing-translate-api');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

async function main() {
  const backupPath = path.join(__dirname, '..', 'backup_exercicios_originais_2026-07-17_13-54.json');
  const rawPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
  
  const backupExercises = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const rawExercises = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  
  const rawNames = rawExercises.map(ex => ex.name.toLowerCase());
  
  console.log(`Starting accurate re-mapping using Bing for ${backupExercises.length} exercises...`);
  
  let successCount = 0;
  
  for (const orig of backupExercises) {
    try {
      // 1. Translate Portuguese name to English
      let query = orig.name;
      query = query.replace(/polia/gi, 'cable');
      query = query.replace(/cross/gi, 'cable');
      query = query.replace(/guiada/gi, 'smith machine');
      query = query.replace(/apoiado/gi, 'supported');
      query = query.replace(/anilha/gi, 'weight plate');
      query = query.replace(/halter(es)?/gi, 'dumbbell');
      query = query.replace(/supino/gi, 'bench press');
      query = query.replace(/agachamento/gi, 'squat');
      query = query.replace(/afundo/gi, 'lunge');
      query = query.replace(/extensora/gi, 'leg extension');
      query = query.replace(/flexora/gi, 'leg curl');
      query = query.replace(/panturrilha/gi, 'calf');
      query = query.replace(/costas/gi, 'back');
      query = query.replace(/peito/gi, 'chest');
      query = query.replace(/rosca/gi, 'curl');
      query = query.replace(/elevação/gi, 'raise');
      query = query.replace(/desenvolvimento/gi, 'shoulder press');
      query = query.replace(/glúteo/gi, 'glute');
      
      const res = await translate(query, null, 'en');
      let englishName = res.translation;
      if (!englishName) englishName = query;
      
      // 2. Find best match in rawExercises
      const matches = stringSimilarity.findBestMatch(englishName.toLowerCase(), rawNames);
      const bestMatchIndex = matches.bestMatchIndex;
      const bestMatchScore = matches.bestMatch.rating;
      
      const matchedEx = rawExercises[bestMatchIndex];
      
      // 3. Update in database if score is decent (>0.35)
      if (bestMatchScore > 0.35) {
        await prisma.exercise.update({
          where: { id: orig.id },
          data: { gifUrl: matchedEx.gif_url } // FIXED KEY HERE
        });
        console.log(`[✔] ${orig.name} -> (translated: ${englishName}) -> ${matchedEx.name} (Score: ${bestMatchScore.toFixed(2)})`);
        successCount++;
      } else {
        await prisma.exercise.update({
          where: { id: orig.id },
          data: { gifUrl: null }
        });
        console.log(`[X] ${orig.name} -> (translated: ${englishName}) -> NO GOOD MATCH (Score: ${bestMatchScore.toFixed(2)})`);
      }
      
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`Error processing ${orig.name}:`, err.message);
    }
  }
  
  console.log(`Completed mapping. Successfully mapped: ${successCount}/${backupExercises.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
