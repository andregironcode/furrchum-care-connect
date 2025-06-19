import { createClient } from '@supabase/supabase-js';

// Script to check user-specific transaction issues
async function checkUserTransactions() {
  console.log('🔍 Checking User Transaction Issues...\n');

  const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all transactions (no filtering)
    console.log('📊 1. All Transactions in Database:');
    const { data: allTransactions, error: allError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all transactions:', allError);
      return;
    }

    console.log(`Found ${allTransactions?.length || 0} total transactions`);
    if (allTransactions && allTransactions.length > 0) {
      allTransactions.forEach((t, index) => {
        console.log(`Transaction ${index + 1}:`);
        console.log(`  - ID: ${t.id}`);
        console.log(`  - Pet Owner ID: ${t.pet_owner_id || 'NULL'}`);
        console.log(`  - Amount: ₹${t.amount}`);
        console.log(`  - Status: ${t.status}`);
        console.log(`  - Provider Order ID: ${t.provider_order_id}`);
        console.log(`  - Payment ID: ${t.provider_payment_id || 'NULL'}`);
        console.log(`  - Created: ${t.created_at}`);
        console.log('  ---');
      });
    }
    console.log('');

    // 2. Get all users to see who owns what
    console.log('👥 2. All Users in Database:');
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`Found ${allUsers?.length || 0} users`);
      if (allUsers && allUsers.length > 0) {
        allUsers.forEach((u, index) => {
          console.log(`User ${index + 1}: ${u.full_name} (${u.email}) - Type: ${u.user_type} - ID: ${u.id}`);
        });
      }
    }
    console.log('');

    // 3. Check if transactions have matching user IDs
    console.log('🔗 3. Transaction-User Matching:');
    if (allTransactions && allUsers) {
      allTransactions.forEach((transaction) => {
        const matchingUser = allUsers.find(u => u.id === transaction.pet_owner_id);
        console.log(`Transaction ${transaction.id.substring(0, 8)}...:`);
        console.log(`  - Pet Owner ID: ${transaction.pet_owner_id || 'NULL'}`);
        console.log(`  - Matching User: ${matchingUser ? `${matchingUser.full_name} (${matchingUser.email})` : 'NO MATCH'}`);
        console.log(`  - Status: ${transaction.status}`);
        console.log('  ---');
      });
    }
    console.log('');

    // 4. Check for "completed" vs "success" status issue
    console.log('📈 4. Status Analysis:');
    if (allTransactions) {
      const statusCounts = allTransactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} transactions`);
      });
      
      console.log('\nNote: Pet owners might only see "completed" or "success" status transactions');
      const visibleStatuses = allTransactions.filter(t => t.status === 'completed' || t.status === 'success');
      console.log(`Transactions visible to pet owners: ${visibleStatuses.length}`);
    }
    console.log('');

    // 5. Check recent payment flow
    console.log('🕐 5. Recent Activity (last 24 hours):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentActivity, error: recentError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Error fetching recent activity:', recentError);
    } else {
      console.log(`Recent transactions: ${recentActivity?.length || 0}`);
      if (recentActivity && recentActivity.length > 0) {
        recentActivity.forEach((t) => {
          console.log(`  - ${t.created_at}: ₹${t.amount} (${t.status}) - Order: ${t.provider_order_id}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🔍 Analysis completed');
}

checkUserTransactions().catch(console.error); 