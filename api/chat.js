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

    try {
        const { query, conversation_id, user } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Missing query' });
        }

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

        if (!response.ok) {
            const err = await response.text();
            console.error('Dify error:', response.status, err);
            return res.status(response.status).json({ error: 'Dify API error' });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
