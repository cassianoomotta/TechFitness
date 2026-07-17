const fs = require('fs');
const path = require('path');

// Adicione sua chave de API do Google Gemini Studio no .env como GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY;

const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');

async function translateBatch(exercisesBatch) {
  const prompt = `
Você é um especialista em educação física e fisiologia.
Traduza os seguintes exercícios do inglês para português do Brasil.
Você deve retornar APENAS um array JSON válido contendo os objetos atualizados.
Não adicione markdown (como \`\`\`json) na resposta, APENAS O ARRAY PURO.

Traduza os campos "name", "muscleGroup" (mapeado de "category" ou "target") e "equipment".
Mantenha os campos "gifUrl" e "videoUrl".

Aqui estão os exercícios:
${JSON.stringify(exercisesBatch, null, 2)}
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0, // Ser determinístico
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Erro na API:", data.error.message);
      return [];
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    
    // Limpar block de markdown se a IA colocar sem querer
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Erro ao traduzir lote:', error);
    return [];
  }
}

async function main() {
  if (API_KEY === 'SUA_API_KEY_AQUI') {
    console.error("⚠️ ERRO: Configure sua GEMINI_API_KEY no script ou no ambiente antes de rodar.");
    process.exit(1);
  }

  console.log("Lendo dataset raw...");
  const rawData = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));
  
  // Mapear para o formato do nosso schema Prisma antes de enviar
  const mappedData = rawData.map(ex => ({
    name: ex.name,
    muscleGroup: ex.category || ex.body_part || 'Geral',
    equipment: ex.equipment,
    description: ex.instructions?.en || null,
    gifUrl: ex.gif_url || null,
    videoUrl: null
  }));

  const BATCH_SIZE = 150;
  let translatedExercises = [];

  console.log(`Total de exercícios para traduzir: ${mappedData.length}`);

  for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
    console.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(mappedData.length / BATCH_SIZE)}...`);
    const batch = mappedData.slice(i, i + BATCH_SIZE);
    
    // Simplificar a descrição no envio para economizar tokens, ou remover se não for usar a IA para traduzir descrição longa
    // Para baratear e não estourar tokens, vamos traduzir só o essencial e deixar description null ou simplificada
    let retries = 0;
    let sucesso = false;

    while (!sucesso && retries < 5) {
      console.log(`[${Math.round((i / mappedData.length) * 100)}%] Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(mappedData.length / BATCH_SIZE)}... (Tentativa ${retries + 1}/5)`);
      const batchToTranslate = batch.map(b => ({
        name: b.name,
        muscleGroup: b.muscleGroup,
        equipment: b.equipment,
        gifUrl: b.gifUrl
      }));

      const result = await translateBatch(batchToTranslate);
      
      if (result.length > 0) {
        translatedExercises = translatedExercises.concat(result);
        fs.writeFileSync(outputPath, JSON.stringify(translatedExercises, null, 2));
        sucesso = true;
      } else {
        retries++;
        console.log(`⚠️ Limite atingido ou erro. Aguardando 30 segundos antes de tentar o mesmo lote de novo...`);
        await new Promise(r => setTimeout(r, 30000)); // Espera 30s se der erro
      }
    }

    if (!sucesso) {
      console.log("❌ Falha crítica no lote após 5 tentativas. Encerrando para não corromper os dados.");
      break;
    }

    // Delay normal entre requisições com sucesso para não estourar o limite (15 segundos)
    console.log("Lote traduzido! Aguardando 15s (Anti-Bloqueio Google)...");
    await new Promise(r => setTimeout(r, 15000));
  }

  if (translatedExercises.length === mappedData.length) {
    console.log(`\n✅ Tradução 100% concluída! Arquivo salvo em ${outputPath}`);
    console.log(`Agora você pode rodar 'npm run prisma:seed' (ou o script correspondente) para importar.`);
  } else {
    console.log(`\n⚠️ Tradução parou pela metade. Progresso salvo em ${outputPath}`);
  }
}

main();
