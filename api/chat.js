// api/chat.js
export default async function handler(req, res) {
    // ---------- 1. 处理 CORS 预检请求（OPTIONS） ----------
    // 浏览器在发送正式请求前，会先发一个 OPTIONS 请求询问服务器是否允许跨域
    if (req.method === 'OPTIONS') {
        // 返回允许的域名、方法、请求头
        res.setHeader('Access-Control-Allow-Origin', 'https://cyrahou.github.io');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end(); // 预检请求直接结束，不执行后续逻辑
    }

    // ---------- 2. 只允许 POST 请求（原有逻辑） ----------
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    // 获取前端传来的参数
    const { query, conversation_id, user } = req.body;

    // ---------- 3. 调用 Dify 的 API（原有逻辑） ----------
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

    // ---------- 4. 返回响应时，加上允许跨域的响应头 ----------
    // 必须让浏览器知道这个响应允许来自你的 GitHub Pages 页面访问
    res.setHeader('Access-Control-Allow-Origin', 'https://cyrahou.github.io');
    // 如果你以后想开放给所有域名（仅测试用），可以用 '*', 但生产环境建议写具体域名
    // res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json(data);
}
