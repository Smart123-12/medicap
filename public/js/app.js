/* ============================================
   MediCap — Main Application Controller
   v2.0 — Role-based Auth (Patient/Doctor/Admin)
   ============================================ */

const App = {
    _bookingDoctorId: null,
    _filterDebounce: null,

    // Initialize application
    async init() {
        await Store.init();
        Store.updateThemeIcon();
        Store.updateAuthUI();
        this.bindNavigation();
        this.bindTheme();
        this.bindMobileNav();
        this.bindScroll();

        // If admin, load admin data
        if (Store.state.isAuthenticated && Store.state.currentUser?.role === 'admin') {
            await Store.fetchAdminUsers();
        }

        this.renderPage('home');
        this.hidePreloader();
    },

    hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
        }, 800);
    },

    // ========== NAVIGATION ==========
    bindNavigation() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        const avatarBtn = document.getElementById('user-avatar-btn');
        const dropdown = document.getElementById('user-dropdown');
        if (avatarBtn && dropdown) {
            avatarBtn.addEventListener('click', () => dropdown.classList.toggle('hidden'));
            document.addEventListener('click', (e) => {
                if (!avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        }

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
        if (themeBtn) themeBtn.addEventListener('click', () => Store.toggleTheme());
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

        document.querySelectorAll('.mobile-link, #mobile-login-btn').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobile();
                this.navigateTo(link.getAttribute('data-page'));
            });
        });
    },

    bindScroll() {
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('main-nav');
            nav.classList.toggle('scrolled', window.scrollY > 50);
        });
    },

    navigateTo(page, doctorId = null, city = null) {
        // Guard protected pages
        const protectedPages = ['appointments', 'records', 'dashboard', 'profile'];
        if (protectedPages.includes(page) && !Store.state.isAuthenticated) {
            Components.showToast('warning', 'Login Required', 'Please login to access this page.');
            page = 'login';
        }

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.mobile-link').forEach(l => l.classList.remove('active'));

        const navPage = page === 'book-appointment' ? 'appointments' : page;
        document.querySelectorAll(`[data-page="${navPage}"]`).forEach(l => l.classList.add('active'));

        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.add('hidden');

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

        footer.style.display = (page === 'login' || page === 'register') ? 'none' : '';

        switch (page) {
            case 'home': content.innerHTML = Pages.home(); break;
            case 'doctors': content.innerHTML = Pages.doctors(Store.state.filters); break;
            case 'appointments': content.innerHTML = Pages.appointments(); break;
            case 'book-appointment': content.innerHTML = Pages.bookAppointment(arg); this.bindBookingDateListener(); break;
            case 'records': content.innerHTML = Pages.records(); break;
            case 'dashboard': content.innerHTML = Pages.dashboard(); break;
            case 'login': content.innerHTML = Pages.login(); break;
            case 'register': content.innerHTML = Pages.register(); break;
            case 'profile': content.innerHTML = Pages.profile(); break;
            default: content.innerHTML = Pages.home();
        }

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
        document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => observer.observe(el));
    },

    // ========== DOCTOR FILTERS ==========
    filterDoctors(type, value) {
        Store.state.filters[type] = value;
        if (type === 'search') {
            clearTimeout(this._filterDebounce);
            this._filterDebounce = setTimeout(() => this.renderPage('doctors'), 300);
        } else {
            this.renderPage('doctors');
        }
    },

    // ========== APPOINTMENTS ==========
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

    async confirmCancel(id) {
        await Store.cancelAppointment(id);
        Components.closeModal();
        this.renderPage('appointments');
        Components.showToast('success', 'Cancelled', 'Your appointment has been cancelled.');
    },

    // Doctor: mark appointment as completed
    async completeAppointment(id) {
        try {
            await Store.apiCall(`/appointments/${id}/complete`, 'PUT');
            const apt = Store.state.appointments.find(a => a.id === id);
            if (apt) apt.status = 'completed';
            this.renderPage('dashboard');
            Components.showToast('success', 'Completed', 'Appointment marked as completed.');
        } catch (err) {
            Components.showToast('error', 'Error', err.message || 'Could not complete appointment.');
        }
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

    async submitBooking(e) {
        e.preventDefault();
        const name = document.getElementById('booking-name').value;
        const phone = document.getElementById('booking-phone').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const type = document.getElementById('booking-type').value;
        const notes = document.getElementById('booking-notes').value;
        const doctorId = document.getElementById('booking-doctor-id').value;

        if (!time) { Components.showToast('error', 'Time Required', 'Please select a time slot.'); return; }
        if (!date) { Components.showToast('error', 'Date Required', 'Please select a date.'); return; }

        const btn = document.getElementById('confirm-booking-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round" style="animation: spin 1s linear infinite;">autorenew</span> Booking...';

        const appointment = { doctorId, patientName: name, phone, date, time, type, notes, status: 'confirmed' };
        await Store.addAppointment(appointment);

        Components.showToast('success', 'Booked!', `Appointment confirmed for ${date} at ${time}.`);
        setTimeout(() => this.navigateTo('appointments'), 1500);
    },

    // ========== AUTH ==========
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validation
        if (!email || !password) {
            Components.showToast('error', 'Error', 'Please fill in all fields.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Components.showToast('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }

        const btn = document.getElementById('login-submit-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round" style="animation: spin 1s linear infinite;">autorenew</span> Signing in...';

        const result = await Store.login(email, password);

        if (result.success) {
            const role = result.user.role;
            const roleLabel = role === 'admin' ? 'Administrator' : role === 'doctor' ? 'Doctor' : 'Patient';
            Components.showToast('success', `Welcome, ${roleLabel}!`, `Logged in as ${result.user.name}`);

            // Load admin data if admin
            if (role === 'admin') {
                await Store.fetchAdminUsers();
            }

            if (result.offline) {
                Components.showToast('info', 'Offline Mode', 'Running in demo mode — data saved locally.');
            }
            setTimeout(() => this.navigateTo('dashboard'), 1000);
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
            Components.showToast('error', 'Login Failed', result.error || 'Invalid credentials.');
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const city = document.getElementById('register-city').value;
        const role = document.getElementById('register-role').value;
        const password = document.getElementById('register-password').value;

        // Validation
        if (!name || !email || !phone || !city || !password) {
            Components.showToast('error', 'Missing Fields', 'Please fill in all required fields.');
            return;
        }
        if (name.length < 2) {
            Components.showToast('error', 'Invalid Name', 'Name must be at least 2 characters.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Components.showToast('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }
        if (phone.replace(/[\s-]/g, '').length < 10) {
            Components.showToast('error', 'Invalid Phone', 'Please enter a valid phone number (10+ digits).');
            return;
        }
        if (password.length < 6) {
            Components.showToast('error', 'Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        const btn = document.getElementById('register-submit-btn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round" style="animation: spin 1s linear infinite;">autorenew</span> Creating account...';

        const result = await Store.register({ name, email, phone, city, role, password });

        if (result.success) {
            const roleLabel = role === 'admin' ? 'Administrator' : role === 'doctor' ? 'Doctor' : 'Patient';
            Components.showToast('success', 'Account Created!', `Welcome to MediCap as ${roleLabel}!`);

            if (role === 'admin') {
                await Store.fetchAdminUsers();
            }

            if (result.offline) {
                Components.showToast('info', 'Offline Mode', 'Running in demo mode — data saved locally.');
            }

            // Show verification notice
            setTimeout(() => {
                Components.showToast('info', 'Verification', 'Please verify your account from your Dashboard.');
            }, 2000);

            setTimeout(() => this.navigateTo('dashboard'), 1500);
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
            Components.showToast('error', 'Registration Failed', result.error || 'Please try again.');
        }
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

    // ========== VERIFICATION ==========
    async verifyAccount() {
        try {
            const result = await Store.apiCall('/auth/verify', 'POST');
            if (result && result.verified) {
                Store.state.currentUser.verified = true;
                localStorage.setItem('medicap_user', JSON.stringify(Store.state.currentUser));
                Components.showToast('success', 'Verified!', 'Your account has been verified successfully.');
                this.renderPage('dashboard');
            }
        } catch (err) {
            // Offline fallback
            Store.state.currentUser.verified = true;
            localStorage.setItem('medicap_user', JSON.stringify(Store.state.currentUser));
            Components.showToast('success', 'Verified!', 'Your account has been verified.');
            this.renderPage('dashboard');
        }
    },

    // ========== ADMIN ACTIONS ==========
    async adminVerifyUser(userId) {
        try {
            await Store.apiCall(`/admin/users/${userId}/verify`, 'PUT');
            Components.showToast('success', 'Verified', 'User has been verified.');
            await Store.fetchAdminUsers();
            this.renderPage('dashboard');
        } catch (err) {
            Components.showToast('error', 'Error', err.message || 'Could not verify user.');
        }
    },

    async adminToggleUser(userId) {
        try {
            const result = await Store.apiCall(`/admin/users/${userId}/toggle`, 'PUT');
            Components.showToast('success', 'Updated', result.message || 'User status updated.');
            await Store.fetchAdminUsers();
            this.renderPage('dashboard');
        } catch (err) {
            Components.showToast('error', 'Error', err.message || 'Could not update user.');
        }
    },

    async adminDeleteUser(userId) {
        Components.showModal(
            'Delete User',
            `<p style="color:var(--text-secondary); margin-bottom:var(--space-4);">Are you sure you want to delete this user? This will remove all their appointments and records. This action cannot be undone.</p>`,
            `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancel</button>
             <button class="btn btn-danger" onclick="App.confirmDeleteUser('${userId}')">Yes, Delete</button>`
        );
    },

    async confirmDeleteUser(userId) {
        try {
            await Store.apiCall(`/admin/users/${userId}`, 'DELETE');
            Components.closeModal();
            Components.showToast('success', 'Deleted', 'User has been removed.');
            await Store.fetchAdminUsers();
            this.renderPage('dashboard');
        } catch (err) {
            Components.closeModal();
            Components.showToast('error', 'Error', err.message || 'Could not delete user.');
        }
    },

    async refreshAdminData() {
        Components.showToast('info', 'Refreshing', 'Loading latest data...');
        await Store.fetchAdminUsers();
        await Store.fetchAppointments();
        this.renderPage('dashboard');
        Components.showToast('success', 'Refreshed', 'Data updated.');
    },

    // ========== PROFILE ==========
    editProfile() {
        const nameInput = document.getElementById('profile-name');
        if (nameInput) nameInput.focus();
    },

    async saveProfile(e) {
        e.preventDefault();
        const profileData = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            city: document.getElementById('profile-city').value,
            dob: document.getElementById('profile-dob').value,
            gender: document.getElementById('profile-gender').value
        };

        const result = await Store.updateProfile(profileData);
        if (result.success) {
            Components.showToast('success', 'Saved', 'Your profile has been updated.');
        } else {
            Components.showToast('error', 'Error', result.error || 'Could not update profile.');
        }
    },

    async handleChangePassword() {
        const current = document.getElementById('current-password-input').value;
        const newPass = document.getElementById('new-password-input').value;

        if (!current || !newPass) {
            Components.showToast('error', 'Error', 'Please fill in both password fields.');
            return;
        }
        if (newPass.length < 6) {
            Components.showToast('error', 'Weak Password', 'New password must be at least 6 characters.');
            return;
        }

        const result = await Store.changePassword(current, newPass);
        if (result.success) {
            Components.showToast('success', 'Password Changed', result.message);
            document.getElementById('current-password-input').value = '';
            document.getElementById('new-password-input').value = '';
        } else {
            Components.showToast('error', 'Error', result.error || 'Could not change password.');
        }
    }
};

// ========== BOOT ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// ========== CSS for spinner ==========
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);
