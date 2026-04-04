/* ============================================
   MediCap — State Management Store
   ============================================ */

const Store = {
    // Current state
    state: {
        currentPage: 'home',
        currentUser: null,
        isAuthenticated: false,
        theme: 'light',
        doctors: [],
        appointments: [],
        records: [],
        filters: {
            specialty: 'All',
            city: 'All',
            search: ''
        }
    },

    // Initialize store from localStorage
    init() {
        seedDatabase();

        // Load theme
        const savedTheme = localStorage.getItem('medicap_theme') || 'light';
        this.state.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Load user
        const savedUser = localStorage.getItem('medicap_user');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.state.isAuthenticated = true;
        }

        // Load data
        this.state.doctors = JSON.parse(localStorage.getItem('medicap_doctors') || '[]');
        this.state.appointments = JSON.parse(localStorage.getItem('medicap_appointments') || '[]');
        this.state.records = JSON.parse(localStorage.getItem('medicap_records') || '[]');
    },

    // Theme management
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

    // Auth management
    login(userData) {
        this.state.currentUser = userData;
        this.state.isAuthenticated = true;
        localStorage.setItem('medicap_user', JSON.stringify(userData));
        this.updateAuthUI();
    },

    logout() {
        this.state.currentUser = null;
        this.state.isAuthenticated = false;
        localStorage.removeItem('medicap_user');
        this.updateAuthUI();
    },

    updateAuthUI() {
        const loginBtn = document.getElementById('nav-login-btn');
        const userMenu = document.getElementById('user-menu');
        const displayName = document.getElementById('user-display-name');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');

        if (this.state.isAuthenticated && this.state.currentUser) {
            loginBtn?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
            if (displayName) {
                displayName.textContent = this.state.currentUser.name || 'User';
            }
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

    // Doctor helpers
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

    // Appointment helpers
    getAppointments() {
        return [...this.state.appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addAppointment(appointment) {
        appointment.id = 'apt-' + Date.now().toString(36);
        this.state.appointments.push(appointment);
        localStorage.setItem('medicap_appointments', JSON.stringify(this.state.appointments));
        return appointment;
    },

    updateAppointmentStatus(id, status) {
        const apt = this.state.appointments.find(a => a.id === id);
        if (apt) {
            apt.status = status;
            localStorage.setItem('medicap_appointments', JSON.stringify(this.state.appointments));
        }
    },

    cancelAppointment(id) {
        this.updateAppointmentStatus(id, 'cancelled');
    },

    // Records helpers
    getRecords() {
        return [...this.state.records].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addRecord(record) {
        record.id = 'rec-' + Date.now().toString(36);
        this.state.records.push(record);
        localStorage.setItem('medicap_records', JSON.stringify(this.state.records));
        return record;
    },

    // Navigation
    setPage(page) {
        this.state.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Stats
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
    }
};
