const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando backup da tabela Exercise...');
  const exercises = await prisma.exercise.findMany();
  
  // Cria um nome legível ex: backup_exercicios_originais_2026-07-17_13-55.json
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const backupFilename = `backup_exercicios_originais_${year}-${month}-${day}_${hours}-${minutes}.json`;
  
  // Salva na raiz do projeto
  const backupPath = path.join(__dirname, '..', backupFilename);
  
  fs.writeFileSync(backupPath, JSON.stringify(exercises, null, 2), 'utf-8');
  console.log(`Backup salvo com sucesso em: ${backupPath}`);
  console.log(`Total de exercícios salvos: ${exercises.length}`);
}

main()
  .catch((e) => {
    console.error('Erro ao fazer backup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
