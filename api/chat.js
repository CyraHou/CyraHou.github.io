export default async function handler(req, res) {
    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', 'https://cyrahou.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    // 尝试解析请求体
    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { query, conversation_id, user } = body || {};

    if (!query) {
        return res.status(400).json({ error: 'Missing query', receivedBody: body });
    }

    // 检查环境变量是否存在
    if (!process.env.DIFY_API_KEY) {
        return res.status(500).json({ error: 'DIFY_API_KEY not set' });
    }
    if (!process.env.DIFY_API_URL) {
        return res.status(500).json({ error: 'DIFY_API_URL not set' });
    }

    try {
        const response = await fetch(process.env.DIFY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DIFY_API_KEY}`
            },
            body: JSON.stringify({
                inputs: {},
                query: query,
                response_mode: 'blocking',
                conversation_id: conversation_id || '',
                user: user || 'visitor'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Dify error:', response.status, data);
            return res.status(response.status).json({ error: 'Dify API error', details: data });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
