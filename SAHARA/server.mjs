import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };

function body(request) {
  return new Promise((resolve, reject) => {
    let value = '';
    request.on('data', chunk => { value += chunk; if (value.length > 8_000_000) reject(new Error('Image is too large.')); });
    request.on('end', () => resolve(JSON.parse(value || '{}')));
    request.on('error', reject);
  });
}

async function analyzeVision(request, response) {
  if (!process.env.OPENAI_API_KEY) throw new Error('Add OPENAI_API_KEY before using live AI vision. The demo result still works.');
  const { image, language = 'EN' } = await body(request);
  if (!image?.startsWith('data:image/')) throw new Error('Please capture an image first.');
  const instruction = language === 'UR'
    ? 'Urdu mein mukhtasar aur wazeh jawab dein. Aham maloomat par tasdeeq ka mashwara dein.'
    : 'Give a short, clear accessibility-focused description. Read visible text if possible. For medication, money, hazards, or navigation, ask the user to verify before acting.';
  const apiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model:'gpt-5.6', reasoning:{effort:'low'}, input:[{ role:'user', content:[{type:'input_text',text:instruction},{type:'input_image',image_url:image}] }] })
  });
  const data = await apiResponse.json();
  if (!apiResponse.ok) throw new Error(data?.error?.message || 'The AI request failed.');
  const answer = data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
  if (!answer) throw new Error('SAHARA did not receive a usable answer.');
  response.writeHead(200, {'Content-Type':'application/json'}); response.end(JSON.stringify({answer}));
}

createServer(async (request, response) => {
  try {
    if (request.method === 'POST' && request.url === '/api/vision') return await analyzeVision(request, response);
    const requested = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
    const file = normalize(join(root, requested));
    if (!file.startsWith(root)) throw new Error('Not found');
    const content = await readFile(file);
    response.writeHead(200, {'Content-Type':mime[extname(file)] || 'application/octet-stream'}); response.end(content);
  } catch (error) {
    response.writeHead(error.message === 'Not found' ? 404 : 500, {'Content-Type':'application/json'});
    response.end(JSON.stringify({error:error.message || 'Unexpected server error'}));
  }
}).listen(port, () => console.log(`SAHARA is ready at http://localhost:${port}`));
