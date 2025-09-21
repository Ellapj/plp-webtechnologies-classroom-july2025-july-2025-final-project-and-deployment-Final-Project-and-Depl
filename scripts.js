// Consolidated JavaScript for Delikrafts Meals Website
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cartIcon = document.querySelector('.header-icons .fa-shopping-cart');
    const floatingCartIcon = document.querySelector('.floating-cart .fa-shopping-cart');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.cart-content .close-button');
    const mainElement = document.querySelector('main');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCountSpan = document.getElementById('cart-count');
    const floatingCartCountSpan = document.getElementById('cart-count-floating');
    const checkoutButton = document.querySelector('.checkout-button');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    
    // Product filtering elements
    const productSearch = document.getElementById('product-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productGrid = document.getElementById('product-grid');
    
    // Contact form elements
    const contactForm = document.getElementById('contact-form');
    
    // Cart management
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Initialize the page
    init();

    function init() {
        loadCartFromLocalStorage();
        setupEventListeners();
        if (productSearch && categoryButtons.length > 0) {
            setupProductFiltering();
        }
        if (contactForm) {
            setupContactForm();
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Mobile menu toggle
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }

        // Cart modal toggle
        if (cartIcon && cartModal) {
            cartIcon.addEventListener('click', openCartModal);
        }
        
        // Floating cart modal toggle (products page)
        if (floatingCartIcon && cartModal) {
            floatingCartIcon.addEventListener('click', openCartModal);
        }

        if (closeButton && cartModal) {
            closeButton.addEventListener('click', closeCartModal);
        }

        // Close modal when clicking outside
        if (cartModal) {
            cartModal.addEventListener('click', (event) => {
                if (event.target === cartModal) {
                    closeCartModal();
                }
            });
        }

        // Add to cart functionality
        if (mainElement) {
            mainElement.addEventListener('click', handleAddToCart);
        }

        // Cart item controls
        if (cartItemsList) {
            cartItemsList.addEventListener('click', handleCartControls);
        }

        // Checkout button
        if (checkoutButton) {
            checkoutButton.addEventListener('click', handleCheckout);
        }
    }

    // Mobile menu functions
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
    }

    // Cart modal functions
    function openCartModal() {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartModal() {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Cart management functions
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartItemsList) {
            updateCartDisplay();
        }
    }

    function handleAddToCart(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productCard = event.target.closest('.product-card');
            const productId = productCard.dataset.id;
            const productName = productCard.querySelector('h3').innerText;
            const priceText = productCard.querySelector('p').innerText;
            const productPrice = parseFloat(priceText.replace('N', '').replace(',', '').replace('/portion', '').replace('/1', '').split('/')[0]);

            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }
            
            updateCartDisplay();
            saveCartToLocalStorage();
            
            // Show success feedback
            showAddToCartFeedback(event.target);
        }
    }

    function showAddToCartFeedback(button) {
        const originalText = button.innerText;
        button.innerText = 'Added!';
        button.style.backgroundColor = '#51955b';
        setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = '';
        }, 1000);
    }

    function updateCartDisplay() {
        if (!cartItemsList) return;
        
        cartItemsList.innerHTML = '';
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart-message">Your cart is empty</li>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('cart-item');
                listItem.dataset.id = item.id;
                listItem.innerHTML = `
                    <div class="cart-item-info">
                        <span>${item.name}</span>
                        <span>N${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-btn">Remove</button>
                    </div>
                `;
                cartItemsList.appendChild(listItem);
                total += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }

        if (cartTotalPrice) {
            cartTotalPrice.innerText = `N${total.toLocaleString()}`;
        }
        
        // Update both cart counters
        if (cartCountSpan) {
            cartCountSpan.innerText = totalItems;
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
        
        if (floatingCartCountSpan) {
            floatingCartCountSpan.innerText = totalItems;
            floatingCartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    function handleCartControls(event) {
        const itemElement = event.target.closest('.cart-item');
        if (!itemElement) return;

        const productId = itemElement.dataset.id;
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        if (event.target.classList.contains('plus')) {
            item.quantity++;
        } else if (event.target.classList.contains('minus')) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                removeItemFromCart(productId);
            }
        } else if (event.target.classList.contains('remove-btn')) {
            removeItemFromCart(productId);
        }

        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function removeItemFromCart(productId) {
        const itemIndex = cart.findIndex(i => i.id === productId);
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
        }
    }

    function handleCheckout(event) {
        if (cart.length === 0) {
            event.preventDefault();
            alert('Your cart is empty. Please add some products before checking out.');
        } else {
            saveCartToLocalStorage();
        }
    }

    // Product filtering functionality
    function setupProductFiltering() {
        // Search functionality
        if (productSearch) {
            productSearch.addEventListener('input', filterProducts);
        }

        // Category filtering
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter products
                filterProducts();
            });
        });
    }

    function filterProducts() {
        if (!productGrid) return;

        const searchTerm = productSearch ? productSearch.value.toLowerCase() : '';
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
        const products = productGrid.querySelectorAll('.product-card');

        products.forEach(product => {
            const productName = product.querySelector('h3').innerText.toLowerCase();
            const productCategory = Array.from(product.classList).find(cls => 
                ['cakes', 'pastries', 'drinks', 'food', 'extras'].includes(cls)
            );

            const matchesSearch = productName.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || productCategory === activeCategory;

            if (matchesSearch && matchesCategory) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Contact form functionality
    function setupContactForm() {
        contactForm.addEventListener('submit', handleContactForm);
    }

    function handleContactForm(event) {
        event.preventDefault();
        
        const formStatus = document.getElementById('form-status');
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            formStatus.innerHTML = '<span style="color: red;">Please fill in all fields.</span>';
            return;
        }

        // Create WhatsApp message
        const whatsappMessage = `Hello! My name is ${name} and I'd like to get in touch with Delikrafts Meals.\n\n*Contact Information:*\nEmail: ${email}\n\n*Message:*\n${message}\n\nThank you!`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/2349021520646?text=${encodedMessage}`;

        // Show success message
        formStatus.innerHTML = '<span style="color: green;">Redirecting to WhatsApp...</span>';
        
        // Redirect to WhatsApp after a short delay
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            contactForm.reset();
            formStatus.innerHTML = '<span style="color: green;">Message sent via WhatsApp!</span>';
        }, 1000);
    }

    // Checkout page specific functionality
    if (window.location.pathname.includes('checkout.html')) {
        setupCheckoutPage();
    }

    function setupCheckoutPage() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutTotal = document.getElementById('checkout-total');
        const checkoutMessage = document.getElementById('checkout-message');
        const paymentForm = document.getElementById('payment-form');
        const deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
        const deliveryDetailsSection = document.getElementById('delivery-details-section');

        let subtotal = 0;

        if (cart.length === 0) {
            if (orderSummaryItems) orderSummaryItems.style.display = 'none';
            if (checkoutMessage) checkoutMessage.style.display = 'block';
            if (document.querySelector('.summary-total')) document.querySelector('.summary-total').style.display = 'none';
            if (paymentForm) paymentForm.style.display = 'none';
        } else {
            if (checkoutMessage) checkoutMessage.style.display = 'none';
            if (orderSummaryItems) orderSummaryItems.style.display = 'block';
            if (document.querySelector('.summary-total')) document.querySelector('.summary-total').style.display = 'block';
            if (paymentForm) paymentForm.style.display = 'block';

            cart.forEach(item => {
                if (orderSummaryItems) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${item.name} x${item.quantity}</span>
                        <span class="item-price">N${(item.price * item.quantity).toLocaleString()}</span>
                    `;
                    orderSummaryItems.appendChild(listItem);
                }
                subtotal += item.price * item.quantity;
            });

            if (checkoutSubtotal) checkoutSubtotal.innerText = `N${subtotal.toLocaleString()}`;
            if (checkoutTotal) checkoutTotal.innerText = `N${subtotal.toLocaleString()}`;
        }

        // Delivery option handling
        deliveryOptions.forEach(option => {
            option.addEventListener('change', (event) => {
                if (event.target.value === 'delivery') {
                    if (deliveryDetailsSection) {
                        deliveryDetailsSection.style.display = 'block';
                        deliveryDetailsSection.querySelectorAll('input').forEach(input => input.required = true);
                    }
                } else {
                    if (deliveryDetailsSection) {
                        deliveryDetailsSection.style.display = 'none';
                        deliveryDetailsSection.querySelectorAll('input').forEach(input => input.required = false);
                    }
                }
            });
        });

        // Payment form submission
        if (paymentForm) {
            paymentForm.addEventListener('submit', handlePaymentSubmission);
        }

        function handlePaymentSubmission(event) {
            event.preventDefault();

            // Get customer information
            const customerName = document.getElementById('customer-name')?.value;
            const customerEmail = document.getElementById('customer-email')?.value;
            const customerPhoneMain = document.getElementById('customer-phone-main')?.value;

            // Validate customer information
            if (!customerName || !customerEmail || !customerPhoneMain) {
                alert('Please fill in all customer information fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerEmail)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Phone validation (basic)
            const phoneRegex = /^[0-9+\-\s()]{10,}$/;
            if (!phoneRegex.test(customerPhoneMain)) {
                alert('Please enter a valid phone number.');
                return;
            }

            const orderSummary = cart.map(item => `${item.name} x${item.quantity} (N${(item.price * item.quantity).toLocaleString()})`).join(', ');
            const orderTotal = `N${subtotal.toLocaleString()}`;
            const deliveryOption = document.querySelector('input[name="delivery-option"]:checked')?.value;
            const customerAddress = document.getElementById('customer-address')?.value;
            const customerPhone = document.getElementById('customer-phone')?.value;

            // Create personalized WhatsApp message
            let message = `Hello! My name is ${customerName} and I would like to place an order from Delikrafts Meals.\n\n*Customer Information:*\n- Name: ${customerName}\n- Email: ${customerEmail}\n- Phone: ${customerPhoneMain}\n\n*Order Details:*\n- Items: ${orderSummary}\n- Subtotal: ${orderTotal}\n- Order Option: ${deliveryOption}`;

            if (deliveryOption === 'delivery' && customerAddress && customerPhone) {
                message += `\n- Delivery Address: ${customerAddress}\n- Additional Contact: ${customerPhone}`;
            }

            message += `\n\n*Please confirm my order and provide the total cost including delivery fee if applicable.*\n\nI will make the bank transfer to:\nBank: Moniepoint MFB\nAccount: Delikrafts Global Nexus Ltd\nAccount Number: 6728341493\n\nThank you!`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/2349021520646?text=${encodedMessage}`;

            // Store customer data for future backend integration
            const customerData = {
                name: customerName,
                email: customerEmail,
                phone: customerPhoneMain,
                orderDate: new Date().toISOString(),
                orderItems: cart,
                orderTotal: subtotal,
                deliveryOption: deliveryOption,
                deliveryAddress: customerAddress || null
            };

            // Save to localStorage for now (can be sent to backend later)
            const customerDatabase = JSON.parse(localStorage.getItem('customerDatabase')) || [];
            customerDatabase.push(customerData);
            localStorage.setItem('customerDatabase', JSON.stringify(customerDatabase));

            // Clear cart after successful submission
            localStorage.removeItem('cart');
            cart = [];

            // Show success message before redirect
            const paymentStatus = document.getElementById('payment-status');
            if (paymentStatus) {
                paymentStatus.innerHTML = '<span style="color: green;">Order submitted successfully! Redirecting to WhatsApp...</span>';
            }

            // Redirect to WhatsApp after short delay
            setTimeout(() => {
                window.location.href = whatsappURL;
            }, 1500);
        }
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Close mobile menu when clicking on a link
    if (navMenu) {
        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('active');
            }
        });
    }

    // Add loading states for better UX
    function addLoadingState(element, originalText) {
        element.disabled = true;
        element.innerText = 'Loading...';
        setTimeout(() => {
            element.disabled = false;
            element.innerText = originalText;
        }, 1000);
    }

    // Lazy loading for images (if needed)
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
        }
    }

    // Initialize lazy loading
    setupLazyLoading();

    // Add fade-in animation for elements when they come into view
    function setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all product cards and sections
        document.querySelectorAll('.product-card, .testimonial-item, section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Initialize scroll animations
    setupScrollAnimations();
});