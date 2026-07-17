const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const API_KEY = process.env.GEMINI_API_KEY || "";

const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'mapped_core_gifs.json');

async function matchBatch(portugueseBatch, rawEnglishList) {
  const prompt = `
Você é um especialista em educação física e musculação.
Mapeie cada exercício em português para o seu correspondente em inglês no dataset fornecido.
O objetivo é encontrar o exercício em inglês que seja o mesmo movimento físico para que possamos usar o GIF dele.
Se não houver correspondente exato, encontre o mais próximo (ex: variações com barra, halteres, cabo ou máquina que façam o mesmo movimento).
Se não houver nenhum exercício semelhante, retorne null no campo "matchedEnglishName".

Retorne APENAS um array JSON contendo objetos no seguinte formato:
[
  { "id": "id_do_exercicio_em_portugues", "portugueseName": "nome_em_portugues", "matchedEnglishName": "nome_do_exercicio_em_ingles_do_dataset" }
]
Retorne APENAS o JSON bruto, sem formatação markdown (como \`\`\`json) ou qualquer outro texto explicativo.

Exercícios em Português:
${JSON.stringify(portugueseBatch.map(ex => ({ id: ex.id, name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment })), null, 2)}

Exercícios em Inglês Disponíveis (Dataset):
${JSON.stringify(rawEnglishList.map(ex => ({ name: ex.name, target: ex.target, equipment: ex.equipment })), null, 2)}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Erro na API Gemini:", data.error.message);
      return [];
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Erro ao mapear lote:', error);
    return [];
  }
}

async function main() {
  console.log("Lendo exercícios do banco de dados com gifUrl nulo...");
  const dbExercises = await prisma.exercise.findMany({
    where: { gifUrl: null }
  });
  console.log(`Total de exercícios sem GIF no DB: ${dbExercises.length}`);

  if (dbExercises.length === 0) {
    console.log("Todos os exercícios já possuem GIF!");
    return;
  }

  console.log("Lendo dataset raw em inglês...");
  const rawEnglishList = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));
  console.log(`Total de exercícios em inglês no dataset: ${rawEnglishList.length}`);

  const BATCH_SIZE = 180;
  let allMapped = [];

  // Se já existir um progresso parcial, carrega para não perder
  if (fs.existsSync(outputPath)) {
    try {
      allMapped = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      console.log(`Carregado progresso anterior: ${allMapped.length} exercícios mapeados.`);
    } catch (e) {
      console.log("Criando novo mapeamento.");
    }
  }

  const mappedIds = new Set(allMapped.map(m => m.id));
  const remainingExercises = dbExercises.filter(ex => !mappedIds.has(ex.id));
  console.log(`Exercícios restantes para processar: ${remainingExercises.length}`);

  for (let i = 0; i < remainingExercises.length; i += BATCH_SIZE) {
    const batch = remainingExercises.slice(i, i + BATCH_SIZE);
    console.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(remainingExercises.length / BATCH_SIZE)}... (${batch.length} exercícios)`);

    let retries = 0;
    let success = false;

    while (!success && retries < 3) {
      console.log(`Tentativa ${retries + 1}/3...`);
      const result = await matchBatch(batch, rawEnglishList);

      if (result && result.length > 0) {
        allMapped = allMapped.concat(result);
        fs.writeFileSync(outputPath, JSON.stringify(allMapped, null, 2), 'utf8');
        console.log(`Lote concluído e salvo com sucesso. Total mapeado até agora: ${allMapped.length}`);
        success = true;
      } else {
        retries++;
        if (retries < 3) {
          console.log("Falha ou limite atingido. Aguardando 45 segundos antes de tentar novamente...");
          await new Promise(resolve => setTimeout(resolve, 45000));
        }
      }
    }

    if (!success) {
      console.log("❌ Parando o processamento devido a falhas consecutivas.");
      break;
    }

    // Delay de 15 segundos entre requisições para evitar rate limit
    if (i + BATCH_SIZE < remainingExercises.length) {
      console.log("Aguardando 15s para o próximo lote...");
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  console.log(`\n✅ Mapeamento concluído! ${allMapped.length} de ${dbExercises.length} exercícios mapeados.`);
  console.log(`Resultado salvo em: ${outputPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
