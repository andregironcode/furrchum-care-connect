// Quick test to check if server is running
console.log('Testing server...');

try {
  fetch('http://localhost:3001/api/health')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`Server responded with status: ${response.status}`);
    })
    .then(data => {
      console.log('✅ Server is running:', data);
    })
    .catch(error => {
      console.log('❌ Server is not accessible:', error.message);
    });
} catch (error) {
  console.log('❌ Error testing server:', error.message);
} 