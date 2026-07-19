const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Levenshtein distance
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

async function main() {
  const backupPath = path.join(__dirname, '..', 'backup_exercicios_originais_2026-07-17_13-54.json');
  const ptbrPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');

  const backupExercises = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const ptbrExercises = JSON.parse(fs.readFileSync(ptbrPath, 'utf8'));

  console.log(`Original Core: ${backupExercises.length}`);
  console.log(`PTBR Translated: ${ptbrExercises.length}`);

  let exactMatches = 0;
  let fuzzyMatches = 0;
  let notFound = 0;

  for (const orig of backupExercises) {
    const origName = orig.name.trim().toLowerCase();
    
    // First try exact match
    let match = ptbrExercises.find(ex => ex.name.trim().toLowerCase() === origName);
    
    if (match) {
      exactMatches++;
    } else {
      // Fuzzy match
      let bestDist = Infinity;
      let bestMatch = null;
      
      for (const pt of ptbrExercises) {
        const ptName = pt.name.trim().toLowerCase();
        const dist = levenshtein(origName, ptName);
        if (dist < bestDist) {
          bestDist = dist;
          bestMatch = pt;
        }
      }
      
      if (bestMatch && bestDist <= Math.max(3, origName.length * 0.3)) {
        match = bestMatch;
        fuzzyMatches++;
      }
    }
    
    if (match && match.gifUrl) {
      await prisma.exercise.update({
        where: { id: orig.id },
        data: { gifUrl: match.gifUrl }
      });
      console.log(`[OK] ${orig.name} -> ${match.gifUrl} (via ${match.name})`);
    } else {
      notFound++;
      console.log(`[MISS] No match for: ${orig.name}`);
    }
  }

  console.log(`\nExact: ${exactMatches}, Fuzzy: ${fuzzyMatches}, Miss: ${notFound}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
