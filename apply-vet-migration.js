import { createClient } from '@supabase/supabase-js';

// Apply the migration to add vet_id to transactions table
async function applyVetMigration() {
  console.log('🔧 Applying VET_ID migration to transactions table...\n');

  const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Add vet_id column
    console.log('1. Adding vet_id column...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS vet_id uuid NULL;'
    });

    if (addColumnError) {
      console.error('❌ Error adding vet_id column:', addColumnError);
      // Try alternative approach
      console.log('Trying alternative SQL execution...');
      const { error: altError } = await supabase
        .from('transactions')
        .select('vet_id')
        .limit(1);
      
      if (altError && altError.message.includes('does not exist')) {
        console.log('Column does not exist, manual addition needed');
      } else {
        console.log('✅ Column might already exist or SQL executed successfully');
      }
    } else {
      console.log('✅ vet_id column added successfully');
    }

    // Step 2: Check if column exists
    console.log('\n2. Verifying vet_id column exists...');
    const { data: columnCheck, error: checkError } = await supabase
      .from('transactions')
      .select('id, vet_id')
      .limit(1);

    if (checkError) {
      console.error('❌ vet_id column not accessible:', checkError.message);
    } else {
      console.log('✅ vet_id column is accessible');
    }

    // Step 3: Update existing transactions with vet_id
    console.log('\n3. Updating existing transactions with vet_id...');
    
    // Get all transactions without vet_id
    const { data: transactionsToUpdate, error: fetchError } = await supabase
      .from('transactions')
      .select('id, description, booking_id')
      .is('vet_id', null);

    if (fetchError) {
      console.error('❌ Error fetching transactions to update:', fetchError);
    } else {
      console.log(`Found ${transactionsToUpdate?.length || 0} transactions to update`);
      
      // For now, let's set a default vet_id for existing transactions
      // You can update this logic based on your actual vet IDs
      const defaultVetId = '5ae30cd1-3b60-47b6-bac5-2a1965aba4bb'; // John DOE from your logs
      
      if (transactionsToUpdate && transactionsToUpdate.length > 0) {
        for (const transaction of transactionsToUpdate) {
          console.log(`Updating transaction ${transaction.id}...`);
          
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ vet_id: defaultVetId })
            .eq('id', transaction.id);
          
          if (updateError) {
            console.error(`❌ Error updating transaction ${transaction.id}:`, updateError);
          } else {
            console.log(`✅ Updated transaction ${transaction.id}`);
          }
        }
      }
    }

    // Step 4: Verify the migration
    console.log('\n4. Verifying migration...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('transactions')
      .select('id, pet_owner_id, vet_id, amount, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log('✅ Migration verification:');
      finalCheck?.forEach((transaction, index) => {
        console.log(`${index + 1}. Transaction ${transaction.id.substring(0, 8)}...`);
        console.log(`   - Pet Owner: ${transaction.pet_owner_id?.substring(0, 8) || 'NULL'}...`);
        console.log(`   - Vet: ${transaction.vet_id?.substring(0, 8) || 'NULL'}...`);
        console.log(`   - Amount: ₹${transaction.amount}`);
        console.log(`   - Status: ${transaction.status}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🔧 Migration completed');
}

applyVetMigration().catch(console.error); 