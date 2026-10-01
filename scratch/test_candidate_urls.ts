async function testUrls() {
  const candidates = [
    { name: 'Desenvolvimento na máquina articulada', gif: 'videos/0869-vqsbmL0.gif', alt: 'videos/2318-dNFYIU1.gif' },
    { name: 'Rosca unilateral na polia', gif: 'videos/0190-YTur5nR.gif' },
    { name: 'Abdutora', gif: 'videos/0597-CHpahtl.gif' },
    { name: 'Rosca direta na polia barra reta', gif: 'videos/0868-G08RZcQ.gif' },
    { name: 'Leg press 180', gif: 'videos/2611-9KU9TYF.gif' },
  ];

  console.log('--- TESTANDO URLS DOS GIFS NA RAW GITHUB ---');
  for (const c of candidates) {
    const url = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${c.gif}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`[${res.status}] ${c.name} -> ${c.gif} (${res.headers.get('content-length')} bytes, ${res.headers.get('content-type')})`);
    } catch (err: any) {
      console.error(`Erro ao testar ${url}:`, err.message);
    }
  }
}

testUrls();
