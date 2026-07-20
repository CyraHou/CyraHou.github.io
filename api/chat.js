export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://cyrahou.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { query } = body || {};
    if (!query) return res.status(400).json({ error: 'Missing query' });

    try {
        const response = await fetch(process.env.DIFY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DIFY_API_KEY}`
            },
            body: JSON.stringify({
                inputs: {},
                query,
                response_mode: 'blocking',
                user: 'visitor'
            })
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return res.status(response.status).json({
                error: 'Dify returned non-JSON',
                status: response.status,
                rawResponsePreview: text.substring(0, 500),
                urlUsed: process.env.DIFY_API_URL,
                keyPrefix: process.env.DIFY_API_KEY?.substring(0, 10) + '...'
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Dify API error', details: data });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
