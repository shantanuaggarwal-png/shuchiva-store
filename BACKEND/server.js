require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const axios = require('axios'); 
const crypto = require('crypto');     

// Import Schemas
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/cart');
const Order = require('./models/order');

const app = express();

app.use(cors());

// Raw body parser for webhooks combined with standard JSON parsing
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// --- SERVE STATIC FRONTEND FILES ---
app.use(express.static(path.join(__dirname, '../WEBSITE')));

// Redirect root domain to the homepage
app.get('/', (req, res) => {
    res.redirect('/homepage/index.html');
});

// Database connection securely loaded from environment variables
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));


// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. Please log in." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired session. Please log in again." });
    }
};


// --- USER AUTHENTICATION ROUTES (OTP SYSTEM VIA BREVO HTTP) ---
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name: email.split('@')[0] });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "Shuchiva Essentials",
                    email: process.env.EMAIL_USER 
                },
                to: [{ email: email }],
                subject: 'Your Shuchiva Essentials Login Code',
                htmlContent: `<h3>Your login code is: <strong>${otp}</strong></h3><p>This code will expire in 5 minutes. Do not share it with anyone.</p>`
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API Error:', errorData);
            return res.status(500).json({ error: "Failed to send OTP. Please try again." });
        }

        res.status(200).json({ message: "OTP sent successfully to your email." });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: "Invalid OTP code." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP code." });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: "Server error during verification." });
    }
});


// --- USER PROFILE & ADDRESS BOOK ROUTES ---
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Name cannot be empty." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name: name.trim() },
            { new: true }
        );

        res.json({ message: "Profile updated successfully!", user: { name: updatedUser.name } });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

app.get('/api/user/addresses', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json({ addresses: user.savedAddresses || [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch addresses." });
    }
});


// --- SHOPPING CART ROUTES ---
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: "Failed to fetch cart." });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { productId, sizeKey, packKey, quantity, price } = req.body;
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) cart = new Cart({ userId: req.user.userId, items: [] });

        const existingItemIndex = cart.items.findIndex(item => item.productId === productId && item.sizeKey === sizeKey && item.packKey === packKey);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, sizeKey, packKey, quantity, price });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart successfully!", cart });
    } catch (error) {
        res.status(500).json({ error: "Failed to add item to cart." });
    }
});

app.delete('/api/cart/remove', authenticateToken, async (req, res) => {
    try {
        const { productId, sizeKey, packKey } = req.body;
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.status(404).json({ error: "Cart not found." });

        cart.items = cart.items.filter(item => !(item.productId === productId && item.sizeKey === sizeKey && item.packKey === packKey));

        await cart.save();
        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove item." });
    }
});


// --- FASTRR CHECKOUT ROUTE (S2S HEADLESS API) ---
app.post('/api/checkout/fastrr', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

        const user = await User.findById(req.user.userId);

        // 1. Structure the exact payload Shiprocket Fastrr requires
        const payload = {
            channel_id: "12151066",
            order_items: cart.items.map(item => ({
                sku: `${item.productId}-${item.sizeKey}-${item.packKey}`,
                name: `Shuchiva Product`,
                units: item.quantity,
                selling_price: parseInt(item.price.replace(/[^0-9]/g, ''), 10)
            })),
            customer_email: user.email,
            customer_phone: user.phone || "" 
        };

        const payloadString = JSON.stringify(payload);

        // 2. Generate the Cryptographic HMAC SHA256 Signature in Base64
        const signature = crypto.createHmac('sha256', process.env.FASTRR_API_SECRET)
                                .update(payloadString)
                                .digest('base64');

        // 3. Post to the Fastrr Headless Endpoint with strict security headers
        const fastrrRes = await axios.post('https://checkout-api.shiprocket.com/v1/checkout', payload, {
            headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.FASTRR_API_KEY,
                'X-Api-HMAC-SHA256': signature
            }
        });

        res.json({ checkoutToken: fastrrRes.data.token, checkoutUrl: fastrrRes.data.checkout_url });
    } catch (error) {
        console.error('Fastrr S2S Error:', error.response?.data || error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// --- FASTRR SUCCESS WEBHOOK (Placeholder for finalizing orders) ---
app.post('/api/webhook/fastrr', async (req, res) => {
    // We will build this out once the checkout window successfully opens
    res.status(200).json({ status: "Webhook received" });
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders." });
    }
});


// --- PRODUCT API ROUTE ---
app.get('/api/products', async (req, res) => {
    try {
        const productsArray = await Product.find({});
        const productCatalog = {};
        productsArray.forEach(item => {
            productCatalog[item.productId] = item;
        });
        res.json(productCatalog);
    } catch (error) {
        console.error('Error fetching catalog:', error);
        res.status(500).json({ error: "Failed to fetch products from database" });
    }
});


// --- RENDER DYNAMIC PORT ASSIGNMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});