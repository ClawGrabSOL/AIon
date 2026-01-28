const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // API route
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'API key not configured' }));
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 200,
            temperature: 0.9
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('OpenAI error:', data);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'AI request failed' }));
        }

        const botResponse = data.choices?.[0]?.message?.content || 'no response';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: botResponse }));

      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🤖 AIon running at http://localhost:${PORT}\n`);
});
