// api/chat.js
export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    const { query, conversation_id, user } = req.body;

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
            user: user || 'anonymous'
        })
    });

    const data = await response.json();
    res.status(200).json(data);
}
