// api/solve.js
export default async function handler(req, res) {
    // Only accept secure POST packets from your application layout
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { questionText } = req.body;
        
        if (!questionText) {
            return res.status(400).json({ error: 'Question parameter cannot be blank' });
        }

        // Pull the completely hidden key from protected platform memory environment
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Server key allocation mapping error.' });
        }

        const structuredPrompt = `You are an expert IIT-JEE exam tutor. Provide a clear, step-by-step, mathematically accurate solution for this question. Keep it concise, professional, and easy to read. Question: ${questionText}`;
        
        // Handshake directly with Google's free Tier 1.5 Flash framework
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: structuredPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponseText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ solution: aiResponseText });
        } else {
            return res.status(500).json({ error: 'Invalid data return layout from structural models.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Execution Gateway Error' });
    }
}