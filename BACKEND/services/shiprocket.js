const axios = require('axios');

class ShiprocketService {
    constructor() {
        this.token = null;
        this.tokenExpiresAt = null;
        this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    }

    /**
     * Authenticates with Shiprocket or returns cached token (valid for 10 days).
     */
    async getAuthToken() {
        // Refresh token 1 day before expiration if cached
        if (this.token && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
            return this.token;
        }

        const email = process.env.SHIPROCKET_EMAIL;
        const password = process.env.SHIPROCKET_PASSWORD;

        if (!email || !password) {
            throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured in environment variables.');
        }

        try {
            const response = await axios.post(`${this.baseUrl}/auth/login`, {
                email,
                password
            });

            this.token = response.data.token;
            // Shiprocket tokens last for 10 days (240 hours). We cache for 9 days.
            this.tokenExpiresAt = Date.now() + (9 * 24 * 60 * 60 * 1000);
            return this.token;
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message;
            console.error('Shiprocket Auth Error:', errMsg);
            throw new Error(`Shiprocket Authentication Failed: ${errMsg}`);
        }
    }

    /**
     * Creates an ad-hoc order directly in Shiprocket.
     */
    async createOrder({
        orderId,
        orderDate,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        items,
        totalAmount,
        pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
        length = 15,
        breadth = 15,
        height = 5,
        weight = 0.4
    }) {
        const token = await this.getAuthToken();

        // Format order items for Shiprocket
        const orderItems = items.map(item => {
            const numericalPrice = typeof item.price === 'string'
                ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0
                : item.price;

            return {
                name: item.name || `Shuchiva Towel - ${item.sizeKey || ''} ${item.packKey || ''}`.trim(),
                sku: `${item.productId || 'SKU'}_${item.sizeKey || 'STD'}_${item.packKey || '1'}`.replace(/\s+/g, '_'),
                units: Number(item.quantity) || 1,
                selling_price: numericalPrice,
                discount: 0,
                tax: 0,
                hsn: 630710 // HSN code for microfiber cleaning cloths & towels
            };
        });

        // Split name into first and last name
        const nameParts = (customerName || 'Valued Customer').trim().split(/\s+/);
        const firstName = nameParts[0] || 'Valued';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Clean phone number (Shiprocket requires standard 10-digit number)
        const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

        // Date format: YYYY-MM-DD HH:MM
        const dateFormatted = orderDate
            ? new Date(orderDate).toISOString().slice(0, 16).replace('T', ' ')
            : new Date().toISOString().slice(0, 16).replace('T', ' ');

        const payload = {
            order_id: `SHU_${orderId}`,
            order_date: dateFormatted,
            pickup_location: pickupLocation,
            channel_id: '',
            comment: 'Shuchiva Store Web Order',
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: address || 'Not Provided',
            billing_address_2: '',
            billing_city: city || 'City',
            billing_pincode: pincode ? String(pincode).trim() : '248001',
            billing_state: state || 'Uttarakhand',
            billing_country: 'India',
            billing_email: email || 'customer@shuchiva.com',
            billing_phone: cleanPhone || '9999999999',
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: 'Prepaid',
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: totalAmount,
            length: Number(length),
            breadth: Number(breadth),
            height: Number(height),
            weight: Number(weight)
        };

        try {
            const res = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            return res.data;
        } catch (error) {
            console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Check courier serviceability between pickup pincode and delivery pincode.
     */
    async checkServiceability({
        pickupPincode = '248001',
        deliveryPincode,
        weight = 0.4,
        cod = 0
    }) {
        const token = await this.getAuthToken();
        const res = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight,
                cod
            },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data;
    }

    /**
     * Track an order by shipment ID.
     */
    async trackShipment(shipmentId) {
        const token = await this.getAuthToken();
        const res = await axios.get(`${this.baseUrl}/courier/track/shipment/${shipmentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data;
    }

    /**
     * Generate / Assign AWB courier code for a shipment.
     */
    async assignAWB(shipmentId, courierId = null) {
        const token = await this.getAuthToken();
        const payload = { shipment_id: shipmentId };
        if (courierId) payload.courier_id = courierId;

        const res = await axios.post(`${this.baseUrl}/courier/assign/awb`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return res.data;
    }
}

module.exports = new ShiprocketService();
