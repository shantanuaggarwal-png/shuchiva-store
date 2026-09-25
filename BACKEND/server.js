require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const axios = require('axios'); 
const crypto = require('crypto');     
const Razorpay = require('razorpay'); 

// Import Schemas
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/cart');
const Order = require('./models/order');

// Import Shiprocket Service
const shiprocket = require('./services/shiprocket');

const app = express();

app.use(cors());

// Raw body parser for webhooks combined with standard JSON parsing
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// --- SERVE STATIC FRONTEND FILES WITH CACHE CONTROL ---
app.use(express.static(path.join(__dirname, '../WEBSITE'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// --- SHIPROCKET FASTRR HEADLESS ACCESS TOKEN (v1.2) ---
app.all('/api/shiprocket/access-token', async (req, res) => {
    try {
        const apiKey = process.env.FASTRR_API_KEY;
        const apiSecret = process.env.FASTRR_API_SECRET;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({ error: "Fastrr API credentials not configured on the server." });
        }

        const payload = {
            address: true,
            timestamp: new Date().toISOString()
        };
        const payloadString = JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', apiSecret).update(payloadString).digest('base64');

        const response = await axios.post('https://checkout-api.shiprocket.com/api/v1/access-token/login', payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-HMAC-SHA256': signature
            },
            timeout: 8000
        });

        if (response.data && response.data.ok && response.data.result) {
            return res.json({ token: response.data.result.token });
        } else if (response.data && response.data.token) {
            return res.json({ token: response.data.token });
        } else {
            return res.status(502).json({ error: "Invalid response from Fastrr API", details: response.data });
        }
    } catch (err) {
        console.error("Fastrr access token error:", err.response?.data || err.message);
        return res.status(err.response?.status || 500).json({
            error: err.response?.data?.message || err.response?.data?.error || "Failed to generate Fastrr access token."
        });
    }
});

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

app.get('/api/user/addresses', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json({ addresses: user.savedAddresses || [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch addresses." });
    }
});

app.post('/api/user/addresses', authenticateToken, async (req, res) => {
    try {
        const { fullName, phone, address, city, state, pincode } = req.body;
        if (!fullName || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({ error: "All address fields (Full Name, Phone, Address, City, State, Pincode) are required." });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.savedAddresses) user.savedAddresses = [];
        const newAddress = { fullName, phone, address, city, state, pincode };
        user.savedAddresses.push(newAddress);
        await user.save();

        res.status(201).json({ message: "Address saved successfully!", addresses: user.savedAddresses });
    } catch (error) {
        console.error("Save Address Error:", error);
        res.status(500).json({ error: "Failed to save address." });
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


// --- RAZORPAY CONFIG & ENDPOINTS ---
app.get('/api/payment/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// --- SHIPROCKET FULFILLMENT & TRACKING ENDPOINTS ---
app.get('/api/shipping/serviceability', async (req, res) => {
    try {
        const { deliveryPincode, weight } = req.query;
        if (!deliveryPincode) return res.status(400).json({ error: "Delivery pincode is required." });
        
        const serviceData = await shiprocket.checkServiceability({
            deliveryPincode,
            weight: weight ? parseFloat(weight) : 0.4
        });
        res.json(serviceData);
    } catch (error) {
        console.error("Serviceability Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to check courier serviceability." });
    }
});

app.get('/api/shipping/track/:orderId', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.userId });
        if (!order) return res.status(404).json({ error: "Order not found." });

        if (!order.shiprocketShipmentId) {
            return res.status(400).json({ error: "Shipment ID not assigned for this order." });
        }

        const tracking = await shiprocket.trackShipment(order.shiprocketShipmentId);
        res.json(tracking);
    } catch (error) {
        console.error("Tracking Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch tracking details." });
    }
});


// --- RAZORPAY NATIVE CHECKOUT & ORDER ROUTES ---
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
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, delivery_address } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                                   .update(sign.toString())
                                   .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

        const user = await User.findById(req.user.userId);

        let totalAmount = 0;
        cart.items.forEach(item => {
            const numericalPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
            totalAmount += numericalPrice * item.quantity;
        });

        const shippingAddr = delivery_address || {};

        const newOrder = new Order({
            userId: req.user.userId,
            items: cart.items,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            totalAmount: totalAmount,
            shippingAddress: shippingAddr,
            status: 'Processing',
            shiprocketStatus: 'Pending'
        });

        // Automatically push order to Shiprocket
        try {
            const shiprocketRes = await shiprocket.createOrder({
                orderId: razorpay_order_id,
                customerName: shippingAddr.fullName || user?.name || 'Customer',
                phone: shippingAddr.phone || '9999999999',
                email: user?.email || 'customer@shuchiva.com',
                address: shippingAddr.address || 'Address',
                city: shippingAddr.city || 'City',
                state: shippingAddr.state || 'State',
                pincode: shippingAddr.pincode || '248001',
                items: cart.items,
                totalAmount: totalAmount
            });

            if (shiprocketRes && shiprocketRes.shipment_id) {
                newOrder.shiprocketShipmentId = String(shiprocketRes.shipment_id);
                newOrder.shiprocketOrderId = String(shiprocketRes.order_id);
                newOrder.awbCode = shiprocketRes.awb_code || '';
                newOrder.courierName = shiprocketRes.courier_name || '';
                newOrder.shiprocketStatus = 'Created';
                console.log(`Shiprocket Order Created successfully! Shipment ID: ${shiprocketRes.shipment_id}`);
            } else {
                newOrder.shiprocketStatus = 'Pending';
            }
        } catch (srErr) {
            console.error('Shiprocket Order Creation Error:', srErr.response?.data || srErr.message);
            newOrder.shiprocketStatus = 'Failed';
            newOrder.shiprocketError = srErr.response?.data?.message || srErr.message;
        }

        await newOrder.save();

        cart.items = [];
        await cart.save();

        res.json({
            message: "Payment verified successfully, order saved!",
            orderId: newOrder._id,
            shipmentId: newOrder.shiprocketShipmentId,
            shiprocketStatus: newOrder.shiprocketStatus
        });

    } catch (error) {
        console.error('Order Processing Error:', error);
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


// --- RAZORPAY WEBHOOK FALLBACK ---
app.post('/api/webhook/razorpay', async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; 
    const signature = req.headers['x-razorpay-signature'];

    try {
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(req.rawBody)
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({ error: 'Invalid webhook signature' });
            }
        }

        const event = req.body.event;

        if (event === 'order.paid') {
            const paymentEntity = req.body.payload.payment.entity;
            const orderEntity = req.body.payload.order.entity;
            
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const userId = orderEntity.receipt ? orderEntity.receipt.replace('receipt_', '') : null;

            if (userId) {
                const existingOrder = await Order.findOne({ razorpayOrderId: orderId });
                
                if (!existingOrder) {
                    const cart = await Cart.findOne({ userId });
                    const user = await User.findById(userId);
                    
                    if (cart && cart.items.length > 0) {
                        let totalAmount = 0;
                        cart.items.forEach(item => {
                            const numericalPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
                            totalAmount += numericalPrice * item.quantity;
                        });

                        const defaultAddress = user?.savedAddresses?.[0] || {
                            fullName: user?.name || "Customer",
                            phone: paymentEntity.contact || "9999999999",
                            address: "Contact Address",
                            city: "City",
                            state: "State",
                            pincode: "248001"
                        };

                        const newOrder = new Order({
                            userId,
                            items: cart.items,
                            razorpayPaymentId: paymentId,
                            razorpayOrderId: orderId,
                            totalAmount: totalAmount,
                            shippingAddress: defaultAddress,
                            status: 'Processing',
                            shiprocketStatus: 'Pending'
                        });

                        try {
                            const srRes = await shiprocket.createOrder({
                                orderId,
                                customerName: defaultAddress.fullName,
                                phone: defaultAddress.phone,
                                email: user?.email || paymentEntity.email,
                                address: defaultAddress.address,
                                city: defaultAddress.city,
                                state: defaultAddress.state,
                                pincode: defaultAddress.pincode,
                                items: cart.items,
                                totalAmount
                            });

                            if (srRes && srRes.shipment_id) {
                                newOrder.shiprocketShipmentId = String(srRes.shipment_id);
                                newOrder.shiprocketOrderId = String(srRes.order_id);
                                newOrder.awbCode = srRes.awb_code || '';
                                newOrder.courierName = srRes.courier_name || '';
                                newOrder.shiprocketStatus = 'Created';
                            }
                        } catch (srErr) {
                            newOrder.shiprocketStatus = 'Failed';
                            newOrder.shiprocketError = srErr.message;
                        }

                        await newOrder.save();
                        cart.items = [];
                        await cart.save();
                        console.log(`Webhook fallback order processed & saved for user ${userId}`);
                    }
                }
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Fallback for unmatched /api routes to always return clean JSON
app.use('/api', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// --- RENDER DYNAMIC PORT ASSIGNMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});