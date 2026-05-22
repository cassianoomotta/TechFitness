// Script to extract video data from YouTube playlist using puppeteer-like approach
// We'll use the YouTube oEmbed and page scraping approach

const fs = require('fs');
const https = require('https');

const PLAYLIST_ID = 'PLNlSsyKAACvFuA8rcf5hXLXQ6GMA0N4zK';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function extractVideos() {
  console.log('Fetching playlist page...');
  const html = await fetchPage(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`);
  
  // Extract ytInitialData JSON from the page
  const match = html.match(/var ytInitialData = (.+?);<\/script>/);
  if (!match) {
    console.log('Could not find ytInitialData, trying alternate pattern...');
    const match2 = html.match(/ytInitialData\s*=\s*(.+?);\s*<\/script>/);
    if (!match2) {
      console.error('Failed to extract data from page');
      // Save raw HTML for debugging
      fs.writeFileSync('scripts/playlist-raw.html', html);
      console.log('Saved raw HTML to scripts/playlist-raw.html');
      return;
    }
  }
  
  const jsonStr = (match || html.match(/ytInitialData\s*=\s*(.+?);\s*<\/script>/))?.[1];
  if (!jsonStr) return;
  
  try {
    const data = JSON.parse(jsonStr);
    const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents?.[0]
      ?.playlistVideoListRenderer?.contents || [];
    
    const videos = contents
      .filter(item => item.playlistVideoRenderer)
      .map(item => {
        const v = item.playlistVideoRenderer;
        return {
          title: v.title?.runs?.[0]?.text || 'Unknown',
          videoId: v.videoId,
          url: `https://www.youtube.com/watch?v=${v.videoId}`
        };
      });
    
    console.log(`Found ${videos.length} videos`);
    
    // Save to JSON file
    fs.writeFileSync('scripts/playlist-videos.json', JSON.stringify(videos, null, 2));
    console.log('Saved to scripts/playlist-videos.json');
    
    // Also generate seed-ready format
    const seedEntries = videos.map(v => {
      const muscleGroup = guessMusleGroup(v.title);
      const equipment = guessEquipment(v.title);
      return {
        name: cleanTitle(v.title),
        muscleGroup,
        equipment,
        description: null,
        videoUrl: v.url
      };
    });
    
    fs.writeFileSync('scripts/playlist-seed-data.json', JSON.stringify(seedEntries, null, 2));
    console.log('Saved seed data to scripts/playlist-seed-data.json');
    
  } catch (e) {
    console.error('JSON parse error:', e.message);
    fs.writeFileSync('scripts/playlist-raw.html', html.substring(0, 50000));
  }
}

function cleanTitle(title) {
  return title
    .replace(/\s*[-|]\s*demonstração.*/i, '')
    .replace(/\s*[-|]\s*execução.*/i, '')
    .replace(/\s*#\w+/g, '')
    .trim();
}

function guessMusleGroup(title) {
  const t = title.toLowerCase();
  if (/peit|supino|crucifixo|cross.*over|peck|fly/i.test(t)) return 'Peito';
  if (/costa|remada|puxad|pulley|serrote|lat.*pull|barra fixa/i.test(t)) return 'Costas';
  if (/perna|agach|leg|extensor|flexor|hack|afundo|stiff|búlgar|cadeira/i.test(t)) return 'Pernas';
  if (/ombro|deltoid|desenvolvimento|elevação lateral|arnold/i.test(t)) return 'Ombros';
  if (/bícep|rosca|trícep|francês|testa|pulley.*corda|martelo/i.test(t)) return 'Braços';
  if (/abdom|prancha|oblíqu|core|crunch|infra/i.test(t)) return 'Core';
  if (/panturr|gêmeo|sóleo|calf/i.test(t)) return 'Pernas';
  if (/glút|elevação pélvica|hip.*thrust/i.test(t)) return 'Pernas';
  if (/trapéz|encolhimento/i.test(t)) return 'Costas';
  if (/antebraço|punho/i.test(t)) return 'Braços';
  if (/cardio|esteira|bicicl|elíptic|along/i.test(t)) return 'Cardio';
  return 'Outros';
}

function guessEquipment(title) {
  const t = title.toLowerCase();
  if (/halter|dumbbell/i.test(t)) return 'Halteres';
  if (/barra|smith/i.test(t)) return 'Barra';
  if (/máquina|aparelho|hack|leg.*press|extensor|flexor|peck|smith/i.test(t)) return 'Máquina';
  if (/polia|cross|pulley|cabo/i.test(t)) return 'Polia';
  if (/peso corporal|flexão|prancha|barra fixa|paralela/i.test(t)) return 'Peso Corporal';
  return 'Outros';
}

extractVideos().catch(console.error);
