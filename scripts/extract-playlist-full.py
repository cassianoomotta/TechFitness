import urllib.request
import re
import json
import os

PLAYLIST_ID = 'PLNlSsyKAACvFuA8rcf5hXLXQ6GMA0N4zK'
url = f"https://www.youtube.com/playlist?list={PLAYLIST_ID}"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def clean_title(title):
    t = title
    t = re.sub(r'\s*[-|]\s*demonstração.*', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*[-|]\s*execução.*', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*#\w+', '', t)
    return t.strip()

def guess_muscle_group(title):
    t = title.lower()
    if any(k in t for k in ['peit', 'supino', 'crucifixo', 'cross', 'peck', 'fly', 'voador']):
        return 'Peito'
    if any(k in t for k in ['costa', 'remada', 'puxad', 'pulley', 'pulley', 'serrote', 'lat pull', 'barra fixa', 'escapula', 'cavalinho', 'trapéz', 'encolhimento']):
        return 'Costas'
    if any(k in t for k in ['perna', 'agach', 'leg', 'extensor', 'flexor', 'hack', 'afundo', 'stiff', 'búlgar', 'cadeira', 'mesa', 'flexão plantar', 'panturr', 'gêmeo', 'sóleo', 'calf', 'tibial', 'adutor', 'abdutor', 'abdução', 'adução', 'glút', 'coice', 'concha', 'sissy', 'bom dia', 'passada', 'terra sum']):
        return 'Pernas'
    if any(k in t for k in ['ombro', 'deltoid', 'desenvolvimento', 'elevação lateral', 'arnold', 'elevação frontal', 'face pull', 'landmine press', 'thruster']):
        return 'Ombros'
    if any(k in t for k in ['bícep', 'rosca', 'trícep', 'francês', 'testa', 'martelo', 'punho', 'antebraço', 'spider', 'scott']):
        return 'Braços'
    if any(k in t for k in ['abdom', 'prancha', 'oblíqu', 'core', 'crunch', 'infra', 'canivete', 'giro russo', 'canoa', 'bicicleta', 'anti rotação', 'chop', 'arremesso']):
        return 'Core'
    if any(k in t for k in ['along', 'mobilidade', 'liberação', 'ativação', 'flexão quad', 'elevação y', 'caranguejo']):
        return 'Mobilidade'
    if any(k in t for k in ['cardio', 'esteira', 'bicicl', 'elíptic', 'bike', 'corrida', 'caminhada', 'corda', 'polichinelo', 'salto', 'kipping']):
        return 'Cardio'
    return 'Outros'

def guess_equipment(title):
    t = title.lower()
    if any(k in t for k in ['halter', 'dumbbell', 'dumbell']):
        return 'Halteres'
    if any(k in t for k in ['barra', 'smith', 'landmine']):
        return 'Barra'
    if any(k in t for k in ['máquina', 'aparelho', 'hack', 'leg', 'extensora', 'flexora', 'cadeira', 'mesa', 'articulad', 'graviton', 'adutora', 'abdutora']):
        return 'Máquina'
    if any(k in t for k in ['polia', 'cross', 'pulley', 'cabo', 'corda']):
        return 'Polia'
    if any(k in t for k in ['elástico', 'fita', 'faixa']):
        return 'Elástico'
    if any(k in t for k in ['anilha']):
        return 'Anilha'
    if any(k in t for k in ['caneleira']):
        return 'Caneleira'
    if any(k in t for k in ['step']):
        return 'Step'
    if any(k in t for k in ['kettlebell', 'giri']):
        return 'Kettlebell'
    return 'Peso Corporal'

def run():
    print("Fetching playlist page...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print("Failed to fetch playlist page:", e)
        return

    # Extract API key
    key_match = re.search(r'"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"', html)
    api_key = key_match.group(1) if key_match else None
    if not api_key:
        print("API Key not found in HTML!")
        return
    print("API Key:", api_key)

    # Extract ytInitialData
    data_match = re.search(r'var ytInitialData\s*=\s*(.+?);</script>', html) or re.search(r'ytInitialData\s*=\s*(.+?);\s*</script>', html)
    if not data_match:
        print("Could not find ytInitialData in HTML!")
        return

    data = json.loads(data_match.group(1))
    
    # Traverse to get first page videos and continuation token
    try:
        contents = data['contents']['twoColumnBrowseResultsRenderer']['tabs'][0]['tabRenderer']['content']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'][0]['playlistVideoListRenderer']['contents']
    except Exception as e:
        print("Failed to traverse ytInitialData:", e)
        return

    videos = []
    continuation_token = None

    def process_items(items):
        nonlocal continuation_token
        continuation_token = None
        for item in items:
            if 'playlistVideoRenderer' in item:
                v = item['playlistVideoRenderer']
                title = v.get('title', {}).get('runs', [{}])[0].get('text', 'Unknown')
                video_id = v.get('videoId')
                if video_id:
                    videos.append({
                        'title': title,
                        'videoId': video_id,
                        'url': f"https://www.youtube.com/watch?v={video_id}"
                    })
            elif 'continuationItemRenderer' in item:
                # Extract token
                commands = item['continuationItemRenderer'].get('continuationEndpoint', {}).get('commandExecutorCommand', {}).get('commands', [])
                for cmd in commands:
                    if 'continuationCommand' in cmd:
                        continuation_token = cmd['continuationCommand'].get('token')
                        break

    process_items(contents)
    print(f"Loaded page 1: found {len(videos)} videos. Next token: {bool(continuation_token)}")

    # Paginate using InnerTube API
    page = 1
    while continuation_token:
        page += 1
        print(f"Fetching page {page}...")
        post_url = f"https://www.youtube.com/youtubei/v1/browse?key={api_key}"
        post_data = {
            "context": {
                "client": {
                    "clientName": "WEB",
                    "clientVersion": "2.20240101.01.00"
                }
            },
            "continuation": continuation_token
        }
        
        post_headers = {
            'Content-Type': 'application/json',
            'User-Agent': headers['User-Agent']
        }
        
        req_post = urllib.request.Request(
            post_url, 
            data=json.dumps(post_data).encode('utf-8'), 
            headers=post_headers,
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req_post) as post_response:
                res_data = json.loads(post_response.read().decode('utf-8'))
                
            if 'onResponseReceivedActions' in res_data:
                actions = res_data['onResponseReceivedActions']
                if actions and 'appendContinuationItemsAction' in actions[0]:
                    items = actions[0]['appendContinuationItemsAction'].get('continuationItems', [])
                    prev_len = len(videos)
                    process_items(items)
                    print(f"Loaded page {page}: added {len(videos) - prev_len} videos. Next token: {bool(continuation_token)}")
                else:
                    print("Continuation items not found in response actions")
                    break
            else:
                print("onResponseReceivedActions not in response")
                break
        except Exception as e:
            print(f"Error loading page {page}: {e}")
            break

    print(f"Extraction finished. Total videos found: {len(videos)}")

    # Save raw video list
    os.makedirs('scripts', exist_ok=True)
    with open('scripts/playlist-videos.json', 'w', encoding='utf-8') as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)
    print("Saved raw list to scripts/playlist-videos.json")

    # Generate seed data
    seed_data = []
    seen_names = set()
    for v in videos:
        cleaned_name = clean_title(v['title'])
        # Capitalize first letter of each word
        capitalized = cleaned_name.title()
        
        # Avoid duplicate names
        if capitalized.lower().strip() in seen_names:
            continue
        seen_names.add(capitalized.lower().strip())

        muscle_group = guess_muscle_group(cleaned_name)
        equipment = guess_equipment(cleaned_name)

        seed_data.append({
            'name': capitalized,
            'muscleGroup': muscle_group,
            'equipment': equipment,
            'description': None,
            'videoUrl': v['url']
        })

    with open('scripts/playlist-seed-data.json', 'w', encoding='utf-8') as f:
        json.dump(seed_data, f, indent=2, ensure_ascii=False)
    print(f"Saved seed data list with {len(seed_data)} unique items to scripts/playlist-seed-data.json")

if __name__ == '__main__':
    run()
