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
        
        // Handshake directly with Google's active stable endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: structuredPrompt }] }]
            })
        });

        // Parse the incoming JSON payload string into data object structures
        const data = await response.json();

        // Safely extract the text using optional chaining (?.) to prevent crashes
        const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiResponseText) {
            return res.status(200).json({ solution: aiResponseText });
        } else {
            // Print the raw layout from Google into your Vercel system logs for live inspection
            console.error("Gemini API structural layout mismatch. Raw data received:", JSON.stringify(data));
            
            // Extract the deep system error text if Google passed an explicit fault flag
            const googleError = data?.error?.message || 'Invalid data return layout from structural models.';
            return res.status(500).json({ error: googleError });
        }

    } catch (error) {
        console.error("Execution Catch Block Error:", error);
        return res.status(500).json({ error: 'Internal Server Execution Gateway Error' });
    }
}