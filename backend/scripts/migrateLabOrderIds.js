const mongoose = require('mongoose');
const Laboratory = require('../models/Laboratory');
require('dotenv').config();

async function migrateLabOrderIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all lab orders without orderId
    const ordersWithoutId = await Laboratory.find({ 
      $or: [
        { orderId: { $exists: false } },
        { orderId: null }
      ]
    });

    console.log(`Found ${ordersWithoutId.length} lab orders without orderId`);

    // Update each order
    let updated = 0;
    for (const order of ordersWithoutId) {
      const newOrderId = `LAB-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      // Use updateOne to bypass validation
      await Laboratory.updateOne(
        { _id: order._id },
        { $set: { orderId: newOrderId } }
      );
      updated++;
      
      // Add small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`✓ Successfully updated ${updated} lab orders`);
    
    // Verify
    const remaining = await Laboratory.countDocuments({ 
      $or: [
        { orderId: { $exists: false } },
        { orderId: null }
      ]
    });
    
    console.log(`${remaining} lab orders still without orderId`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLabOrderIds();
