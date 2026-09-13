require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay'); 
const crypto = require('crypto');     
const path = require('path');

// Import Schemas
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/cart');
const Order = require('./models/order');

const app = express();

app.use(cors());
app.use(express.json());

// --- SERVE STATIC FRONTEND FILES ---
// This serves your public website folder directly from the backend server
app.use(express.static(path.join(__dirname, '../WEBSITE')));

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


// --- USER AUTHENTICATION ROUTES (OTP SYSTEM) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        const mailOptions = {
            from: `"Shuchiva Essentials" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Shuchiva Essentials Login Code',
            html: `<h3>Your login code is: <strong>${otp}</strong></h3><p>This code will expire in 5 minutes. Do not share it with anyone.</p>`
        };

        await transporter.sendMail(mailOptions);
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


// --- USER PROFILE ROUTES ---
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
        console.error('Error adding to cart:', error);
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
        console.error('Error removing item:', error);
        res.status(500).json({ error: "Failed to remove item." });
    }
});


// --- RAZORPAY PAYMENT & ORDER ROUTES ---
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

        let totalAmount = 0;
        cart.items.forEach(item => {
            const numericalPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
            totalAmount += numericalPrice * item.quantity;
        });

        const options = {
            amount: totalAmount * 100, 
            currency: "INR",
            receipt: `receipt_${req.user.userId}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to create order" });
    }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                                   .update(sign.toString())
                                   .digest("hex");

        if (razorpay_signature === expectedSign) {
            const cart = await Cart.findOne({ userId: req.user.userId });
            if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

            let totalAmount = 0;
            cart.items.forEach(item => {
                const numericalPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
                totalAmount += numericalPrice * item.quantity;
            });

            const newOrder = new Order({
                userId: req.user.userId,
                items: cart.items,
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                totalAmount: totalAmount
            });
            await newOrder.save();

            cart.items = [];
            await cart.save();

            res.json({ message: "Payment verified successfully, order saved!" });
        } else {
            res.status(400).json({ error: "Invalid payment signature" });
        }
    } catch (error) {
        console.error('Order Saving Error:', error);
        res.status(500).json({ error: "Failed to process order." });
    }
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