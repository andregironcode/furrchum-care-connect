const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify superadmin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No auth header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== 'true') { // Simple check for superadmin localStorage value
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    console.log('🔐 SuperAdmin API: Fetching all transactions...');

    // Use service role to bypass RLS and get all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ SuperAdmin API: Database error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    console.log(`✅ SuperAdmin API: Successfully fetched ${transactions?.length || 0} transactions`);

    // Return the transactions
    res.status(200).json(transactions || []);

  } catch (error) {
    console.error('❌ SuperAdmin API: Unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}; 