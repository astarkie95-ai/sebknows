// Checkout Page Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if cart has items
    if (cart.items.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'shop.html';
        return;
    }

    // Load order items
    loadOrderItems();
    
    // Update totals
    updateCheckoutTotals();
    
    // Payment method toggle
    setupPaymentMethods();
    
    // Shipping method change
    setupShippingMethods();
    
    // Place order
    setupPlaceOrder();
    
    // Auto-fill if logged in
    autoFillUserData();
    
    // Card formatting
    setupCardFormatting();
});

function loadOrderItems() {
    const container = document.getElementById('order-items');
    container.innerHTML = cart.items.map(item => `
        <div class="order-item-checkout">
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity}</p>
                ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                ${item.color ? `<p>Color: ${item.color}</p>` : ''}
            </div>
            <div class="order-item-price">
                £${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function updateCheckoutTotals() {
    const subtotal = cart.getTotal();
    const shippingCost = getShippingCost();
    const tax = subtotal * 0.20;
    const total = subtotal + shippingCost + tax;
    
    document.getElementById('checkout-subtotal').textContent = `£${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = `£${shippingCost.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `£${tax.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `£${total.toFixed(2)}`;
}

function getShippingCost() {
    const selected = document.querySelector('input[name="shipping"]:checked');
    if (!selected) return 5.99;
    
    switch(selected.value) {
        case 'standard': return 5.99;
        case 'express': return 12.99;
        case 'next-day': return 19.99;
        default: return 5.99;
    }
}

function setupPaymentMethods() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardPayment = document.getElementById('card-payment');
    const paypalPayment = document.getElementById('paypal-payment');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card') {
                cardPayment.style.display = 'block';
                paypalPayment.style.display = 'none';
            } else {
                cardPayment.style.display = 'none';
                paypalPayment.style.display = 'block';
            }
        });
    });
}

function setupShippingMethods() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', updateCheckoutTotals);
    });
}

function setupPlaceOrder() {
    const btn = document.getElementById('place-order-btn');
    btn.addEventListener('click', placeOrder);
}

function autoFillUserData() {
    if (Auth.isLoggedIn()) {
        const user = Auth.getCurrentUser();
        document.getElementById('email').value = user.email;
        
        // Check if user has saved address
        const savedAddress = localStorage.getItem(`address_${user.id}`);
        if (savedAddress) {
            const address = JSON.parse(savedAddress);
            document.getElementById('firstName').value = address.firstName || '';
            document.getElementById('lastName').value = address.lastName || '';
            document.getElementById('phone').value = address.phone || '';
            document.getElementById('address1').value = address.address1 || '';
            document.getElementById('address2').value = address.address2 || '';
            document.getElementById('city').value = address.city || '';
            document.getElementById('postcode').value = address.postcode || '';
            document.getElementById('country').value = address.country || 'GB';
        }
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVV = document.getElementById('cardCVV');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cardCVV) {
        cardCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }
}

function validateForm() {
    const required = [
        'firstName', 'lastName', 'email', 'phone',
        'address1', 'city', 'postcode', 'country'
    ];
    
    for (let field of required) {
        const input = document.getElementById(field);
        if (!input || !input.value.trim()) {
            alert(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').trim()}`);
            input.focus();
            return false;
        }
    }
    
    // Validate payment if card selected
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        
        if (!cardNumber || cardNumber.length < 13) {
            alert('Please enter a valid card number');
            return false;
        }
        
        if (!cardExpiry || cardExpiry.length !== 5) {
            alert('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        
        if (!cardCVV || cardCVV.length < 3) {
            alert('Please enter a valid CVV');
            return false;
        }
    }
    
    return true;
}

function placeOrder() {
    if (!validateForm()) return;
    
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Collect order data
    const orderData = {
        id: Date.now(),
        userId: Auth.isLoggedIn() ? Auth.getCurrentUser().id : 'guest',
        items: cart.items,
        shipping: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            city: document.getElementById('city').value,
            postcode: document.getElementById('postcode').value,
            country: document.getElementById('country').value
        },
        shippingMethod: document.querySelector('input[name="shipping"]:checked').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        subtotal: cart.getTotal(),
        shippingCost: getShippingCost(),
        tax: cart.getTotal() * 0.20,
        total: cart.getTotal() + getShippingCost() + (cart.getTotal() * 0.20),
        status: 'pending',
        date: new Date().toISOString(),
        trackingNumber: generateTrackingNumber()
    };
    
    // Save order
    const orders = JSON.parse(localStorage.getItem('sebknows_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('sebknows_orders', JSON.stringify(orders));
    
    // Save address for future use
    if (Auth.isLoggedIn()) {
        localStorage.setItem(`address_${orderData.userId}`, JSON.stringify(orderData.shipping));
    }
    
    // Simulate payment processing
    setTimeout(() => {
        // Clear cart
        cart.clear();
        
        // Redirect to success page
        localStorage.setItem('last_order', JSON.stringify(orderData));
        window.location.href = 'order-success.html';
    }, 2000);
}

function generateTrackingNumber() {
    const prefix = 'SK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;

}
