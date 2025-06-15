import Razorpay from 'razorpay';

// Test keys (these are test keys from env-config.js)
const testKeyId = 'rzp_test_N2UcpugA4t44wo';
const testKeySecret = 'o3e4uXTFnar3ILSqrTV8Rp70';

console.log('Testing Razorpay keys...');
console.log('Key ID:', testKeyId);
console.log('Key Secret:', testKeySecret ? `${testKeySecret.substring(0, 8)}...` : 'NOT SET');

const razorpay = new Razorpay({
  key_id: testKeyId,
  key_secret: testKeySecret,
});

// Test order creation
const testOrder = {
  amount: 50000, // amount in paise (500 INR)
  currency: 'INR',
  receipt: 'test_receipt_123',
  notes: {
    key1: 'value3',
    key2: 'value2'
  }
};

console.log('Creating test order...');

razorpay.orders.create(testOrder)
  .then((order) => {
    console.log('✅ SUCCESS: Razorpay order created successfully!');
    console.log('Order Details:', JSON.stringify(order, null, 2));
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Currency:', order.currency);
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ ERROR: Razorpay order creation failed');
    console.error('Error details:', error);
    console.error('Error message:', error.description || error.message);
    process.exit(1);
  }); 