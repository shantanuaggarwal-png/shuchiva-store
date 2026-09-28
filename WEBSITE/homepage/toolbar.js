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
        
            /* Sidebar CSS */
            .sidenav { height: 100%; width: 0; position: fixed; z-index: 200; top: 0; left: 0; background-color: rgba(13, 17, 23, 0.98); backdrop-filter: blur(10px); overflow-x: hidden; transition: 0.3s; border-right: 1px solid rgba(255, 255, 255, 0.05); white-space: nowrap; }
            .sidenav .closebtn { position: absolute; top: 15px; right: 25px; font-size: 36px; color: #a3b3c8; text-decoration: none; transition: 0.3s; line-height: 1; }
            .sidenav .closebtn:hover { color: #fff; }
            .side-heading { color:#a3b3c8; padding: 2rem 2rem 1rem 2rem; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; margin: 0; margin-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .side-category h4 { color: #fff; padding-left: 2rem; margin-bottom: 10px; font-size: 1.1rem; }
            .side-category ul { list-style: none; padding-left: 3rem; margin: 0; line-height: 2.2; }
            .side-category a { text-decoration: none; font-size: 0.95rem; color: #a3b3c8; display: block; transition: 0.3s; }
            .side-category a:hover { color: #4da8da; }
            #open-sidebar:hover { color: #4da8da; }
        
            /* Sidebar CSS */
            .sidenav { height: 100%; width: 0; position: fixed; z-index: 200; top: 0; left: 0; background-color: rgba(13, 17, 23, 0.98); backdrop-filter: blur(10px); overflow-x: hidden; transition: 0.3s; border-right: 1px solid rgba(255, 255, 255, 0.05); white-space: nowrap; text-align: left; }
            .sidenav .closebtn { position: absolute; top: 15px; right: 25px; font-size: 36px; color: #a3b3c8; text-decoration: none; transition: 0.3s; line-height: 1; }
            .sidenav .closebtn:hover { color: #fff; }
            .side-heading { color:#a3b3c8; padding: 2rem 2rem 1rem 2rem; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; margin: 0; margin-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .side-category h4 { color: #fff; padding-left: 2rem; margin-bottom: 10px; font-size: 1.1rem; }
            .side-category ul { list-style: none; padding-left: 3rem; margin: 0; line-height: 2.2; }
            .side-category a { text-decoration: none; font-size: 0.95rem; color: #a3b3c8; display: block; transition: 0.3s; }
            .side-category a:hover { color: #4da8da; }
            #open-sidebar:hover { color: #4da8da; }
        
            /* Help Widget CSS */
            .help-widget-container { position: fixed; bottom: 20px; left: 20px; z-index: 999; font-family: 'Segoe UI', sans-serif; }
            .help-btn { background-color: #4da8da; color: #0d1117; width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: transform 0.3s ease; animation: bounce 2s infinite; }
            .help-btn:hover { transform: scale(1.1); animation: none; }
            .help-popup { display: none; position: absolute; bottom: 65px; left: 0; background-color: rgba(13, 17, 23, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); padding: 20px; border-radius: 8px; width: 280px; box-shadow: 0 8px 16px rgba(0,0,0,0.5); color: #fff; }
            .help-popup h4 { margin-top: 0; margin-bottom: 10px; color: #4da8da; }
            .help-popup p { font-size: 0.85rem; margin-bottom: 15px; color: #a3b3c8; line-height: 1.4; }
            @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        </style>


        
        <!-- Sidebar Overlay & Drawer -->
        <div id="side-menu-overlay" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 199; backdrop-filter: blur(2px);"></div>
        
        <div id="side-menu" class="sidenav">
            <a href="javascript:void(0)" class="closebtn" id="close-sidebar">&times;</a>
            <h3 class="side-heading">Search by Categories</h3>
            
            <div class="side-category" style="margin-top: 1.5rem;">
                <h4>Microfiber Range</h4>
                <ul>
                    <li><a href="${root}categories/subcategory.html?category=multipurpose">Multipurpose Cloths</a></li>
                    <li><a href="${root}categories/subcategory.html?category=cleaningPurpose">Only Cleaning Purpose</a></li>
                    <li><a href="${root}categories/subcategory.html?category=skinCare">Skin Care</a></li>
                    <li><a href="${root}categories/subcategory.html?category=opticalCare">Optical Care</a></li>
                    <li><a href="${root}categories/subcategory.html?category=automobileCleaning">Automobile Cleaning</a></li>
                    <li><a href="${root}homepage/index.html#new-arrivals">New Arrivals</a></li>
                </ul>
            </div>

            <div class="side-category" style="margin-top: 2rem;">
                <h4>Cotton Towel Range</h4>
                <ul>
                    <li><a href="#" style="color: #6e7d91; cursor: default;">Upcoming...</a></li>
                </ul>
            </div>
        </div>

        <nav>
            <div style="display: flex; align-items: center;">
                <span id="open-sidebar" style="font-size: 24px; cursor: pointer; color: white; margin-right: 20px; transition: color 0.3s;">&#9776;</span>
                <div class="logo"><a href="${root}homepage/index.html">Shuchiva Essentials</a></div>
            </div>
            <div class="nav-links">
                
               <a href="${root}homepage/about.html">About Us</a>
               <a href="${root}homepage/contact.html">Contact Us</a>
                
                <a href="${root}cart/cart.html" id="cart-nav-btn" style="margin-left: 1.5rem; display: flex; align-items: center; gap: 5px; color: #fff; text-decoration: none;">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4 8l1.35 5.4A2 2 0 008.3 20h7.4a2 2 0 001.95-1.56L19 13H7z"></path><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle></svg>
                    Cart (<span id="cart-qty-badge">0</span>)
                </a>

                ${authHTML}
            </div>
        </nav>

        <!-- Help Widget -->
        <div class="help-widget-container">
            <div id="help-popup" class="help-popup">
                <span id="close-help-popup" style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: #fff; font-size: 1.2rem; line-height: 1;">&times;</span>
                <h4>Need Help?</h4>
                <p>Enter mobile and email details below and we will contact you in 24 hours.</p>
                <form id="help-form">
                    <input type="email" placeholder="Your Email" required style="width:100%; padding:8px; margin-bottom:10px; box-sizing:border-box; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:#0d1117; color:#fff;" />
                    <input type="tel" placeholder="Your Mobile" required style="width:100%; padding:8px; margin-bottom:10px; box-sizing:border-box; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:#0d1117; color:#fff;" />
                    <button type="submit" style="width:100%; padding:8px; background:#4da8da; border:none; color:#0d1117; font-weight:bold; border-radius:4px; cursor:pointer;">Submit</button>
                </form>
                <div style="margin-top: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    <a href="${root}homepage/contact.html" style="color:#4da8da; font-size: 0.85rem; text-decoration: none;">Or open Contact Page</a>
                </div>
            </div>
            <div id="help-btn" class="help-btn">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
        </div>
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
        

        // Sidebar functionality
        const openBtn = this.querySelector('#open-sidebar');
        const closeBtn = this.querySelector('#close-sidebar');
        const sideMenu = this.querySelector('#side-menu');
        const sideOverlay = this.querySelector('#side-menu-overlay');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                sideMenu.style.width = '320px';
                sideOverlay.style.display = 'block';
            });
        }
        
        const closeSideMenu = () => {
            sideMenu.style.width = '0';
            sideOverlay.style.display = 'none';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeSideMenu);
        if (sideOverlay) sideOverlay.addEventListener('click', closeSideMenu);

        // Help Widget functionality
        const helpBtn = this.querySelector('#help-btn');
        const helpPopup = this.querySelector('#help-popup');
        const closeHelpPopup = this.querySelector('#close-help-popup');
        const helpForm = this.querySelector('#help-form');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                helpPopup.style.display = helpPopup.style.display === 'block' ? 'none' : 'block';
            });
        }
        if (closeHelpPopup) {
            closeHelpPopup.addEventListener('click', () => {
                helpPopup.style.display = 'none';
            });
        }
        if (helpForm) {
            helpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Details submitted! We will contact you in 24 hours.');
                helpForm.reset();
                helpPopup.style.display = 'none';
            });
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
