// Quick test script to verify SuperAdmin API endpoint works
const testSuperAdminAPI = async () => {
  try {
    console.log('🧪 Testing SuperAdmin API endpoint...');
    
    const response = await fetch('/api/admin-transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer true',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SuperAdmin API test successful!');
      console.log(`📊 Found ${data.length} transactions`);
      console.log('Sample transaction:', data[0]);
    } else {
      const errorText = await response.text();
      console.error('❌ SuperAdmin API test failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ SuperAdmin API test error:', error);
  }
};

// Run the test
testSuperAdminAPI(); 