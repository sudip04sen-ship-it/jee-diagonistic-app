export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { username, totalXP } = req.body;
        if (!username || totalXP === undefined) {
            return res.status(400).json({ error: 'Missing username or score parameters' });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // 🔥 FIX: Added 'on_conflict=username' query param and 'resolution=merge-duplicates' header
        // This stops duplication forever!
        const response = await fetch(`${supabaseUrl}/rest/v1/leaderboard?on_conflict=username`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'resolution=merge-duplicates,return=minimal' 
            },
            body: JSON.stringify({ username: username, total_xp: parseInt(totalXP, 10) })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Supabase error detail:", errText);
            throw new Error('Database write rejected');
        }

        return res.status(200).json({ success: true, message: 'Global score updated cleanly!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database pipeline transaction error' });
    }
}