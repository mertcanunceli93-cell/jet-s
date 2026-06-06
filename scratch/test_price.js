const axios = require('axios');

const API_URL = 'http://127.0.0.1:4000/api';

async function calculatePrice(params) {
  try {
    console.log(`\n🚀 Testing [${params.vehicleType || 'MOTO'} / ${params.deliveryType || 'STANDARD'}]...`);
    const response = await axios.post(`${API_URL}/price/calculate`, {
      pickupAddress: 'Istanbul, Beşiktaş',
      deliveryAddress: 'Istanbul, Kadıköy',
      ...params
    });
    
    const { data } = response.data;
    console.log('✅ Status: SUCCESS');
    console.log(`💰 Total Price: ${data.price.toFixed(2)} TRY`);
    console.log(`📍 Distance: ${data.quote.distanceKm} km`);
    console.log(`⏱️ Estimated Time: ${data.quote.estimatedTime} mins`);
    
    if (data.quote.appliedAdjustments.length > 0) {
      console.log('✨ Adjustments:', data.quote.appliedAdjustments.join(', '));
    } else {
      console.log('✨ Adjustments: None (Standard Rates)');
    }
    
    console.log('🤖 AI Note:', data.ai.note);
    return response.data;
  } catch (error) {
    console.log('❌ Status: FAILED');
    console.error('Error Details:', error.response ? error.response.data : error.message);
  }
}

async function runTests() {
  console.log('=========================================');
  console.log('   JETIS PRICING ENGINE - INTEGRATION TEST');
  console.log('=========================================');
  
  // Test Case 1: Standard Moto
  await calculatePrice({ vehicleType: 'MOTO', deliveryType: 'STANDARD' });

  // Test Case 2: Express Car (Higher rates)
  await calculatePrice({ vehicleType: 'CAR', deliveryType: 'EXPRESS' });

  // Test Case 3: VIP Delivery (Highest priority)
  await calculatePrice({ vehicleType: 'MOTO', deliveryType: 'VIP' });

  console.log('\n=========================================');
  console.log('   TEST SUITE FINISHED');
  console.log('=========================================');
}

runTests();
