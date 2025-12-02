// Cart Management System - FIXED VERSION
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const saved = localStorage.getItem('sebknows_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('sebknows_cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product) {
        console.log('Adding to cart:', product); // Debug
        
        const existingItem = this.items.find(item => 
            item.id === product.id && 
            item.size === product.size && 
            item.color === product.color
        );

        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size: product.size || null,
                color: product.color || null,
                quantity: product.quantity || 1
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`);
        console.log('Cart after add:', this.items); // Debug
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.renderCart();
        this.showNotification('Item removed from cart');
    }

    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
            return;
        }
        this.items[index].quantity = quantity;
        this.saveCart();
        this.renderCart();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count');
        const count = this.getItemCount();
        console.log('Updating cart count:', count); // Debug
        
        countElements.forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartWithItems = document.getElementById('cart-with-items');

        if (!cartItemsContainer) return;

        console.log('Rendering cart, items:', this.items.length); // Debug

        if (this.items.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartWithItems) cartWithItems.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartWithItems) cartWithItems.style.display = 'grid';

        cartItemsContainer.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-meta">
                        ${item.size ? `Size: ${item.size}` : ''}
                        ${item.size && item.color ? ' • ' : ''}
                        ${item.color ? `Color: ${item.color}` : ''}
                    </p>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-price">
                    £${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-btn" onclick="cart.removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.updateSummary();
    }

    updateSummary() {
        const subtotal = this.getTotal();
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.20; // UK VAT 20%
        const total = subtotal + shipping + tax;

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = `£${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `£${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `£${total.toFixed(2)}`;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #FF4444 0%, #FF8844 100%);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 90%;
            pointer-events: none;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.renderCart();
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Checkout button handler
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => cart.checkout());
    }

    // Render cart if on cart page
    if (document.getElementById('cart-items')) {
        cart.renderCart();
    }
});