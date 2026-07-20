// api/chat.js
export default async function handler(req, res) {
    // 设置 CORS 头，允许你的 GitHub Pages 域名访问
    res.setHeader('Access-Control-Allow-Origin', 'https://cyrahou.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
        const { query, conversation_id, user } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Missing query' });
        }

        // 调用 Dify API
        const difyResponse = await fetch(process.env.DIFY_API_URL, {
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

        if (!difyResponse.ok) {
            const errorText = await difyResponse.text();
            console.error('Dify API error:', difyResponse.status, errorText);
            return res.status(difyResponse.status).json({ error: 'Dify API error' });
        }

        const data = await difyResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
