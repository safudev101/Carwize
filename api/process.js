// Vercel Serverless Function to hide API Key
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, inlineDataList } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured in Vercel Dashboard' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }, ...inlineDataList.map(d => ({ inlineData: d }))] }],
                generationConfig: { responseModalities: ["IMAGE"] }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'Gemini API Error');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
