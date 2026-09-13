class SiteToolbar extends HTMLElement {
    connectedCallback() {
        const root = this.getAttribute('root-path') || '';
        
        const token = localStorage.getItem('shuchiva_token');
        const userName = localStorage.getItem('shuchiva_user_name') || 'Customer';

        let authHTML = '';
        if (token) {
            // User IS logged in
            authHTML = `
                <div class="dropdown" style="margin-left: 1.5rem;">
                    <a href="#" class="dropbtn" style="color: #4da8da; font-weight: 600; text-decoration: none;">Hi, ${userName} &#9662;</a>
                    <div class="dropdown-content" style="min-width: 160px; right: 0; left: auto;">
                        <a href="${root}account/orders.html">My Orders</a>
                        <a href="${root}account/settings.html">Account Settings</a>
                        <a href="#" id="logout-btn" style="color: #ff6b6b; border-top: 1px solid rgba(255,255,255,0.1);">Log Out</a>
                    </div>
                </div>
            `;
        } else {
            // User is NOT logged in: Show unified OTP button
            authHTML = `
                <a href="${root}auth/login.html" style="background-color: #4da8da; color: #0d1117; padding: 8px 16px; border-radius: 4px; font-weight: 600; text-decoration: none; margin-left: 1.5rem; transition: background-color 0.2s;">Log In / Sign Up</a>
            `;
        }

        this.innerHTML = `
        <style>
            /* The Toolbar CSS */
            nav { position: relative; width: 100%; padding: 2rem; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; z-index: 100; background-color: #0d1117; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
            .logo a { color: #fff; text-decoration: none; }
            .nav-links { display: flex; align-items: center; }
            .nav-links a { color: #fff; text-decoration: none; margin-left: 2rem; font-size: 0.9rem; transition: color 0.3s ease; display: inline-block; padding: 10px 0; }
            .nav-links a:hover { color: #4da8da; }
            .dropdown { position: relative; display: inline-block; }
            .dropdown-content { display: none; position: absolute; background-color: rgba(13, 17, 23, 0.95); min-width: 220px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5); z-index: 100; top: 100%; left: 2rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); padding: 10px 0; }
            .dropdown-content a { color: white; padding: 12px 20px; text-decoration: none; display: block; margin-left: 0; font-size: 0.85rem; transition: background-color 0.3s ease, color 0.3s ease; }
            .dropdown-content a:hover { background-color: rgba(77, 168, 218, 0.15); color: #4da8da; }
            .dropdown:hover .dropdown-content { display: block; }
        </style>
        
        <nav>
            <div class="logo"><a href="${root}homepage/index.html">Shuchiva Essentials</a></div>
            <div class="nav-links">
                
                <div class="dropdown">
                    <a href="#" class="dropbtn" style="text-decoration: none;">Microfiber Range &#9662;</a>
                    <div class="dropdown-content">
                        <a href="${root}categories/subcategory.html?category=multipurpose">Multipurpose Cloths</a>
                        <a href="${root}categories/subcategory.html?category=cleaningPurpose">Only Cleaning Purpose</a>
                        <a href="${root}categories/subcategory.html?category=skinCare">Skin Care</a>
                        <a href="${root}categories/subcategory.html?category=opticalCare">Optical Care</a>
                        <a href="${root}categories/subcategory.html?category=automobileCleaning">Automobile Cleaning</a>
                        <a href="${root}homepage/index.html#new-arrivals">New Arrivals</a>
                    </div>
                </div>
                
                <a href="${root}homepage/index.html#about">About Us</a>
                <a href="${root}homepage/index.html#contact">Contact</a>
                
                <a href="${root}cart/cart.html" id="cart-nav-btn" style="margin-left: 1.5rem; display: flex; align-items: center; gap: 5px; color: #fff; text-decoration: none;">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4 8l1.35 5.4A2 2 0 008.3 20h7.4a2 2 0 001.95-1.56L19 13H7z"></path><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle></svg>
                    Cart (<span id="cart-qty-badge">0</span>)
                </a>

                ${authHTML}
            </div>
        </nav>
        `;

        if (token) {
            const logoutBtn = this.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('shuchiva_token');
                    localStorage.removeItem('shuchiva_user_name');
                    window.location.reload();
                });
            }
        }
        
        // Initial fetch when page loads
        this.updateCartQuantity(token);

        // Listen for live cart update events from other pages/scripts
        window.addEventListener('cartUpdated', () => {
            this.updateCartQuantity(token);
        });
    }

    async updateCartQuantity(token) {
        const cartBadge = this.querySelector('#cart-qty-badge');
        if (!cartBadge) return; 

        if (!token) {
            cartBadge.textContent = '0';
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const cartData = await response.json();
                let totalQty = 0;
                
                if (cartData.items && cartData.items.length > 0) {
                    cartData.items.forEach(item => {
                        totalQty += item.quantity;
                    });
                }
                cartBadge.textContent = totalQty;
            }
        } catch (error) {
            console.error('Error fetching cart quantity:', error);
            cartBadge.textContent = '!';
        }
    }
}
customElements.define('site-toolbar', SiteToolbar);