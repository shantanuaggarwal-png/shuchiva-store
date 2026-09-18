const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    sizeKey: { type: String, required: true },
    packKey: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [orderItemSchema],
    razorpayPaymentId: { type: String, required: true },
    razorpayOrderId: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    
    // Delivery and Tracking Data
    shippingAddress: { type: Object, required: true },
    shiprocketShipmentId: { type: String },
    shiprocketOrderId: { type: String },
    
    status: { type: String, default: 'Processing' } // e.g., Processing, Shipped, Delivered
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);