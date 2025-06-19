import { createClient } from '@supabase/supabase-js';

// Test script to debug transaction recording issues
async function debugTransactions() {
  console.log('🔍 Starting Transaction Debug Script...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  console.log('Environment Check:');
  console.log('- Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('- Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
  console.log('- URL Value:', supabaseUrl);
  console.log('- Service Key (first 20 chars):', supabaseServiceKey ? supabaseServiceKey.substring(0, 20) : 'NONE');
  console.log('');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration');
    return;
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized\n');

    // Test 1: Check if transactions table exists and is accessible
    console.log('🧪 Test 1: Check transactions table accessibility...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing transactions table:', tableError);
      return;
    } else {
      console.log('✅ Transactions table accessible');
    }
    console.log('');

    // Test 2: Try to fetch existing transactions
    console.log('🧪 Test 2: Fetch existing transactions...');
    const { data: existingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching transactions:', fetchError);
    } else {
      console.log('✅ Successfully fetched transactions');
      console.log('Number of transactions found:', existingTransactions?.length || 0);
      if (existingTransactions && existingTransactions.length > 0) {
        console.log('Sample transaction:', JSON.stringify(existingTransactions[0], null, 2));
      }
    }
    console.log('');

    // Test 3: Try to insert a test transaction
    console.log('🧪 Test 3: Insert test transaction...');
    const testTransaction = {
      amount: 100.00,
      currency: 'INR',
      status: 'pending',
      payment_method: 'razorpay',
      description: 'Test transaction for debugging',
      provider: 'razorpay',
      provider_order_id: 'test_order_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Test transaction data:', JSON.stringify(testTransaction, null, 2));

    const { data: insertResult, error: insertError } = await supabase
      .from('transactions')
      .insert([testTransaction])
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Error inserting test transaction:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Test transaction inserted successfully!');
      console.log('Inserted transaction:', JSON.stringify(insertResult, null, 2));
      
      // Clean up: Delete the test transaction
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', insertResult.id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test transaction:', deleteError);
      } else {
        console.log('✅ Test transaction cleaned up');
      }
    }
    console.log('');

    // Test 4: Check RLS policies
    console.log('🧪 Test 4: Test with different user contexts...');
    
    // Try with anon key to see if RLS is blocking
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (anonKey) {
      const anonSupabase = createClient(supabaseUrl, anonKey);
      
      const { data: anonData, error: anonError } = await anonSupabase
        .from('transactions')
        .select('id')
        .limit(1);
        
      if (anonError) {
        console.log('❌ Anon user cannot access transactions:', anonError.message);
      } else {
        console.log('✅ Anon user can access transactions');
      }
    } else {
      console.log('⚠️ No anon key available for testing');
    }
    console.log('');

    // Test 5: Check if there are any pending/recent transactions
    console.log('🧪 Test 5: Check for recent transactions...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentTransactions, error: recentError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Error fetching recent transactions:', recentError);
    } else {
      console.log('✅ Recent transactions check complete');
      console.log('Recent transactions found:', recentTransactions?.length || 0);
      if (recentTransactions && recentTransactions.length > 0) {
        console.log('Most recent transaction:');
        console.log(JSON.stringify(recentTransactions[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('Error stack:', error.stack);
  }

  console.log('\n🔍 Debug script completed');
}

// Run the debug script
debugTransactions().catch(console.error); 