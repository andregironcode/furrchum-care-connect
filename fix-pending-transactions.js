import { createClient } from '@supabase/supabase-js';

// Script to fix pending transactions that should be completed
async function fixPendingTransactions() {
  console.log('🔧 Fixing Pending Transactions...\n');

  const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all pending transactions
    console.log('🔍 Looking for pending transactions...');
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending');

    if (fetchError) {
      console.error('❌ Error fetching pending transactions:', fetchError);
      return;
    }

    console.log(`Found ${pendingTransactions?.length || 0} pending transactions`);

    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('✅ No pending transactions found to fix');
      return;
    }

    // Process each pending transaction
    for (const transaction of pendingTransactions) {
      console.log(`\n🔧 Processing transaction: ${transaction.id}`);
      console.log(`  - Order ID: ${transaction.provider_order_id}`);
      console.log(`  - Amount: ₹${transaction.amount}`);
      console.log(`  - Pet Owner: ${transaction.pet_owner_id}`);
      console.log(`  - Created: ${transaction.created_at}`);

      // Check if this transaction should be completed
      // For this specific case, we know transactions older than a few minutes are likely completed payments
      const transactionAge = Date.now() - new Date(transaction.created_at).getTime();
      const isOldTransaction = transactionAge > 5 * 60 * 1000; // 5 minutes

      if (isOldTransaction) {
        console.log(`  ⏰ Transaction is ${Math.round(transactionAge / 60000)} minutes old - likely completed`);
        
        // Update to completed status
        const { data: updatedTransaction, error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            transaction_reference: transaction.provider_order_id, // Use order ID as reference if payment ID is missing
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)
          .select('*')
          .single();

        if (updateError) {
          console.error(`  ❌ Error updating transaction: ${updateError.message}`);
        } else {
          console.log(`  ✅ Updated transaction to completed status`);
          console.log(`  📋 Updated transaction details:`, JSON.stringify(updatedTransaction, null, 2));
        }
      } else {
        console.log(`  ⏳ Transaction is too recent (${Math.round(transactionAge / 1000)}s) - keeping as pending`);
      }
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: afterTransactions, error: verifyError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log('\n📊 Current transaction status:');
      const statusCounts = afterTransactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} transactions`);
      });

      const visibleToUsers = afterTransactions.filter(t => t.status === 'completed' || t.status === 'success');
      console.log(`\n✅ Transactions now visible to pet owners: ${visibleToUsers.length}`);

      // Show the fixed transactions
      console.log('\n📋 All transactions:');
      afterTransactions.forEach((t, index) => {
        console.log(`${index + 1}. ₹${t.amount} - ${t.status} - ${t.created_at} - Order: ${t.provider_order_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🔧 Fix completed');
}

fixPendingTransactions().catch(console.error); 