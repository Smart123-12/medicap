/* ============================================
   MediCap — Main Application Controller
   ============================================ */

const App = {
    // Current booking context
    _bookingDoctorId: null,
    _filterDebounce: null,

    // Initialize application
    init() {
        Store.init();
        Store.updateThemeIcon();
        Store.updateAuthUI();
        this.bindNavigation();
        this.bindTheme();
        this.bindMobileNav();
        this.bindScroll();
        this.renderPage('home');
        this.hidePreloader();
    },

    // Hide preloader after load
    hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
        }, 800);
    },

    // ========== NAVIGATION ==========
    bindNavigation() {
        // Desktop nav links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // User dropdown toggle
        const avatarBtn = document.getElementById('user-avatar-btn');
        const dropdown = document.getElementById('user-dropdown');
        if (avatarBtn && dropdown) {
            avatarBtn.addEventListener('click', () => {
                dropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    },

    bindTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => Store.toggleTheme());
        }
    },

    bindMobileNav() {
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobile-nav');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileClose = document.getElementById('mobile-close');

        const openMobile = () => {
            mobileNav.classList.remove('hidden');
            mobileOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        const closeMobile = () => {
            mobileNav.classList.add('hidden');
            mobileOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        };

        hamburger?.addEventListener('click', openMobile);
        mobileClose?.addEventListener('click', closeMobile);
        mobileOverlay?.addEventListener('click', closeMobile);

        // Mobile nav links
        document.querySelectorAll('.mobile-link, #mobile-login-btn').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                closeMobile();
                this.navigateTo(page);
            });
        });
    },

    bindScroll() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('main-nav');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            lastScroll = window.scrollY;
        });
    },

    navigateTo(page, doctorId = null, city = null) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.mobile-link').forEach(l => l.classList.remove('active'));

        const navPage = page === 'book-appointment' ? 'appointments' : page;
        document.querySelectorAll(`[data-page="${navPage}"]`).forEach(l => l.classList.add('active'));

        // Close dropdown
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.add('hidden');

        // Render page
        if (page === 'book-appointment' && doctorId) {
            this._bookingDoctorId = doctorId;
            this.renderPage('book-appointment', doctorId);
        } else if (page === 'doctors' && city) {
            Store.state.filters.city = city;
            this.renderPage('doctors');
        } else {
            Store.state.filters = { specialty: 'All', city: 'All', search: '' };
            this.renderPage(page);
        }

        Store.setPage(page);
    },

    renderPage(page, arg = null) {
        const content = document.getElementById('app-content');
        const footer = document.getElementById('main-footer');

        // Show/hide footer for auth pages
        if (page === 'login' || page === 'register') {
            footer.style.display = 'none';
        } else {
            footer.style.display = '';
        }

        switch (page) {
            case 'home':
                content.innerHTML = Pages.home();
                break;
            case 'doctors':
                content.innerHTML = Pages.doctors(Store.state.filters);
                break;
            case 'appointments':
                content.innerHTML = Pages.appointments();
                break;
            case 'book-appointment':
                content.innerHTML = Pages.bookAppointment(arg);
                this.bindBookingDateListener();
                break;
            case 'records':
                content.innerHTML = Pages.records();
                break;
            case 'dashboard':
                content.innerHTML = Pages.dashboard();
                break;
            case 'login':
                content.innerHTML = Pages.login();
                break;
            case 'register':
                content.innerHTML = Pages.register();
                break;
            case 'profile':
                content.innerHTML = Pages.profile();
                break;
            default:
                content.innerHTML = Pages.home();
        }

        // Trigger animations
        this.triggerAnimations();
    },

    triggerAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => {
            observer.observe(el);
        });
    },

    // ========== DOCTOR FILTERS ==========
    filterDoctors(type, value) {
        Store.state.filters[type] = value;

        if (type === 'search') {
            clearTimeout(this._filterDebounce);
            this._filterDebounce = setTimeout(() => {
                this.renderPage('doctors');
            }, 300);
        } else {
            this.renderPage('doctors');
        }
    },

    // ========== APPOINTMENT MANAGEMENT ==========
    switchAppointmentTab(tab, btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('appointments-upcoming').classList.toggle('hidden', tab !== 'upcoming');
        document.getElementById('appointments-past').classList.toggle('hidden', tab !== 'past');
    },

    cancelAppointment(id) {
        Components.showModal(
            'Cancel Appointment',
            `<p style="color:var(--text-secondary); margin-bottom:var(--space-4);">Are you sure you want to cancel this appointment? This action cannot be undone.</p>`,
            `<button class="btn btn-secondary" onclick="Components.closeModal()" id="cancel-modal-no">Keep Appointment</button>
             <button class="btn btn-danger" onclick="App.confirmCancel('${id}')" id="cancel-modal-yes">Yes, Cancel</button>`
        );
    },

    confirmCancel(id) {
        Store.cancelAppointment(id);
        Components.closeModal();
        this.renderPage('appointments');
        Components.showToast('success', 'Cancelled', 'Your appointment has been cancelled.');
    },

    rescheduleAppointment(id) {
        Components.showToast('info', 'Reschedule', 'Please cancel and rebook to reschedule your appointment.');
    },

    // ========== BOOKING ==========
    selectTimeSlot(element, time) {
        if (element.classList.contains('unavailable')) return;

        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        element.classList.add('selected');
        document.getElementById('booking-time').value = time;

        const summaryTime = document.getElementById('summary-time');
        if (summaryTime) summaryTime.textContent = time;
    },

    bindBookingDateListener() {
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                const summaryDate = document.getElementById('summary-date');
                if (summaryDate && e.target.value) {
                    const date = new Date(e.target.value);
                    summaryDate.textContent = date.toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                }
            });
        }
    },

    submitBooking(e) {
        e.preventDefault();

        const name = document.getElementById('booking-name').value;
        const phone = document.getElementById('booking-phone').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const type = document.getElementById('booking-type').value;
        const notes = document.getElementById('booking-notes').value;
        const doctorId = document.getElementById('booking-doctor-id').value;

        if (!time) {
            Components.showToast('error', 'Time Required', 'Please select a time slot for your appointment.');
            return;
        }

        if (!date) {
            Components.showToast('error', 'Date Required', 'Please select a date for your appointment.');
            return;
        }

        const appointment = {
            doctorId,
            patientName: name,
            date,
            time,
            type,
            status: 'confirmed',
            notes
        };

        Store.addAppointment(appointment);
        Components.showToast('success', 'Booked!', `Your appointment has been confirmed for ${date} at ${time}.`);

        setTimeout(() => {
            this.navigateTo('appointments');
        }, 1500);
    },

    // ========== AUTH ==========
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            Components.showToast('error', 'Error', 'Please fill in all fields.');
            return;
        }

        // Simulate login
        const userData = {
            name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email,
            role: 'patient',
            city: 'Ahmedabad',
            phone: '+91 98765 43210'
        };

        Store.login(userData);
        Components.showToast('success', 'Welcome!', `Logged in as ${userData.name}`);

        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1000);
    },

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const city = document.getElementById('register-city').value;
        const role = document.getElementById('register-role').value;
        const password = document.getElementById('register-password').value;

        if (!name || !email || !phone || !city || !password) {
            Components.showToast('error', 'Error', 'Please fill in all required fields.');
            return;
        }

        const userData = { name, email, phone, city, role };
        Store.login(userData);
        Components.showToast('success', 'Account Created!', `Welcome to MediCap, ${name}!`);

        setTimeout(() => {
            this.navigateTo('dashboard');
        }, 1000);
    },

    selectRole(element, role) {
        document.querySelectorAll('.role-option').forEach(r => r.classList.remove('selected'));
        element.classList.add('selected');
        document.getElementById('register-role').value = role;
    },

    handleLogout() {
        Store.logout();
        Components.showToast('info', 'Logged Out', 'You have been signed out successfully.');
        this.navigateTo('home');
    },

    // ========== PROFILE ==========
    editProfile() {
        const nameInput = document.getElementById('profile-name');
        if (nameInput) nameInput.focus();
    },

    saveProfile(e) {
        e.preventDefault();
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
        const city = document.getElementById('profile-city').value;
        const dob = document.getElementById('profile-dob').value;
        const gender = document.getElementById('profile-gender').value;

        if (Store.state.currentUser) {
            Store.state.currentUser = {
                ...Store.state.currentUser,
                name, email, phone, city, dob, gender
            };
            localStorage.setItem('medicap_user', JSON.stringify(Store.state.currentUser));
            Store.updateAuthUI();
        }

        Components.showToast('success', 'Saved', 'Your profile has been updated successfully.');
    }
};

// ========== BOOT ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
