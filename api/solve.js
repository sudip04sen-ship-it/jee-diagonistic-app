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

        const structuredPrompt = `You are an expert IIT-JEE exam tutor. Provide a clear, step-by-step, mathematically accurate solution for this question. Keep it concise, professional, and easy to read. 

CRITICAL INSTRUCTIONS:
- NEVER use dollar signs ($ or $$) anywhere. Use plain numbers.
- NEVER use LaTeX math notation or codes like \\boxed{...}, \\frac{...}, or \\cdot.
- Use basic keyboard symbols only (e.g., +, -, =, /, *). For fractions, use simple text layouts like (x/y).
- Format final answers simply as: "The final answer is: 2" without any boxes or brackets.

Question: ${questionText}`;
        
        // Handshake directly with Google's active stable endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: structuredPrompt }] }]
            }),
            // Forces Vercel to bypass stale edge-network caching for this functional module
            cache: "no-store" 
        });

        // Parse the incoming JSON payload string into data object structures
        const data = await response.json();
        let aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiResponseText) {
            // 🔥 FAIL-SAFE SHIELD: Strip out any accidental LaTeX formatting if the AI slips up
            aiResponseText = aiResponseText
                .replace(/\$\$/g, '')               // Removes double dollar signs ($$)
                .replace(/\$/g, '')                 // Removes single dollar signs ($)
                .replace(/\\boxed\{([\s\S]*?)\}/g, '$1') // Changes \boxed{2} into just 2
                .replace(/\\mathbf\{([\s\S]*?)\}/g, '$1') // Cleans up bold text blocks
                .replace(/\\text\{([\s\S]*?)\}/g, '$1');   // Cleans up raw text blocks

            return res.status(200).json({ solution: aiResponseText });
        } else {
            console.error("Gemini API structural layout mismatch. Raw data received:", JSON.stringify(data));
            const googleError = data?.error?.message || 'Invalid data return layout from structural models.';
            return res.status(500).json({ error: googleError });
        }

    } catch (error) {
        console.error("Execution Catch Block Error:", error);
        return res.status(500).json({ error: 'Internal Server Execution Gateway Error' });
    }
}