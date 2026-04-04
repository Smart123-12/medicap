/* ============================================
   MediCap — State Management Store
   (API-integrated version)
   ============================================ */

const API_BASE = '/api';

const Store = {
    // Current state
    state: {
        currentPage: 'home',
        currentUser: null,
        isAuthenticated: false,
        token: null,
        theme: 'light',
        doctors: [],
        appointments: [],
        records: [],
        adminUsers: [],
        filters: {
            specialty: 'All',
            city: 'All',
            search: ''
        }
    },

    // Initialize store
    async init() {
        // Load theme
        const savedTheme = localStorage.getItem('medicap_theme') || 'light';
        this.state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Load token & verify session
        const savedToken = localStorage.getItem('medicap_token');
        if (savedToken) {
            this.state.token = savedToken;
            await this.verifySession();
        }

        // Load doctors (public endpoint)
        await this.fetchDoctors();

        // If authenticated, load appointments and records
        if (this.state.isAuthenticated) {
            await this.fetchAppointments();
            await this.fetchRecords();
        } else {
            // Fallback to localStorage for demo/offline mode
            this._loadLocalData();
        }
    },

    // Fallback local data for offline/demo
    _loadLocalData() {
        seedDatabase(); // from data.js
        this.state.appointments = JSON.parse(localStorage.getItem('medicap_appointments') || '[]');
        this.state.records = JSON.parse(localStorage.getItem('medicap_records') || '[]');
        if (this.state.doctors.length === 0) {
            this.state.doctors = JSON.parse(localStorage.getItem('medicap_doctors') || '[]');
        }
    },

    // ==================== API Helper ====================
    async apiCall(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.state.token) {
            headers['Authorization'] = `Bearer ${this.state.token}`;
        }

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            return data;
        } catch (err) {
            // If API unreachable, silently fallback
            if (err.message && err.message.includes('Failed to fetch')) {
                console.warn('API unreachable, using offline mode.');
                return null;
            }
            throw err;
        }
    },

    // ==================== AUTH ====================
    async verifySession() {
        try {
            const data = await this.apiCall('/auth/me');
            if (data && data.user) {
                this.state.currentUser = data.user;
                this.state.isAuthenticated = true;
            } else {
                this._clearAuth();
            }
        } catch (err) {
            // Token invalid — try localStorage fallback
            const savedUser = localStorage.getItem('medicap_user');
            if (savedUser) {
                this.state.currentUser = JSON.parse(savedUser);
                this.state.isAuthenticated = true;
            } else {
                this._clearAuth();
            }
        }
    },

    async login(email, password) {
        try {
            const data = await this.apiCall('/auth/login', 'POST', { email, password });
            if (data && data.token) {
                this.state.token = data.token;
                this.state.currentUser = data.user;
                this.state.isAuthenticated = true;
                localStorage.setItem('medicap_token', data.token);
                localStorage.setItem('medicap_user', JSON.stringify(data.user));
                this.updateAuthUI();
                await this.fetchAppointments();
                await this.fetchRecords();
                return { success: true, user: data.user };
            }
        } catch (err) {
            // Offline fallback — demo login
            if (err.message && err.message.includes('Failed to fetch')) {
                return this._offlineLogin(email, password);
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: 'Login failed.' };
    },

    async register(userData) {
        try {
            const data = await this.apiCall('/auth/register', 'POST', userData);
            if (data && data.token) {
                this.state.token = data.token;
                this.state.currentUser = data.user;
                this.state.isAuthenticated = true;
                localStorage.setItem('medicap_token', data.token);
                localStorage.setItem('medicap_user', JSON.stringify(data.user));
                this.updateAuthUI();
                return { success: true, user: data.user };
            }
        } catch (err) {
            if (err.message && err.message.includes('Failed to fetch')) {
                return this._offlineRegister(userData);
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: 'Registration failed.' };
    },

    _offlineLogin(email, password) {
        // For offline/demo mode — simulate login
        const userData = {
            id: 'usr-demo',
            name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email,
            role: 'patient',
            city: 'Ahmedabad',
            phone: '+91 98765 43210'
        };
        this.state.currentUser = userData;
        this.state.isAuthenticated = true;
        localStorage.setItem('medicap_user', JSON.stringify(userData));
        this.updateAuthUI();
        this._loadLocalData();
        return { success: true, user: userData, offline: true };
    },

    _offlineRegister(userData) {
        const user = {
            id: 'usr-' + Date.now().toString(36),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'patient',
            city: userData.city || 'Ahmedabad'
        };
        this.state.currentUser = user;
        this.state.isAuthenticated = true;
        localStorage.setItem('medicap_user', JSON.stringify(user));
        this.updateAuthUI();
        this._loadLocalData();
        return { success: true, user, offline: true };
    },

    logout() {
        this._clearAuth();
        this.updateAuthUI();
    },

    _clearAuth() {
        this.state.token = null;
        this.state.currentUser = null;
        this.state.isAuthenticated = false;
        this.state.appointments = [];
        this.state.records = [];
        localStorage.removeItem('medicap_token');
        localStorage.removeItem('medicap_user');
    },

    async updateProfile(profileData) {
        try {
            const data = await this.apiCall('/auth/profile', 'PUT', profileData);
            if (data && data.user) {
                this.state.currentUser = data.user;
                localStorage.setItem('medicap_user', JSON.stringify(data.user));
                this.updateAuthUI();
                return { success: true };
            }
        } catch (err) {
            // Offline fallback
            if (this.state.currentUser) {
                Object.assign(this.state.currentUser, profileData);
                localStorage.setItem('medicap_user', JSON.stringify(this.state.currentUser));
                this.updateAuthUI();
                return { success: true, offline: true };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: 'Update failed.' };
    },

    async changePassword(currentPassword, newPassword) {
        try {
            const data = await this.apiCall('/auth/password', 'PUT', { currentPassword, newPassword });
            return { success: true, message: data.message };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    // ==================== THEME ====================
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('medicap_theme', this.state.theme);
        this.updateThemeIcon();
    },

    updateThemeIcon() {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const icon = btn.querySelector('.material-icons-round');
            icon.textContent = this.state.theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
    },

    // ==================== UI ====================
    updateAuthUI() {
        const loginBtn = document.getElementById('nav-login-btn');
        const userMenu = document.getElementById('user-menu');
        const displayName = document.getElementById('user-display-name');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');

        if (this.state.isAuthenticated && this.state.currentUser) {
            loginBtn?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
            if (displayName) displayName.textContent = this.state.currentUser.name || 'User';
            if (mobileLoginBtn) {
                mobileLoginBtn.textContent = 'Dashboard';
                mobileLoginBtn.setAttribute('data-page', 'dashboard');
            }
        } else {
            loginBtn?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
            if (mobileLoginBtn) {
                mobileLoginBtn.textContent = 'Login / Register';
                mobileLoginBtn.setAttribute('data-page', 'login');
            }
        }
    },

    // ==================== DOCTORS ====================
    async fetchDoctors() {
        try {
            const data = await this.apiCall('/doctors');
            if (data && data.doctors) {
                this.state.doctors = data.doctors;
                return;
            }
        } catch (err) {
            console.warn('Could not fetch doctors from API');
        }
        // Fallback
        if (this.state.doctors.length === 0) {
            seedDatabase();
            this.state.doctors = JSON.parse(localStorage.getItem('medicap_doctors') || '[]');
        }
    },

    getDoctors(filters = {}) {
        let docs = [...this.state.doctors];
        if (filters.specialty && filters.specialty !== 'All') {
            docs = docs.filter(d => d.specialty === filters.specialty);
        }
        if (filters.city && filters.city !== 'All') {
            docs = docs.filter(d => d.city === filters.city);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            docs = docs.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.specialty.toLowerCase().includes(q) ||
                d.hospital.toLowerCase().includes(q)
            );
        }
        return docs;
    },

    getDoctorById(id) {
        return this.state.doctors.find(d => d.id === id);
    },

    // ==================== APPOINTMENTS ====================
    async fetchAppointments() {
        try {
            const data = await this.apiCall('/appointments');
            if (data && data.appointments) {
                this.state.appointments = data.appointments;
                return;
            }
        } catch (err) {
            console.warn('Could not fetch appointments from API');
        }
    },

    getAppointments() {
        return [...this.state.appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async addAppointment(appointment) {
        try {
            const data = await this.apiCall('/appointments', 'POST', appointment);
            if (data && data.appointment) {
                this.state.appointments.push(data.appointment);
                return data.appointment;
            }
        } catch (err) {
            // Offline fallback
            appointment.id = 'apt-' + Date.now().toString(36);
            this.state.appointments.push(appointment);
            localStorage.setItem('medicap_appointments', JSON.stringify(this.state.appointments));
            return appointment;
        }
    },

    async cancelAppointment(id) {
        try {
            await this.apiCall(`/appointments/${id}/cancel`, 'PUT');
        } catch (err) {
            // Offline fallback
        }
        const apt = this.state.appointments.find(a => a.id === id);
        if (apt) apt.status = 'cancelled';
    },

    // ==================== RECORDS ====================
    async fetchRecords() {
        try {
            const data = await this.apiCall('/records');
            if (data && data.records) {
                this.state.records = data.records;
                return;
            }
        } catch (err) {
            console.warn('Could not fetch records from API');
        }
    },

    getRecords() {
        return [...this.state.records].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // ==================== ADMIN ====================
    async fetchAdminUsers() {
        try {
            const data = await this.apiCall('/admin/users');
            if (data && data.users) {
                this.state.adminUsers = data.users;
                return;
            }
        } catch (err) {
            console.warn('Could not fetch admin users');
        }
    },

    // ==================== STATS ====================
    getStats() {
        const now = new Date();
        const upcoming = this.state.appointments.filter(a =>
            new Date(a.date) >= now && a.status !== 'cancelled'
        ).length;
        const completed = this.state.appointments.filter(a => a.status === 'completed').length;

        return {
            totalDoctors: this.state.doctors.length,
            totalAppointments: this.state.appointments.length,
            upcomingAppointments: upcoming,
            completedAppointments: completed,
            totalRecords: this.state.records.length,
            citiesServed: [...new Set(this.state.doctors.map(d => d.city))].length
        };
    },

    // Navigation
    setPage(page) {
        this.state.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
