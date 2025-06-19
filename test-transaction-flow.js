import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Test the transaction creation flow
async function testTransactionFlow() {
  console.log('🧪 Testing Transaction Creation Flow...\n');

  const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

  try {
    // 1. Test direct Supabase connection
    console.log('🔗 1. Testing Direct Supabase Connection...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testTransaction = {
      amount: 500.00,
      currency: 'INR',
      status: 'pending',
      payment_method: 'razorpay',
      description: 'Test transaction flow debugging',
      provider: 'razorpay',
      provider_order_id: 'test_flow_' + Date.now(),
      pet_owner_id: '7bb8ff94-3464-4d3b-891b-98fa0d5a3878', // Andre Giron's ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: directInsert, error: directError } = await supabase
      .from('transactions')
      .insert([testTransaction])
      .select('*')
      .single();

    if (directError) {
      console.error('❌ Direct Supabase insert failed:', directError);
    } else {
      console.log('✅ Direct Supabase insert successful');
      console.log('Inserted transaction ID:', directInsert.id);
      
      // Clean up
      await supabase.from('transactions').delete().eq('id', directInsert.id);
      console.log('✅ Test transaction cleaned up');
    }
    console.log('');

    // 2. Test server endpoints
    console.log('🌐 2. Testing Server Endpoints...');
    
    // Test health endpoint
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Server health check passed:', healthData.status);
      } else {
        console.log('❌ Server health check failed:', healthResponse.status);
      }
    } catch (healthError) {
      console.log('❌ Cannot reach server at localhost:3001:', healthError.message);
    }

    // Test create-checkout-session endpoint
    try {
      console.log('🧪 Testing create-checkout-session endpoint...');
      const checkoutPayload = {
        amount: 500,
        bookingId: 'temp_test_' + Date.now(),
        petOwnerId: '7bb8ff94-3464-4d3b-891b-98fa0d5a3878',
        bookingData: {
          vetName: 'Test Vet',
          consultation_type: 'online'
        }
      };

      const checkoutResponse = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutPayload)
      });

      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();
        console.log('✅ Create checkout session successful');
        console.log('Order ID:', checkoutData.orderId);
        
        // Now check if a pending transaction was created
        const { data: pendingTx, error: pendingError } = await supabase
          .from('transactions')
          .select('*')
          .eq('provider_order_id', checkoutData.orderId);

        if (pendingError) {
          console.error('❌ Error checking for pending transaction:', pendingError);
        } else if (pendingTx && pendingTx.length > 0) {
          console.log('✅ Pending transaction created successfully:', pendingTx[0].id);
          // Clean up
          await supabase.from('transactions').delete().eq('id', pendingTx[0].id);
          console.log('✅ Test pending transaction cleaned up');
        } else {
          console.log('❌ No pending transaction found after checkout session creation');
        }
      } else {
        const errorText = await checkoutResponse.text();
        console.log('❌ Create checkout session failed:', checkoutResponse.status, errorText);
      }
    } catch (checkoutError) {
      console.log('❌ Checkout endpoint error:', checkoutError.message);
    }
    console.log('');

    // 3. Check recent transactions again
    console.log('📊 3. Final Transaction Check...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalError) {
      console.error('❌ Error in final check:', finalError);
    } else {
      console.log(`Current total transactions: ${finalCheck?.length || 0}`);
      if (finalCheck && finalCheck.length > 0) {
        console.log('Most recent transactions:');
        finalCheck.slice(0, 3).forEach((t, index) => {
          console.log(`${index + 1}. ${t.created_at} - ₹${t.amount} - ${t.status} - Order: ${t.provider_order_id}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error in test flow:', error);
  }

  console.log('\n🧪 Transaction flow test completed');
}

testTransactionFlow().catch(console.error); 