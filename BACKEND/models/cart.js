const mongoose = require('mongoose');

// This defines the structure for an individual item inside the cart
const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    sizeKey: { type: String, required: true }, // e.g., "40x60"
    packKey: { type: String, required: true }, // e.g., "2pc"
    quantity: { type: Number, required: true, default: 1, min: 1 },
    price: { type: String, required: true }    // Stores the string price (e.g., "₹230")
});

// This defines the main cart, linking it to the logged-in User
const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // Ensures one cart per customer
    },
    items: [cartItemSchema]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Cart', cartSchema);