// Authentication System
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Create default admin account if it doesn't exist
        const users = this.getAllUsers();
        if (!users.find(u => u.email === 'admin@sebknowsirl.com')) {
            this.createUser({
                name: 'Admin',
                email: 'admin@sebknowsirl.com',
                password: 'admin123',
                role: 'admin'
            });
        }
        
        // Create demo customer account
        if (!users.find(u => u.email === 'customer@test.com')) {
            this.createUser({
                name: 'Demo Customer',
                email: 'customer@test.com',
                password: 'password123',
                role: 'customer'
            });
        }

        this.updateUserMenu();
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem('sebknows_users') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('sebknows_users', JSON.stringify(users));
    }

    createUser(userData) {
        const users = this.getAllUsers();
        const user = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In production, this should be hashed!
            role: userData.role || 'customer',
            createdAt: new Date().toISOString()
        };
        users.push(user);
        this.saveUsers(users);
        return user;
    }

    register(name, email, password) {
        const users = this.getAllUsers();
        
        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return false;
        }

        this.createUser({ name, email, password, role: 'customer' });
        return true;
    }

    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current session
            localStorage.setItem('sebknows_current_user', JSON.stringify(user));
            this.updateUserMenu();
            return true;
        }
        
        return false;
    }

    logout() {
        localStorage.removeItem('sebknows_current_user');
        this.updateUserMenu();
        window.location.href = 'index.html';
    }

    isLoggedIn() {
        return localStorage.getItem('sebknows_current_user') !== null;
    }

    getCurrentUser() {
        const userJson = localStorage.getItem('sebknows_current_user');
        return userJson ? JSON.parse(userJson) : null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    updateUserMenu() {
        const userMenus = document.querySelectorAll('#user-menu');
        
        userMenus.forEach(menu => {
            if (this.isLoggedIn()) {
                const user = this.getCurrentUser();
                menu.innerHTML = `
                    <div class="user-dropdown">
                        <button class="user-btn">
                            <i class="fas fa-user-circle"></i>
                            <span>${user.name}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown-menu">
                            ${user.role === 'admin' ? 
                                '<a href="admin.html"><i class="fas fa-crown"></i> Admin Panel</a>' : 
                                '<a href="account.html"><i class="fas fa-user"></i> My Account</a>'
                            }
                            <a href="account.html"><i class="fas fa-box"></i> Orders</a>
                            <a href="#" onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                        </div>
                    </div>
                `;

                // Add dropdown functionality
                const userBtn = menu.querySelector('.user-btn');
                const dropdown = menu.querySelector('.user-dropdown-menu');
                
                if (userBtn && dropdown) {
                    userBtn.onclick = (e) => {
                        e.stopPropagation();
                        dropdown.classList.toggle('show');
                    };

                    document.addEventListener('click', () => {
                        dropdown.classList.remove('show');
                    });
                }
            } else {
                menu.innerHTML = `
                    <a href="login.html" class="btn btn-outline btn-small">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </a>
                `;
            }
        });
    }
}

// Initialize authentication system
const Auth = new AuthSystem();

// Update user menu on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateUserMenu();

});
