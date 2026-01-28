module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
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

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI error:', error);
      return res.status(500).json({ error: 'AI request failed' });
    }

    const data = await response.json();
    const botResponse = data.choices?.[0]?.message?.content || 'no response';

    return res.status(200).json({ response: botResponse });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
