// Product Management with Wishlist Support

// Wishlist Management
class WishlistManager {
    constructor() {
        this.items = this.loadWishlist();
    }

    loadWishlist() {
        return JSON.parse(localStorage.getItem('sebknows_wishlist') || '[]');
    }

    saveWishlist() {
        localStorage.setItem('sebknows_wishlist', JSON.stringify(this.items));
    }

    toggle(productId) {
        const index = this.items.indexOf(productId);
        if (index > -1) {
            this.items.splice(index, 1);
            return false;
        } else {
            this.items.push(productId);
            return true;
        }
        this.saveWishlist();
    }

    isInWishlist(productId) {
        return this.items.includes(productId);
    }
}

const wishlist = new WishlistManager();

// Product Functions
function getAllProducts() {
    return JSON.parse(localStorage.getItem('sebknows_products') || '[]');
}

function getActiveProducts() {
    return getAllProducts().filter(p => p.inStock);
}

function addToCartFromCard(productId) {
    const product = getAllProducts().find(p => p.id === productId);
    if (!product) return;

    cart.addItem({
        ...product,
        quantity: 1,
        size: product.sizes?.[0] || null,
        color: product.colors?.[0] || null
    });

    cart.showNotification("Added to cart 🛒");
}

// Product Card Creation with Wishlist
function createProductCard(product) {
    const inWishlist = wishlist.isInWishlist(product.id);
    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="product-img">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <button class="wishlist-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlist(${product.id}, event)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">£${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-primary btn-small" onclick="addToCartFromCard(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle Wishlist
function toggleWishlist(productId, event) {
    event.stopPropagation();
    const added = wishlist.toggle(productId);
    wishlist.saveWishlist();
    
    const btn = event.currentTarget;
    btn.classList.toggle('active');
    
    const message = added ? 'Added to wishlist! ❤️' : 'Removed from wishlist';
    if (typeof cart !== 'undefined') {
        cart.showNotification(message);
    }
}

// Product Modal
function showProductModal(productId) {
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const hasSize = product.sizes && product.sizes.length > 0;
    const hasColor = product.colors && product.colors.length > 0;
    const inWishlist = wishlist.isInWishlist(product.id);

    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-grid">
                <div class="modal-image">
                    <div class="product-image-large">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                </div>
                <div class="modal-details">
                    <h2>${product.name}</h2>
                    <p class="modal-category">${product.category}</p>
                    <p class="modal-price">£${product.price.toFixed(2)}</p>
                    <p class="modal-stock">
                        <i class="fas fa-box"></i>
                        ${product.stock} in stock
                    </p>
                    
                    <button class="btn btn-outline btn-small wishlist-modal-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlistModal(${product.id})">
                        <i class="fas fa-heart"></i>
                        <span>${inWishlist ? 'Remove from' : 'Add to'} Wishlist</span>
                    </button>
                    
                    ${hasSize ? `
                        <div class="modal-option">
                            <label>Size:</label>
                            <div class="size-options" id="size-options">
                                ${product.sizes.map(size => `
                                    <button class="size-btn" data-size="${size}">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${hasColor ? `
                        <div class="modal-option">
                            <label>Color:</label>
                            <div class="color-options" id="color-options">
                                ${product.colors.map(color => `
                                    <button class="color-btn" data-color="${color}">${color}</button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="modal-quantity">
                        <label>Quantity:</label>
                        <div class="quantity-selector">
                            <button onclick="updateModalQty(-1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span id="modal-qty">1</span>
                            <button onclick="updateModalQty(1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary btn-block" onclick="addToCartFromModal(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart - £${product.price.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        if (hasSize) {
            document.querySelectorAll('.size-btn').forEach(btn => {
                btn.onclick = function() {
                    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                };
                if (btn.dataset.size === product.sizes[0]) btn.click();
            });
        }
        
        if (hasColor) {
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.onclick = function() {
                    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                };
                if (btn.dataset.color === product.colors[0]) btn.click();
            });
        }
    }, 100);
}

function toggleWishlistModal(productId) {
    const added = wishlist.toggle(productId);
    wishlist.saveWishlist();
    
    const btn = document.querySelector('.wishlist-modal-btn');
    btn.classList.toggle('active');
    btn.querySelector('span').textContent = added ? 'Remove from Wishlist' : 'Add to Wishlist';
    
    if (typeof cart !== 'undefined') {
        cart.showNotification(added ? 'Added to wishlist! ❤️' : 'Removed from wishlist');
    }
}

function closeModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function updateModalQty(change) {
    const qtyEl = document.getElementById('modal-qty');
    let qty = parseInt(qtyEl.textContent);
    qty = Math.max(1, qty + change);
    qtyEl.textContent = qty;
}

function addToCartFromModal(productId) {
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);
    const qty = parseInt(document.getElementById('modal-qty').textContent);
    
    const selectedSize = document.querySelector('.size-btn.selected');
    const selectedColor = document.querySelector('.color-btn.selected');
    
    cart.addItem({
        ...product,
        quantity: qty,
        size: selectedSize ? selectedSize.dataset.size : null,
        color: selectedColor ? selectedColor.dataset.color : null
    });
    
    closeModal();
}

// Render Products
function renderProducts(container, productList) {
    if (!container) return;
    
    if (productList.length === 0) {
        container.innerHTML = '';
        const noProductsMsg = document.getElementById('no-products-message');
        if (noProductsMsg) noProductsMsg.style.display = 'block';
        
        const viewAllBtn = document.getElementById('view-all-btn');
        if (viewAllBtn) viewAllBtn.style.display = 'none';
        return;
    }
    
    const noProductsMsg = document.getElementById('no-products-message');
    if (noProductsMsg) noProductsMsg.style.display = 'none';
    
    const viewAllBtn = document.getElementById('view-all-btn');
    if (viewAllBtn) viewAllBtn.style.display = 'block';
    
    container.innerHTML = productList.map(createProductCard).join('');
}

// Filter Products
function filterProducts(category) {
    const products = getActiveProducts();
    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    const container = document.getElementById('all-products');
    renderProducts(container, filtered);
}

// Load and Display Stats
function loadStats() {
    const settings = JSON.parse(localStorage.getItem('sebknows_settings') || '{}');
    const orders = JSON.parse(localStorage.getItem('sebknows_orders') || '[]');
    
    const stats = [
        { icon: 'users', value: settings.subscribers || 0, label: 'Subscribers' },
        { icon: 'video', value: settings.videos || 0, label: 'Videos' },
        { icon: 'box', value: settings.orders || orders.length || 0, label: 'Orders Shipped' },
        { icon: 'star', value: Math.floor((settings.subscribers || 0) * 0.01), label: '5-Star Reviews' }
    ];
    
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <i class="fas fa-${stat.icon}"></i>
                <h3 class="stat-number" data-target="${stat.value}">0</h3>
                <p class="stat-label">${stat.label}</p>
            </div>
        `).join('');
        
        setTimeout(animateStats, 300);
    }
    
    // About page stats
    const aboutStats = document.getElementById('about-stats-mini');
    if (aboutStats) {
        aboutStats.innerHTML = `
            <div class="stat-mini">
                <h4>${(settings.subscribers || 0).toLocaleString()}</h4>
                <p>Subscribers</p>
            </div>
            <div class="stat-mini">
                <h4>${(settings.videos || 0).toLocaleString()}</h4>
                <p>Videos</p>
            </div>
            <div class="stat-mini">
                <h4>${(settings.views || 0).toLocaleString()}</h4>
                <p>Views</p>
            </div>
        `;
    }
}

// Load About Page Image
function loadAboutImage() {
    const aboutImg = document.getElementById('about-page-image');
    if (aboutImg) {
        const customImage = localStorage.getItem('sebknows_about_image');
        if (customImage) {
            aboutImg.src = customImage;
        }
    }
}

// Stats Counter Animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            if (entry.target.classList.contains('stats-section')) {
                animateStats();
            }
        }
    });
}, observerOptions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const activeProducts = getActiveProducts();
    
    // Load stats
    loadStats();
    loadAboutImage();
    
    // Render featured products
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        renderProducts(featuredContainer, activeProducts.slice(0, 4));
    }

    // Render all products
    const allProductsContainer = document.getElementById('all-products');
    if (allProductsContainer) {
        renderProducts(allProductsContainer, activeProducts);
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.category);
        });
    });

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            let sorted = [...getActiveProducts()];
            
            switch(this.value) {
                case 'price-low':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    sorted.reverse();
                    break;
            }
            
            renderProducts(allProductsContainer, sorted);
        });
    }

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Newsletter form
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof cart !== 'undefined') {
                cart.showNotification('Thanks for subscribing! 🎉');
            }
            form.reset();
        });
    });

    // Observe sections for animations
    document.querySelectorAll('.featured-products, .stats-section, .about-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        }
    });
});

// === RUNTIME FIXES ===
// Ensure wishlist changes are always saved
if (typeof WishlistManager !== 'undefined') {
    WishlistManager.prototype._originalToggle = WishlistManager.prototype.toggle;
    WishlistManager.prototype.toggle = function(productId) {
        const result = this._originalToggle(productId);
        this.saveWishlist();
        return result;
    };
}
