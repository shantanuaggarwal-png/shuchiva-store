const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const crypto = require('crypto');

// Generate a deterministic 9-digit numeric ID from a string
function getNumericId(str) {
    if (!str) return Math.floor(Math.random() * 900000000) + 100000000;
    return parseInt(crypto.createHash('md5').update(str).digest('hex').substring(0, 12), 16) % 900000000 + 100000000;
}

// Helper to convert Shuchiva products to Fastrr/Shopify product schema
function formatProduct(prod) {
    const variants = [];
    let firstImg = '';

    Object.keys(prod.sizes || {}).forEach(sizeKey => {
        const sizeObj = prod.sizes[sizeKey];
        Object.keys(sizeObj.packs || {}).forEach(packKey => {
            const packObj = sizeObj.packs[packKey];
            const priceNum = packObj.price.replace(/[^0-9.]/g, ''); // Extract '242' from '₹242'
            const variantIdStr = `${prod.productId}_${sizeKey}_${packKey}`;
            const variantIdNumeric = getNumericId(variantIdStr);
            
            const imgUrl = `https://shuchiva-store.onrender.com/products/${prod.productId}/${sizeObj.folderName}/${packObj.mainImg}`;
            if (!firstImg) firstImg = imgUrl;

            variants.push({
                id: variantIdNumeric,
                title: `${sizeObj.sizeText} - ${packKey}`,
                price: parseFloat(priceNum).toFixed(2),
                sku: variantIdStr, // Keep string for SKU, sku is allowed to be string
                quantity: 999, // Infinite stock for now
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                taxable: true,
                option_values: {
                    "Size": sizeObj.sizeText,
                    "Pack": packKey
                },
                image: { src: imgUrl }
            });
        });
    });

    return {
        id: getNumericId(prod.productId),
        title: prod.productName,
        body_html: `<p>${prod.catalogDescription}</p>`,
        vendor: "Shuchiva Essentials",
        product_type: "Cleaning Cloth",
        created_at: new Date().toISOString(),
        handle: prod.productId,
        updated_at: new Date().toISOString(),
        tags: prod.categoryId ? prod.categoryId.join(', ') : "",
        status: "active",
        variants: variants,
        image: { src: firstImg },
        options: [
            { name: "Size", values: Object.keys(prod.sizes || {}).map(k => prod.sizes[k].sizeText) },
            { name: "Pack", values: ["2pc", "3pc", "4pc", "5pc"] } // Dynamic extraction can be done
        ]
    };
}

// 1. Fetch Products API
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        
        const products = await Product.find().lean();
        // Since we only have a few, we just slice for pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const fastrrProducts = products.map(formatProduct);
        const paginatedProducts = fastrrProducts.slice(startIndex, endIndex);

        res.json({
            data: {
                total: fastrrProducts.length,
                products: paginatedProducts
            }
        });
    } catch (err) {
        console.error("Fastrr Fetch Products Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Fetch Collections API
router.get('/collections', async (req, res) => {
    try {
        // Shuchiva essentials currently uses simple string categories
        // We will just expose a default 'all' collection, or unique categoryIds
        const products = await Product.find().lean();
        const categorySet = new Set();
        products.forEach(p => {
            if (p.categoryId) p.categoryId.forEach(c => categorySet.add(c));
        });

        const collections = Array.from(categorySet).map((cat, idx) => ({
            id: getNumericId(cat),
            title: cat.toUpperCase(),
            handle: cat,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            image: { src: "https://shuchiva-store.onrender.com/logo.png" } // placeholder
        }));

        res.json({
            data: {
                total: collections.length,
                collections: collections
            }
        });
    } catch (err) {
        console.error("Fastrr Fetch Collections Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. Fetch Products by Collection API
router.get('/products-by-collection', async (req, res) => {
    try {
        const collectionId = req.query.collection_id; // Will be numeric string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;

        let products = await Product.find().lean();
        
        if (collectionId) {
            products = products.filter(p => {
                if (!p.categoryId) return false;
                // Check if any categoryId hashes to the numeric collectionId
                return p.categoryId.some(cat => getNumericId(cat).toString() === collectionId);
            });
        }

        const fastrrProducts = products.map(formatProduct);
        
        const startIndex = (page - 1) * limit;
        const paginatedProducts = fastrrProducts.slice(startIndex, startIndex + limit);

        res.json({
            data: {
                total: fastrrProducts.length,
                products: paginatedProducts
            }
        });
    } catch (err) {
        console.error("Fastrr Fetch Products By Collection Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
