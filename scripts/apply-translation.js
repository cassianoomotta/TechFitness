const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const translations = {
  // 1. Remada bent over com barra
  "cmrpackgj0022tjus05d871ti": {
    name: "Remada curvada com barra (bent over)",
    description: "Fique em pé com os pés afastados na largura dos ombros e joelhos levemente flexionados. Incline o tronco para a frente a partir do quadril, mantendo as costas retas e o peito aberto. Segure a barra com pegada pronada (palmas para baixo), mãos um pouco além da largura dos ombros. Puxe a barra em direção à parte inferior do peito/abdômen, retraindo as escápulas e contraindo a musculatura das costas. Faça uma breve pausa no topo e desça a barra controladamente até a posição inicial. Repita pelo número desejado de repetições."
  },
  // 2. Remada rear delt com barra
  "cmrpacsi0003itjusr3rwf5d2": {
    name: "Remada para deltoide posterior com barra",
    description: "Fique em pé com os pés na largura dos ombros e joelhos ligeiramente flexionados. Segure a barra com pegada pronada, mãos mais afastadas que a largura dos ombros. Incline o tronco à frente a partir do quadril, mantendo a coluna neutra. Puxe a barra em direção ao peito, focando na ativação dos deltoides posteriores e escápulas. Pause brevemente no topo e retorne devagar até a posição inicial. Repita a série indicada."
  },
  // 3. Remada pegada invertida bent over com barra
  "cmrpact9f003ntjusdl9ik9cx": {
    name: "Remada curvada com barra pegada invertida (supinada)",
    description: "Fique em pé com os pés na largura dos ombros e joelhos ligeiramente flexionados. Segure a barra com pegada supinada/invertida (palmas voltadas para cima), mãos alinhadas aos ombros. Incline o tronco para a frente mantendo as costas retas e o peito erguido até quase ficar paralelo ao chão. Puxe a barra em direção à linha da cintura, aproximando as escápulas e contraindo os dorsais e bíceps. Segure um segundo no pico de contração e desça controladamente. Repita as repetições."
  },
  // 4. battling ropes
  "cmrpad13m0053tjusesx6yse0": {
    name: "Corda naval (battling ropes)",
    description: "Fique em pé com os pés na largura dos ombros, joelhos levemente flexionados e base atlética firme. Segure uma ponta da corda em cada mão com pegada neutra (palmas voltadas uma para a outra). Com os cotovelos levemente flexionados e o abdômen contraído, crie ondas alternadas na corda levantando e descendo os braços com vigor e velocidade. Mantenha a cadência contínua durante o tempo ou repetições estipuladas."
  },
  // 5. Remada bodyweight close grip em pé
  "cmrpad37p005htjusgff88uad": {
    name: "Remada peso corporal pegada fechada em pé",
    description: "Fique em pé com os pés na largura dos ombros e joelhos ligeiramente flexionados. Incline o tronco à frente a partir do quadril, mantendo as costas retas e o abdômen ativado. Segure a barra ou manoplas com pegada fechada e braços estendidos. Puxe em direção ao corpo, unindo as escápulas e contraindo as costas. Pause por um instante na contração máxima e retorne suavemente à posição inicial. Repita o movimento."
  },
  // 6. Remada bodyweight em pé
  "cmrpad3o6005ktjusbqtof5uz": {
    name: "Remada peso corporal pegada aberta em pé",
    description: "Fique em pé com os pés na largura dos ombros e joelhos levemente dobrados. Segure a barra ou apoios com pegada pronada (palmas para baixo). Mantenha as costas eretas e a postura estável. Puxe o corpo/barra em direção ao tronco, aproximando as escápulas. Pause um momento na contração máxima e estenda os braços de volta controlando o movimento. Repita pelo número prescrito."
  },
  // 7. cable two arm tricep kickback
  "cmrpadm2d008ytjus3bu32d85": {
    name: "Tríceps coice bilateral no cabo",
    description: "Fique em pé com os pés na largura dos ombros e joelhos levemente flexionados. Incline o tronco à frente. Segure as manoplas do cabo em cada mão com as palmas voltadas para dentro e os cotovelos flexionados a 90° alinhados às costelas. Mantendo a parte superior dos braços imóvel, estenda os antebraços para trás até a extensão completa dos cotovelos, contraindo os tríceps. Pause brevemente e retorne controlando a carga. Repita a série."
  },
  // 8. Remada ombros rear delt com halter
  "cmrpaefs800eetjussgl69b3q": {
    name: "Crucifixo invertido com halteres (deltoide posterior)",
    description: "Fique em pé com os pés na largura dos ombros e joelhos ligeiramente flexionados. Segure um halter em cada mão com as palmas voltadas uma para a outra. Incline o tronco à frente a partir do quadril, mantendo as costas retas e o abdômen firme. Com os cotovelos levemente flexionados, eleve os braços para as laterais até a linha dos ombros, apertando as escápulas. Pause no ponto mais alto e abaixe lentamente os halteres. Repita as repetições."
  },
  // 9. Remada pegada invertida female com halter
  "cmrpaegua00eltjusa53ahqpq": {
    name: "Remada curvada unilateral/bilateral com halteres pegada invertida",
    description: "Fique em pé com os pés alinhados à largura dos ombros e joelhos flexionados. Segure os halteres com as palmas voltadas para a frente ou pegada neutra/supinada. Incline o tronco com o peito aberto e costas retas. Deixe os braços estendidos abaixo do peito. Puxe os halteres em direção ao abdômen, unindo as escápulas e ativando os dorsais. Segure um instante e abaixe os pesos com controle. Repita pelo número estipulado."
  },
  // 10. Remada pegada invertida ez bar bent over (O EXERCÍCIO DA PERGUNTA)
  "cmrpaexu800hptjusol4x9w2i": {
    name: "Remada curvada com barra W pegada invertida (supinada)",
    description: "Fique em pé com os pés afastados na largura dos ombros e joelhos levemente flexionados. Segure a barra W com pegada supinada (palmas voltadas para cima) e mãos alinhadas na largura dos ombros. Incline o tronco para a frente a partir do quadril, mantendo a coluna alinhada e o peito erguido, até o tronco ficar quase paralelo ao chão. Puxe a barra W em direção à parte inferior do peito/abdômen, aproximando as escápulas e contraindo as costas. Faça uma breve pausa no topo e desça a barra de forma lenta e controlada até a posição inicial. Repita pelo número desejado de repetições."
  },
  // 11. Pular corda
  "cmrpafawg00k3tjusmnrklm5y": {
    name: "Pular corda (jump rope)",
    description: "Segure as manoplas da corda com as mãos e as palmas voltadas para dentro. Fique em pé com os pés na largura dos ombros e joelhos ligeiramente flexionados. Gire a corda sobre a cabeça e salte de forma coordenada assim que ela se aproximar dos pés. Amorteça a queda suavemente na parte anterior dos pés (metatarsos) e repita os saltos em ritmo constante durante o tempo ou repetições planejadas."
  },
  // 12. Remada bent over na máquina articulada
  "cmrpafji900lntjusngqka9f1": {
    name: "Remada curvada articulada na máquina",
    description: "Posicione-se com os pés na largura dos ombros e joelhos levemente flexionados. Segure as manoplas da máquina com pegada pronada, mãos ligeiramente mais afastadas que os ombros. Incline o tronco mantendo a postura firme e peito aberto. Puxe a carga em direção à região lombar/abdômen, retraindo as escápulas. Pause por um momento na contração máxima e retorne lentamente controlando a descida do peso. Repita a série."
  },
  // 13. swing 360
  "cmrpagrcl00tktjus8nkojona": {
    name: "Swing circular 360 com rotação de tronco",
    description: "Fique em pé com os pés na largura dos ombros e joelhos levemente flexionados. Mantenha os braços estendidos à frente, alinhados com o solo. Contraia o abdômen e balance os braços em trajetória circular ampla, girando o tronco com fluidez e controle corporal. Mantenha o movimento giratório pelo tempo ou repetições indicadas, respirando continuamente sem prender o ar."
  }
};

async function main() {
  console.log("=== ATUALIZANDO EXERCÍCIOS NO BANCO DE DADOS ===");
  
  for (const [id, data] of Object.entries(translations)) {
    try {
      const updated = await prisma.exercise.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description
        }
      });
      console.log(`✅ [DB OK] ${updated.name}`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar no DB [ID ${id}]:`, err.message);
    }
  }

  console.log("\n=== ATUALIZANDO ARQUIVO DE SEEDS (exercises_ptbr.json) ===");
  const seedPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');
  if (fs.existsSync(seedPath)) {
    const rawSeeds = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    let updatedCount = 0;

    // Buscar correspondências por nome original ou descrição
    const seedSearchKeys = [
      { key: "Remada pegada invertida ez bar bent over", target: translations["cmrpaexu800hptjusol4x9w2i"] },
      { key: "Remada bent over com barra", target: translations["cmrpackgj0022tjus05d871ti"] },
      { key: "Remada rear delt com barra", target: translations["cmrpacsi0003itjusr3rwf5d2"] },
      { key: "Remada pegada invertida bent over com barra", target: translations["cmrpact9f003ntjusdl9ik9cx"] },
      { key: "battling ropes", target: translations["cmrpad13m0053tjusesx6yse0"] },
      { key: "Remada bodyweight close grip em pé", target: translations["cmrpad37p005htjusgff88uad"] },
      { key: "Remada bodyweight em pé", target: translations["cmrpad3o6005ktjusbqtof5uz"] },
      { key: "cable two arm tricep kickback", target: translations["cmrpadm2d008ytjus3bu32d85"] },
      { key: "Remada ombros rear delt com halter", target: translations["cmrpaefs800eetjussgl69b3q"] },
      { key: "Remada pegada invertida female com halter", target: translations["cmrpaegua00eltjusa53ahqpq"] },
      { key: "Pular corda", target: translations["cmrpafawg00k3tjusmnrklm5y"] },
      { key: "Remada bent over na máquina articulada", target: translations["cmrpafji900lntjusngqka9f1"] },
      { key: "swing 360", target: translations["cmrpagrcl00tktjus8nkojona"] }
    ];

    rawSeeds.forEach(item => {
      const match = seedSearchKeys.find(s => s.key.toLowerCase() === item.name.toLowerCase());
      if (match) {
        item.name = match.target.name;
        item.description = match.target.description;
        updatedCount++;
      }
    });

    fs.writeFileSync(seedPath, JSON.stringify(rawSeeds, null, 2), 'utf8');
    console.log(`✅ [SEED OK] ${updatedCount} exercícios atualizados no exercises_ptbr.json.`);
  }

  console.log("\n=== VERIFICAÇÃO FINAL NO BANCO ===");
  const sample = await prisma.exercise.findUnique({
    where: { id: "cmrpaexu800hptjusol4x9w2i" }
  });
  console.log("Exercício principal atualizado:");
  console.log("- Nome:", sample.name);
  console.log("- Descrição:", sample.description);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
