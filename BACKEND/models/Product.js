const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // We add a specific ID field to replace the object keys you currently use
    productId: { type: String, required: true, unique: true },
    categoryId: [String],
    productName: String,
    catalogDescription: String,
    catalogSizesText: String,
    startingPrice: String,
    sizes: Object 
});

module.exports = mongoose.model('Product', productSchema);