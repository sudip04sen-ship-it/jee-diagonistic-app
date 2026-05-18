export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Query Supabase: Sort descending by total_xp, limit results to top 10 rows
        const response = await fetch(`${supabaseUrl}/rest/v1/leaderboard?select=username,total_xp&order=total_xp.desc&limit=10`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) throw new Error('Database read rejected');
        const data = await response.json();

        return res.status(200).json({ ranks: data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database readout transactional failure' });
    }
}