import { createClient } from '@supabase/supabase-js';

// Fix duplicate transactions by removing pending ones that have completed counterparts
async function fixDuplicateTransactions() {
  console.log('🔧 Fixing Duplicate Transactions...\n');

  const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all transactions
    const { data: allTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching transactions:', fetchError);
      return;
    }

    console.log(`Found ${allTransactions?.length || 0} total transactions`);

    // Group transactions by amount and pet_owner_id to find duplicates
    const duplicateGroups = {};
    
    allTransactions?.forEach(transaction => {
      const key = `${transaction.amount}_${transaction.pet_owner_id}`;
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(transaction);
    });

    // Find groups with both pending and completed transactions
    const groupsToFix = Object.entries(duplicateGroups).filter(([key, transactions]) => {
      const hasPending = transactions.some(t => t.status === 'pending');
      const hasCompleted = transactions.some(t => t.status === 'completed');
      return hasPending && hasCompleted && transactions.length > 1;
    });

    console.log(`Found ${groupsToFix.length} duplicate groups to fix`);

    for (const [key, transactions] of groupsToFix) {
      console.log(`\n🔧 Fixing duplicate group: ${key}`);
      
      const pendingTransactions = transactions.filter(t => t.status === 'pending');
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      
      console.log(`  - ${pendingTransactions.length} pending transactions`);
      console.log(`  - ${completedTransactions.length} completed transactions`);
      
      // Remove the pending transactions since we have completed ones
      for (const pendingTx of pendingTransactions) {
        console.log(`  🗑️ Removing pending transaction: ${pendingTx.id}`);
        
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', pendingTx.id);
        
        if (deleteError) {
          console.error(`  ❌ Error deleting transaction ${pendingTx.id}:`, deleteError);
        } else {
          console.log(`  ✅ Deleted pending transaction ${pendingTx.id}`);
        }
      }
    }

    // Verify the cleanup
    console.log('\n📊 Verification after cleanup:');
    const { data: finalTransactions, error: finalError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`Total transactions after cleanup: ${finalTransactions?.length || 0}`);
      
      const statusCounts = finalTransactions?.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}) || {};
      
      console.log('Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} transactions`);
      });

      console.log('\nRemaining transactions:');
      finalTransactions?.forEach((transaction, index) => {
        console.log(`${index + 1}. ₹${transaction.amount} - ${transaction.status} - ${transaction.created_at}`);
        console.log(`   Pet Owner: ${transaction.pet_owner_id?.substring(0, 8)}...`);
        console.log(`   Vet: ${transaction.vet_id?.substring(0, 8)}...`);
        console.log(`   Order: ${transaction.provider_order_id}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🔧 Duplicate transaction cleanup completed');
}

fixDuplicateTransactions().catch(console.error); 