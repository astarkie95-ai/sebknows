// Admin Dashboard Management - COMPLETE VERSION

// Check if user is admin
if (!Auth.isAdmin()) {
    alert('Access denied! Admin only.');
    window.location.href = 'index.html';
}

// Display admin name
const adminUser = Auth.getCurrentUser();
document.getElementById('admin-name').textContent = adminUser.name;

// Product Management
class ProductManager {
    constructor() {
        this.currentImageData = null;
        this.loadProducts();
        this.updateStats();
        this.setupImageUpload();
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('product-image');
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--dark)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--dark)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            const preview = document.getElementById('image-preview');
            const placeholder = document.getElementById('upload-placeholder');
            
            preview.src = this.currentImageData;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    getAllProducts() {
        return JSON.parse(localStorage.getItem('sebknows_products') || '[]');
    }

    saveProducts(products) {
        localStorage.setItem('sebknows_products', JSON.stringify(products));
        this.loadProducts();
        this.updateStats();
    }

    loadProducts() {
        const products = this.getAllProducts();
        const tbody = document.getElementById('products-tbody');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No products yet. Click "Add New Product" to get started!</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <div class="product-img-cell">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                </td>
                <td><strong>${product.name}</strong></td>
                <td><span class="category-badge">${product.category}</span></td>
                <td>£${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.inStock ? 'status-active' : 'status-inactive'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleStock(${product.id})" title="Toggle Stock">
                        <i class="fas fa-${product.inStock ? 'eye-slash' : 'eye'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addProduct(productData) {
        const products = this.getAllProducts();
        const product = {
            id: Date.now(),
            name: productData.name,
            category: productData.category,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock),
            image: productData.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%231a1f3a" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="100" fill="%23666"%3E?%3C/text%3E%3C/svg%3E',
            badge: productData.badge || '',
            sizes: productData.sizes || [],
            colors: productData.colors || [],
            inStock: productData.inStock !== false,
            createdAt: new Date().toISOString()
        };
        products.push(product);
        this.saveProducts(products);
        return product;
    }

    updateProduct(id, productData) {
        const products = this.getAllProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name: productData.name,
                category: productData.category,
                price: parseFloat(productData.price),
                stock: parseInt(productData.stock),
                image: productData.image || products[index].image,
                badge: productData.badge || '',
                sizes: productData.sizes || [],
                colors: productData.colors || [],
                inStock: productData.inStock !== false
            };
            this.saveProducts(products);
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const products = this.getAllProducts();
        const filtered = products.filter(p => p.id !== id);
        this.saveProducts(filtered);
    }

    toggleStock(id) {
        const products = this.getAllProducts();
        const product = products.find(p => p.id === id);
        if (product) {
            product.inStock = !product.inStock;
            this.saveProducts(products);
        }
    }

    getProduct(id) {
        return this.getAllProducts().find(p => p.id === id);
    }

    updateStats() {
        const products = this.getAllProducts();
        const orders = JSON.parse(localStorage.getItem('sebknows_orders') || '[]');
        
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('active-products').textContent = products.filter(p => p.inStock).length;
        document.getElementById('total-orders').textContent = orders.length;
        
        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('total-revenue').textContent = '£' + revenue.toFixed(2);
    }
}

const productManager = new ProductManager();

// Modal Functions
function showAddProductModal() {
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus"></i> Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-status').checked = true;
    
    // Reset image
    productManager.currentImageData = null;
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'flex';
    
    document.getElementById('product-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function editProduct(id) {
    const product = productManager.getProduct(id);
    if (!product) return;

    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-sizes').value = product.sizes.join(', ');
    document.getElementById('product-colors').value = product.colors.join(', ');
    document.getElementById('product-status').checked = product.inStock;
    
    // Set image
    productManager.currentImageData = product.image;
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    preview.src = product.image;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    
    document.getElementById('product-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
        productManager.deleteProduct(id);
        showNotification('Product deleted successfully!', 'success');
    }
}

function toggleStock(id) {
    productManager.toggleStock(id);
    showNotification('Product stock status updated!', 'success');
}

// Form Submit
document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: document.getElementById('product-price').value,
        stock: document.getElementById('product-stock').value,
        image: productManager.currentImageData,
        badge: document.getElementById('product-badge').value,
        sizes: document.getElementById('product-sizes').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s),
        colors: document.getElementById('product-colors').value
            .split(',')
            .map(c => c.trim())
            .filter(c => c),
        inStock: document.getElementById('product-status').checked
    };

    if (!productData.image) {
        showNotification('Please upload a product image!', 'error');
        return;
    }

    if (id) {
        productManager.updateProduct(parseInt(id), productData);
        showNotification('Product updated successfully!', 'success');
    } else {
        productManager.addProduct(productData);
        showNotification('Product added successfully!', 'success');
    }

    closeProductModal();
});

// Settings Modal
function showSettingsModal() {
    const settings = JSON.parse(localStorage.getItem('sebknows_settings') || '{}');
    
    if (settings.subscribers) document.getElementById('manual-subs').value = settings.subscribers;
    if (settings.videos) document.getElementById('manual-videos').value = settings.videos;
    if (settings.views) document.getElementById('manual-views').value = settings.views;
    if (settings.orders) document.getElementById('manual-orders').value = settings.orders;
    
    document.getElementById('settings-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
    document.body.style.overflow = '';
}

document.getElementById('settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const settings = {
        subscribers: parseInt(document.getElementById('manual-subs').value) || 0,
        videos: parseInt(document.getElementById('manual-videos').value) || 0,
        views: parseInt(document.getElementById('manual-views').value) || 0,
        orders: parseInt(document.getElementById('manual-orders').value) || 0
    };
    
    localStorage.setItem('sebknows_settings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
    closeSettingsModal();
});

// Change About Image
function changeAboutImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem('sebknows_about_image', event.target.result);
                showNotification('About page image updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Load orders
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('sebknows_orders') || '[]');
    const tbody = document.getElementById('orders-tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.slice(0, 10).map(order => {
        const users = JSON.parse(localStorage.getItem('sebknows_users') || '[]');
        const user = users.find(u => u.id === order.userId);
        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${user ? user.name : 'Guest'}</td>
                <td>${order.items.length}</td>
                <td>£${order.total.toFixed(2)}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            </tr>
        `;
    }).join('');
}

loadOrders();

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#F44336' : 'linear-gradient(135deg, #FF4444 0%, #FF8844 100%)';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);

}
