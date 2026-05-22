const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function mg(t) {
  const l = t.toLowerCase();
  if (/peit|supino|fly|cross.*over/i.test(l)) return 'Peito';
  if (/costa|remada|puxad|pulley|barra fixa|graviton|pull.*down|escapul/i.test(l)) return 'Costas';
  if (/perna|agach|leg|extensor|flexor|hack|afundo|stiff|búlgar|cadeira|mesa.*flex|avanço|recuo|levantamento|rdl|adutor|abdutor|abdução|adução|glút|coice|concha|sissy|bom dia/i.test(l)) return 'Pernas';
  if (/ombro|deltoid|desenvolvimento|elevação lateral|arnold|elevação frontal|face.*pull|landmine.*press/i.test(l)) return 'Ombros';
  if (/bícep|rosca|trícep|francês|testa|martelo|punho|antebraço|spider|scott/i.test(l)) return 'Braços';
  if (/abdom|prancha|oblíqu|core|crunch|infra|canivete|giro.*russo|canoa|bicicleta|anti.*rotação|chop/i.test(l)) return 'Core';
  if (/panturr|gêmeo|sóleo|calf|tibial|flexão.*plantar/i.test(l)) return 'Pernas';
  if (/along|mobilidade|liberação|ativação/i.test(l)) return 'Mobilidade';
  if (/cardio|esteira|bicicl|elíptic|bike|corrida|caminhada|corda.*naval|polichinelo|salto.*corda|kipping/i.test(l)) return 'Cardio';
  if (/flexão.*braço|flexão.*nórdica/i.test(l)) return 'Peito';
  if (/arremesso/i.test(l)) return 'Core';
  return 'Outros';
}

function eq(t) {
  const l = t.toLowerCase();
  if (/halter|dumbbell|dumbell/i.test(l)) return 'Halteres';
  if (/barra.*(w|h|reta|guiada|hexagonal)|smith|landmine/i.test(l)) return 'Barra';
  if (/máquina|aparelho|hack|leg|extensora|flexora|cadeira|mesa|articulad|graviton|adutora|abdutora/i.test(l)) return 'Máquina';
  if (/polia|cross|pulley|cabo|corda(?!.*naval)/i.test(l)) return 'Polia';
  if (/elástico|fita|faixa/i.test(l)) return 'Elástico';
  if (/anilha/i.test(l)) return 'Anilha';
  if (/caneleira/i.test(l)) return 'Caneleira';
  if (/step/i.test(l)) return 'Step';
  if (/esteira/i.test(l)) return 'Máquina';
  if (/bike|elíptico/i.test(l)) return 'Máquina';
  if (/corda.*naval/i.test(l)) return 'Corda Naval';
  return 'Peso Corporal';
}

const batch3 = [
  "Mesa flexora|https://www.youtube.com/watch?v=sPw-WEBCVes",
  "Liberação na torácica|https://www.youtube.com/watch?v=-3mgBUY6UUo",
  "Leg 180 unilateral|https://www.youtube.com/watch?v=B5cQunAv4K0",
  "Mesa flexora unilateral|https://www.youtube.com/watch?v=DHKPeaW49VM",
  "Leg 180 pés altos|https://www.youtube.com/watch?v=SNmpBS4robY",
  "Levantamento sumo|https://www.youtube.com/watch?v=VmKJ3gect58",
  "Leg 45 pés baixos|https://www.youtube.com/watch?v=Zxx5_Yo-g_0",
  "Lift posição de afundo|https://www.youtube.com/watch?v=bA37GcoJfgw",
  "Levantamento terra barra hexagonal|https://www.youtube.com/watch?v=eSY_fyndzFM",
  "Leg 180 pés baixos|https://www.youtube.com/watch?v=jIfL0U-YEcw",
  "Levantamento terra|https://www.youtube.com/watch?v=xjL-ALE9f4s",
  "Kipping + Flexão de Braços|https://www.youtube.com/watch?v=5ihTyFNWDPw",
  "Landmine press semi ajoelhado|https://www.youtube.com/watch?v=5v3RHdurh-M",
  "Leg 45 pés abduzidos|https://www.youtube.com/watch?v=954tc-olxAk",
  "Leg 35|https://www.youtube.com/watch?v=FsanVfvUcII",
  "Landmine press em pé|https://www.youtube.com/watch?v=OZedIWKaCTA",
  "Glúteo concha|https://www.youtube.com/watch?v=YXvNbClsjA8",
  "Glúteo 4 apoios perna flexionada|https://www.youtube.com/watch?v=xGWthEoq8KQ",
  "Glúteo estendido cruzado|https://www.youtube.com/watch?v=yZ49_0xjX8k",
  "Leg 45 pés altos|https://www.youtube.com/watch?v=zl0IoxfuEuU",
  "Glúteo 4 apoios perna estendida|https://www.youtube.com/watch?v=6I1vXzcf1zw",
  "Flexão de joelho em pé na polia|https://www.youtube.com/watch?v=HNr9TY1p-4c",
  "Flexão nórdica reversa|https://www.youtube.com/watch?v=IbFv9J4o-gI",
  "Flexão nórdica|https://www.youtube.com/watch?v=Kwj_NznO7rE",
  "Flexão de joelho em pé caneleira|https://www.youtube.com/watch?v=RveboRfM0to",
  "Fly inclinado|https://www.youtube.com/watch?v=ZAOsoTbAk8I",
  "Flexão plantar com elástico|https://www.youtube.com/watch?v=f85OjocSOrA",
  "Flexão de braços ajoelhado|https://www.youtube.com/watch?v=hHHx3AqESik",
  "Flexão de braços|https://www.youtube.com/watch?v=qVq2_0SBVJs",
  "Face Pull|https://www.youtube.com/watch?v=zM43C_-p1EM",
  "Elevação pélvica|https://www.youtube.com/watch?v=-d8elW_SqHQ",
  "Elíptico|https://www.youtube.com/watch?v=CFyy1lOWKh8",
  "Extensora tronco inclinado|https://www.youtube.com/watch?v=WsL3F6GYquw",
  "Extensora unilateral|https://www.youtube.com/watch?v=YlWMKiYvqlE",
  "Estabilização de escápulas no espaldar|https://www.youtube.com/watch?v=dqT6Oc22b-A",
  "Extensão de quadril na polia (Coice)|https://www.youtube.com/watch?v=kvz1Knfhvak",
  "Extensão de quadril na polia perna estendida|https://www.youtube.com/watch?v=lrvcVGDQT0M",
  "Extensora bilateral|https://www.youtube.com/watch?v=sHIFVwfbcLA",
  "Extensão de quadril com elástico|https://www.youtube.com/watch?v=x4T_3o3tLI0",
  "Elevação pélvica unilateral solo|https://www.youtube.com/watch?v=xpdmT6NPmpQ",
  "Elevação pélvica unilateral banco|https://www.youtube.com/watch?v=IDEZ77rdD2E",
  "Elevação pélvica isométrica com abdução|https://www.youtube.com/watch?v=q2P2y7ujpZA",
  "Elevação pélvica com elástico solo|https://www.youtube.com/watch?v=rGVsmsIglRQ",
  "Cross Over|https://www.youtube.com/watch?v=ogzsr19m4rs",
  "Cadeira flexora|https://www.youtube.com/watch?v=3G6G3LXEvUQ",
  "Chop rotacional posição de afundo|https://www.youtube.com/watch?v=9BRs2Gix66s",
  "Caminhada na esteira|https://www.youtube.com/watch?v=HKaG19T6myg",
  "Corda naval bilateral|https://www.youtube.com/watch?v=KJNiABJBMX4",
  "Corrida na esteira|https://www.youtube.com/watch?v=YIRTbVdFty0",
  "Cadeira flexora unilateral|https://www.youtube.com/watch?v=aINWvk_g_t4",
  "Corrida estacionária|https://www.youtube.com/watch?v=pT-ZCJjdYZc",
  "Corda naval alternado|https://www.youtube.com/watch?v=r0XLK4E_yDs",
  "Búlgaro explosivo|https://www.youtube.com/watch?v=3VpZ8YZeZHo",
  "Barra fixa pronada|https://www.youtube.com/watch?v=8JtgV1g2g7k",
  "Avanço|https://www.youtube.com/watch?v=BcOe805l8uk",
  "Búlgaro|https://www.youtube.com/watch?v=DmkCSyzVXJc",
  "Barra fixa supinada|https://www.youtube.com/watch?v=QH64ZHr6lgo",
  "Barra fixa graviton fechada|https://www.youtube.com/watch?v=X1Lc5yWsQHM",
  "Aviãozinho na polia|https://www.youtube.com/watch?v=XguIB3J9pIQ",
  "Barra fixa graviton aberta|https://www.youtube.com/watch?v=YRigeNY1QlY",
  "Bom dia|https://www.youtube.com/watch?v=ezzB_vnG1UE",
  "Bike|https://www.youtube.com/watch?v=rbLBH4CkLoM",
  "Anti rotação acima da cabeça|https://www.youtube.com/watch?v=39WS0Cik--s",
  "Anti rotação posição de afundo|https://www.youtube.com/watch?v=3H4GQd-0f4g",
  "Anti rotação Pallof Press|https://www.youtube.com/watch?v=4nZcepfPtK4",
  "Anti rotação na polia|https://www.youtube.com/watch?v=Br8UrEbZ8nY",
  "Anti rotação acima da cabeça (2)|https://www.youtube.com/watch?v=TBimT5BOQU0",
  "Arremesso|https://www.youtube.com/watch?v=l57W92VD5Sw",
  "Agachamento máquina de costa|https://www.youtube.com/watch?v=1LLU2juoFiU",
  "Agachamento com salto|https://www.youtube.com/watch?v=9YeCZsVHGEU",
  "Agachamento barra hexagonal|https://www.youtube.com/watch?v=Ha-E7AUmjY0",
  "Agachamento isométrico na parede|https://www.youtube.com/watch?v=QUw-vetcQN0",
  "Afundo na barra guiada|https://www.youtube.com/watch?v=_U_sX4bIQEE",
  "Afundo com step|https://www.youtube.com/watch?v=fS7dalFU0qI",
  "Agachamento na barra guiada|https://www.youtube.com/watch?v=h2D7nDY_UNY",
  "Agachamento máquina de frente|https://www.youtube.com/watch?v=rKW0nXteHyY",
  "Agachamento sem carga com elástico|https://www.youtube.com/watch?v=tkmUjqYrwOo",
  "Agachamento insiste|https://www.youtube.com/watch?v=-We7g2bgq0A",
  "Agachamento peso corporal|https://www.youtube.com/watch?v=1enl54eMLGc",
  "Agachamento sumo|https://www.youtube.com/watch?v=1qpgAGYSsyU",
  "Agachamento sumo barra guiada|https://www.youtube.com/watch?v=3CHGWflAgec",
  "Agachamento tripla extensão barra guiada|https://www.youtube.com/watch?v=JyM46ENseoo",
  "Agachamento tripla extensão|https://www.youtube.com/watch?v=eVOHjIlsmUo",
  "Agachamento na polia|https://www.youtube.com/watch?v=eoQsQ-MnG40",
  "Agachamento overhead|https://www.youtube.com/watch?v=ixhShnTJIsY",
  "Agachamento livre|https://www.youtube.com/watch?v=xoGNyB4UQOI",
  "Agachamento frontal anilha|https://www.youtube.com/watch?v=0xPJJLHHiiI",
  "Afundo no step|https://www.youtube.com/watch?v=1aOQUohr-JY",
  "Agachamento afastado com halter|https://www.youtube.com/watch?v=9uhVyihQAH0",
  "Adução na polia|https://www.youtube.com/watch?v=Rdt5S_I4Ao4",
  "Afundo explosivo|https://www.youtube.com/watch?v=Tfe4fqz0UUk",
  "Adutora|https://www.youtube.com/watch?v=eivdSyNGxhs",
  "Afundo|https://www.youtube.com/watch?v=rGcSMLbU4IA",
  "Agachamento com halter|https://www.youtube.com/watch?v=vcJJQZCZn3E",
  "Agachamento taça|https://www.youtube.com/watch?v=wNsszcBSPnQ",
  "Agachamento frontal|https://www.youtube.com/watch?v=z6dmHQOreGE",
  "Afundo no step (2)|https://www.youtube.com/watch?v=SQKu_0b4LYw",
  "Abdutora|https://www.youtube.com/watch?v=Zv6-elri_8c",
  "Abdução de quadril 3 apoios|https://www.youtube.com/watch?v=-3qQYNnaMoI",
  "Abdução de quadril em pé polia|https://www.youtube.com/watch?v=HI7w-Nw_VKY",
  "Abdutora tronco inclinado atrás|https://www.youtube.com/watch?v=UtBtasGfPug",
  "Abdutora tronco inclinado|https://www.youtube.com/watch?v=Z7qSNTjTE7s",
  "Abdução de quadril no solo|https://www.youtube.com/watch?v=bnvOjk76rGE",
  "Abdutora quadril suspenso|https://www.youtube.com/watch?v=dzN_llBOGHo",
  "Abdução de quadril sentado com elástico|https://www.youtube.com/watch?v=oz573L2s6n4",
  "Ativação glúteo médio|https://www.youtube.com/watch?v=I59H2IqzBC8",
];

async function main() {
  console.log(`Inserting batch 3: ${batch3.length} exercises...`);
  let count = 0;
  for (const line of batch3) {
    const [name, url] = line.split('|');
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    try {
      await prisma.exercise.create({
        data: { name: cap, muscleGroup: mg(name), equipment: eq(name), videoUrl: url }
      });
      count++;
    } catch (e) {
      console.log(`Skip: ${cap}`);
    }
  }
  console.log(`Done! ${count} new exercises added.`);
  const total = await prisma.exercise.count();
  console.log(`Total exercises in DB: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
