/* ============================================
   MediCap — Page Renderers
   ============================================ */

const Pages = {

    // ========== HOME PAGE ==========
    home() {
        const stats = Store.getStats();
        return `
            <!-- Hero Section -->
            <section class="hero">
                <div class="hero-bg-pattern">
                    <div class="hero-blob hero-blob-1"></div>
                    <div class="hero-blob hero-blob-2"></div>
                    <div class="hero-blob hero-blob-3"></div>
                </div>
                <div class="hero-container">
                    <div class="hero-content fade-in">
                        <div class="hero-badge">
                            <span class="material-icons-round">verified</span>
                            Trusted by 10,000+ patients across Gujarat
                        </div>
                        <h1 class="hero-title">
                            Your Health, <br><span class="text-gradient">Our Priority</span>
                        </h1>
                        <p class="hero-subtitle">
                            Connect with top doctors, book appointments instantly, and manage your health records — all in one place. Quality healthcare made accessible for everyone.
                        </p>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-lg" onclick="App.navigateTo('doctors')" id="hero-find-doctors-btn">
                                <span class="material-icons-round">search</span>
                                Find a Doctor
                            </button>
                            <button class="btn btn-outline btn-lg" onclick="App.navigateTo('register')" id="hero-register-btn">
                                <span class="material-icons-round">person_add</span>
                                Register Now
                            </button>
                        </div>
                        <div class="hero-stats">
                            <div class="hero-stat">
                                <div class="hero-stat-value">${stats.totalDoctors}+</div>
                                <div class="hero-stat-label">Expert Doctors</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">${stats.citiesServed}</div>
                                <div class="hero-stat-label">Cities Served</div>
                            </div>
                            <div class="hero-stat">
                                <div class="hero-stat-value">10K+</div>
                                <div class="hero-stat-label">Happy Patients</div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-visual slide-up">
                        <div class="hero-image-card">
                            <div class="hero-card-header">
                                <div class="hero-card-avatar">
                                    <span class="material-icons-round">person</span>
                                </div>
                                <div class="hero-card-info">
                                    <h3>Dr. Priya Sharma</h3>
                                    <p>Cardiologist</p>
                                </div>
                                <span class="hero-card-badge">● Available</span>
                            </div>
                            <div class="hero-vitals">
                                <div class="hero-vital">
                                    <div class="hero-vital-value">120/80</div>
                                    <div class="hero-vital-label">BP</div>
                                </div>
                                <div class="hero-vital">
                                    <div class="hero-vital-value">72</div>
                                    <div class="hero-vital-label">Heart Rate</div>
                                </div>
                                <div class="hero-vital">
                                    <div class="hero-vital-value">98.4°</div>
                                    <div class="hero-vital-label">Temp</div>
                                </div>
                            </div>
                            <div class="hero-card-timeline">
                                <div class="timeline-item">
                                    <span class="timeline-dot green"></span>
                                    <span class="timeline-text">Checkup completed</span>
                                    <span class="timeline-time">Today</span>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-dot blue"></span>
                                    <span class="timeline-text">Lab results received</span>
                                    <span class="timeline-time">Yesterday</span>
                                </div>
                                <div class="timeline-item">
                                    <span class="timeline-dot orange"></span>
                                    <span class="timeline-text">Follow-up scheduled</span>
                                    <span class="timeline-time">Apr 10</span>
                                </div>
                            </div>
                        </div>
                        <div class="floating-card floating-card-1">
                            <div class="floating-icon pulse">
                                <span class="material-icons-round">favorite</span>
                            </div>
                            <div class="floating-text">
                                Heart Health
                                <span>All vitals normal</span>
                            </div>
                        </div>
                        <div class="floating-card floating-card-2">
                            <div class="floating-icon calendar">
                                <span class="material-icons-round">event_available</span>
                            </div>
                            <div class="floating-text">
                                Next Appointment
                                <span>Apr 7, 10:00 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="section container" id="features-section">
                <div class="section-header centered">
                    <div class="section-eyebrow">Why Choose MediCap</div>
                    <h2 class="section-title">Everything You Need for<br><span class="text-gradient">Better Healthcare</span></h2>
                    <p class="section-subtitle">From finding the right doctor to managing your health records, we've got you covered with a comprehensive suite of features.</p>
                </div>
                <div class="features-grid stagger">
                    <div class="feature-card fade-in">
                        <div class="feature-icon teal"><span class="material-icons-round">search</span></div>
                        <h3 class="feature-title">Find Doctors</h3>
                        <p class="feature-desc">Search from hundreds of verified doctors across specialties and cities in Gujarat.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon blue"><span class="material-icons-round">calendar_month</span></div>
                        <h3 class="feature-title">Book Instantly</h3>
                        <p class="feature-desc">Book appointments online in seconds. Choose your preferred date, time, and doctor.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon green"><span class="material-icons-round">description</span></div>
                        <h3 class="feature-title">Digital Records</h3>
                        <p class="feature-desc">Access your complete medical history, prescriptions, and test results digitally.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon orange"><span class="material-icons-round">notifications_active</span></div>
                        <h3 class="feature-title">Smart Reminders</h3>
                        <p class="feature-desc">Never miss an appointment or medication with automated reminders and alerts.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon purple"><span class="material-icons-round">shield</span></div>
                        <h3 class="feature-title">Secure & Private</h3>
                        <p class="feature-desc">Your health data is encrypted and secured following healthcare compliance standards.</p>
                    </div>
                    <div class="feature-card fade-in">
                        <div class="feature-icon red"><span class="material-icons-round">language</span></div>
                        <h3 class="feature-title">Multi-Language</h3>
                        <p class="feature-desc">Available in English, Hindi, and Gujarati for accessible healthcare across regions.</p>
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section class="section" style="background: var(--bg-secondary);" id="how-it-works-section">
                <div class="container">
                    <div class="section-header centered">
                        <div class="section-eyebrow">How It Works</div>
                        <h2 class="section-title">Get Started in <span class="text-gradient">4 Simple Steps</span></h2>
                        <p class="section-subtitle">Our streamlined process makes healthcare management effortless.</p>
                    </div>
                    <div class="steps-grid stagger">
                        <div class="step-card fade-in">
                            <div class="step-number">1</div>
                            <h3 class="step-title">Create Account</h3>
                            <p class="step-desc">Register as a patient or doctor in under a minute with basic details.</p>
                        </div>
                        <div class="step-card fade-in">
                            <div class="step-number">2</div>
                            <h3 class="step-title">Find a Doctor</h3>
                            <p class="step-desc">Browse doctors by specialty, location, availability, and patient ratings.</p>
                        </div>
                        <div class="step-card fade-in">
                            <div class="step-number">3</div>
                            <h3 class="step-title">Book Appointment</h3>
                            <p class="step-desc">Select a convenient time slot and confirm your appointment instantly.</p>
                        </div>
                        <div class="step-card fade-in">
                            <div class="step-number">4</div>
                            <h3 class="step-title">Get Care</h3>
                            <p class="step-desc">Visit the doctor, get treated, and have your records updated digitally.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Locations -->
            <section class="section container" id="locations-section">
                <div class="section-header centered">
                    <div class="section-eyebrow">Our Presence</div>
                    <h2 class="section-title">Serving Across <span class="text-gradient">Gujarat</span></h2>
                    <p class="section-subtitle">Find quality healthcare providers in your city.</p>
                </div>
                <div class="locations-grid stagger">
                    ${CITIES.slice(0, 8).map(city => {
                        const count = Store.state.doctors.filter(d => d.city === city.name).length;
                        return `
                            <div class="location-card fade-in" onclick="App.navigateTo('doctors', null, '${city.name}')" id="location-${city.name.toLowerCase()}">
                                <div class="location-icon">${city.icon}</div>
                                <h3 class="location-name">${city.name}</h3>
                                <p class="location-count">${count} Doctor${count !== 1 ? 's' : ''} Available</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>

            <!-- CTA Section -->
            <section class="section container">
                <div class="cta-section">
                    <div class="cta-content">
                        <h2 class="cta-title">Ready to Take Charge of<br>Your Health?</h2>
                        <p class="cta-subtitle">Join thousands of patients and doctors who trust MediCap for simplified, digital healthcare management.</p>
                        <button class="btn btn-white btn-lg" onclick="App.navigateTo('register')" id="cta-register-btn">
                            <span class="material-icons-round">rocket_launch</span>
                            Get Started Free
                        </button>
                    </div>
                </div>
            </section>
        `;
    },

    // ========== FIND DOCTORS PAGE ==========
    doctors(filters = {}) {
        const doctors = Store.getDoctors(filters);
        const specialtyChips = ['All', ...SPECIALTIES].map(s => `
            <button class="filter-chip ${(filters.specialty || 'All') === s ? 'active' : ''}"
                    onclick="App.filterDoctors('specialty', '${s}')"
                    id="filter-${s.replace(/\s/g, '-').toLowerCase()}">${s}</button>
        `).join('');

        const cityOptions = ['All', ...CITIES.map(c => c.name)].map(c =>
            `<option value="${c}" ${(filters.city || 'All') === c ? 'selected' : ''}>${c === 'All' ? 'All Cities' : c}</option>`
        ).join('');

        const doctorCards = doctors.length > 0
            ? doctors.map(d => Components.renderDoctorCard(d)).join('')
            : Components.renderEmptyState('search_off', 'No Doctors Found', 'Try adjusting your filters or search query.', 'Clear Filters', 'doctors');

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">Find a Doctor</h1>
                    <p class="page-subtitle">Browse our network of verified healthcare professionals across Gujarat</p>
                </div>
            </div>
            <div class="doctors-layout">
                <div class="doctors-toolbar">
                    <div class="search-bar">
                        <span class="material-icons-round">search</span>
                        <input type="text" placeholder="Search doctors, specialties, hospitals..."
                               id="doctor-search-input"
                               value="${filters.search || ''}"
                               oninput="App.filterDoctors('search', this.value)">
                    </div>
                    <select class="form-select" style="width:180px;" id="city-filter"
                            onchange="App.filterDoctors('city', this.value)">
                        ${cityOptions}
                    </select>
                </div>
                <div class="filter-chips" style="margin-bottom: var(--space-6);">
                    ${specialtyChips}
                </div>
                <p class="doctors-count">Showing <strong>${doctors.length}</strong> doctor${doctors.length !== 1 ? 's' : ''}</p>
                <div class="doctors-grid stagger">
                    ${doctorCards}
                </div>
            </div>
        `;
    },

    // ========== APPOINTMENTS PAGE ==========
    appointments() {
        const appointments = Store.getAppointments();
        const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
        const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">My Appointments</h1>
                    <p class="page-subtitle">Manage your upcoming and past appointments</p>
                </div>
            </div>
            <div class="appointments-layout">
                <div class="appointments-header">
                    <div class="tabs" style="max-width:360px;">
                        <button class="tab active" onclick="App.switchAppointmentTab('upcoming', this)" id="tab-upcoming">
                            Upcoming (${upcoming.length})
                        </button>
                        <button class="tab" onclick="App.switchAppointmentTab('past', this)" id="tab-past">
                            Past (${past.length})
                        </button>
                    </div>
                    <button class="btn btn-primary" onclick="App.navigateTo('doctors')" id="new-appointment-btn">
                        <span class="material-icons-round">add</span>
                        New Appointment
                    </button>
                </div>

                <div id="appointments-upcoming" class="appointments-list">
                    ${upcoming.length > 0
                        ? upcoming.map(a => Components.renderAppointmentCard(a)).join('')
                        : Components.renderEmptyState('calendar_today', 'No Upcoming Appointments', 'Book an appointment with a doctor to get started.', 'Find a Doctor', 'doctors')
                    }
                </div>

                <div id="appointments-past" class="appointments-list hidden">
                    ${past.length > 0
                        ? past.map(a => Components.renderAppointmentCard(a)).join('')
                        : Components.renderEmptyState('history', 'No Past Appointments', 'Your completed appointments will appear here.')
                    }
                </div>
            </div>
        `;
    },

    // ========== BOOK APPOINTMENT PAGE ==========
    bookAppointment(doctorId) {
        const doctor = Store.getDoctorById(doctorId);
        if (!doctor) {
            return Components.renderEmptyState('error', 'Doctor Not Found', 'The requested doctor profile could not be found.', 'Browse Doctors', 'doctors');
        }

        const dateInputMin = new Date().toISOString().split('T')[0];
        const slotsHTML = TIME_SLOTS.map((slot, i) => {
            const unavailable = Math.random() < 0.2 ? 'unavailable' : '';
            return `<button class="time-slot ${unavailable}" ${unavailable ? 'disabled' : ''}
                           onclick="App.selectTimeSlot(this, '${slot}')"
                           id="slot-${i}">${slot}</button>`;
        }).join('');

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">Book Appointment</h1>
                    <p class="page-subtitle">Schedule your visit with ${doctor.name}</p>
                </div>
            </div>
            <div class="appointments-layout">
                <div class="book-appointment-grid">
                    <div>
                        <div class="card" style="margin-bottom: var(--space-6);">
                            <div class="doctor-card-header" style="margin-bottom:0;">
                                <div class="doctor-avatar">
                                    <span class="material-icons-round">person</span>
                                </div>
                                <div class="doctor-info">
                                    <h3 class="doctor-name">${doctor.name}</h3>
                                    <p class="doctor-specialty">${doctor.specialty}</p>
                                    <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">
                                        ${doctor.hospital}, ${doctor.city}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form id="booking-form" onsubmit="App.submitBooking(event)">
                            <div class="card" style="margin-bottom: var(--space-6);">
                                <h3 style="font-weight:700; font-size:1rem; margin-bottom:var(--space-5);">
                                    <span class="material-icons-round" style="vertical-align:middle; color:var(--primary-500); margin-right:8px;">person</span>
                                    Patient Details
                                </h3>
                                <div class="profile-form-grid">
                                    <div class="form-group">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-input" id="booking-name"
                                               placeholder="Enter patient name" required
                                               value="${Store.state.currentUser ? Store.state.currentUser.name : ''}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Phone Number *</label>
                                        <input type="tel" class="form-input" id="booking-phone"
                                               placeholder="+91 XXXXX XXXXX" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-input" id="booking-email"
                                               placeholder="your@email.com"
                                               value="${Store.state.currentUser ? Store.state.currentUser.email : ''}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Visit Type *</label>
                                        <select class="form-select" id="booking-type" required>
                                            <option value="Consultation">Consultation</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Checkup">General Checkup</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="card" style="margin-bottom: var(--space-6);">
                                <h3 style="font-weight:700; font-size:1rem; margin-bottom:var(--space-5);">
                                    <span class="material-icons-round" style="vertical-align:middle; color:var(--primary-500); margin-right:8px;">calendar_today</span>
                                    Select Date & Time
                                </h3>
                                <div class="form-group">
                                    <label class="form-label">Preferred Date *</label>
                                    <input type="date" class="form-input" id="booking-date"
                                           min="${dateInputMin}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Available Time Slots</label>
                                    <div class="time-slots-grid">
                                        ${slotsHTML}
                                    </div>
                                    <input type="hidden" id="booking-time" required>
                                </div>
                            </div>

                            <div class="card" style="margin-bottom: var(--space-6);">
                                <h3 style="font-weight:700; font-size:1rem; margin-bottom:var(--space-5);">
                                    <span class="material-icons-round" style="vertical-align:middle; color:var(--primary-500); margin-right:8px;">note</span>
                                    Additional Notes
                                </h3>
                                <div class="form-group" style="margin-bottom:0;">
                                    <textarea class="form-input" id="booking-notes" rows="3"
                                              placeholder="Describe your symptoms or reason for visit..."></textarea>
                                </div>
                            </div>

                            <input type="hidden" id="booking-doctor-id" value="${doctor.id}">
                            <button type="submit" class="btn btn-primary btn-lg btn-full" id="confirm-booking-btn">
                                <span class="material-icons-round">check_circle</span>
                                Confirm Appointment
                            </button>
                        </form>
                    </div>

                    <div class="booking-summary">
                        <h3 class="summary-title">
                            <span class="material-icons-round">receipt_long</span>
                            Booking Summary
                        </h3>
                        <div class="summary-row">
                            <span class="summary-label">Doctor</span>
                            <span class="summary-value">${doctor.name}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Specialty</span>
                            <span class="summary-value">${doctor.specialty}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Hospital</span>
                            <span class="summary-value">${doctor.hospital}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">City</span>
                            <span class="summary-value">${doctor.city}</span>
                        </div>
                        <div class="summary-row" id="summary-date-row">
                            <span class="summary-label">Date</span>
                            <span class="summary-value" id="summary-date">Not selected</span>
                        </div>
                        <div class="summary-row" id="summary-time-row">
                            <span class="summary-label">Time</span>
                            <span class="summary-value" id="summary-time">Not selected</span>
                        </div>
                        <div class="divider"></div>
                        <div class="summary-row">
                            <span class="summary-label" style="font-weight:700; color:var(--text-primary);">Consultation Fee</span>
                            <span class="summary-value" style="font-size:1.25rem; color:var(--primary-500);">₹${doctor.fee}</span>
                        </div>
                        <p style="font-size:0.75rem; color:var(--text-tertiary); margin-top:var(--space-4);">
                            * Payment to be made at the time of visit. Cancellation is free up to 2 hours before the appointment.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== RECORDS PAGE ==========
    records() {
        const records = Store.getRecords();
        const user = Store.state.currentUser;
        const userName = user ? user.name : 'Rahul Verma';
        const userEmail = user ? user.email : 'rahul.verma@email.com';

        const recordCards = records.length > 0
            ? records.map(r => Components.renderRecordCard(r)).join('')
            : Components.renderEmptyState('folder_open', 'No Medical Records', 'Your medical records will appear here after your visits.', 'Book Appointment', 'doctors');

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">Medical Records</h1>
                    <p class="page-subtitle">View your complete medical history and health records</p>
                </div>
            </div>
            <div class="records-layout">
                <div class="records-grid">
                    <div class="patient-sidebar">
                        <div class="patient-avatar-lg">
                            <span class="material-icons-round">person</span>
                        </div>
                        <h3 class="patient-name">${userName}</h3>
                        <p class="patient-id">Patient ID: MCP-2026-0421</p>
                        <div class="divider"></div>
                        <div class="patient-detail-list">
                            <div class="patient-detail-item">
                                <span class="material-icons-round">cake</span>
                                <span class="detail-label">Age</span>
                                <span class="detail-value">32 yrs</span>
                            </div>
                            <div class="patient-detail-item">
                                <span class="material-icons-round">wc</span>
                                <span class="detail-label">Gender</span>
                                <span class="detail-value">Male</span>
                            </div>
                            <div class="patient-detail-item">
                                <span class="material-icons-round">bloodtype</span>
                                <span class="detail-label">Blood</span>
                                <span class="detail-value">B+</span>
                            </div>
                            <div class="patient-detail-item">
                                <span class="material-icons-round">height</span>
                                <span class="detail-label">Height</span>
                                <span class="detail-value">175 cm</span>
                            </div>
                            <div class="patient-detail-item">
                                <span class="material-icons-round">monitor_weight</span>
                                <span class="detail-label">Weight</span>
                                <span class="detail-value">75 kg</span>
                            </div>
                            <div class="patient-detail-item">
                                <span class="material-icons-round">location_on</span>
                                <span class="detail-label">City</span>
                                <span class="detail-value">Ahmedabad</span>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div style="text-align:center;">
                            <p style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); margin-bottom:var(--space-2);">Allergies</p>
                            <div style="display:flex; flex-wrap:wrap; gap:var(--space-1); justify-content:center;">
                                <span class="badge badge-error">Penicillin</span>
                                <span class="badge badge-warning">Dust</span>
                            </div>
                        </div>
                    </div>
                    <div class="records-main stagger">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-2);">
                            <h2 style="font-weight:700; font-size:1.15rem;">Visit History</h2>
                            <span class="badge badge-neutral">${records.length} Records</span>
                        </div>
                        ${recordCards}
                    </div>
                </div>
            </div>
        `;
    },

    // ========== DASHBOARD PAGE ==========
    dashboard() {
        const stats = Store.getStats();
        const appointments = Store.getAppointments();
        const recent = appointments.slice(0, 4);
        const user = Store.state.currentUser;
        const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
        const userName = user ? user.name : 'User';

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">${greeting}, ${userName}! 👋</h1>
                    <p class="page-subtitle">Here's an overview of your health management dashboard</p>
                </div>
            </div>
            <div class="dashboard-layout">
                <div class="dashboard-stats stagger">
                    ${Components.renderStatCard('calendar_today', 'Total Appointments', stats.totalAppointments, 'teal', { direction: 'up', value: '+12%' })}
                    ${Components.renderStatCard('upcoming', 'Upcoming', stats.upcomingAppointments, 'blue')}
                    ${Components.renderStatCard('task_alt', 'Completed', stats.completedAppointments, 'green')}
                    ${Components.renderStatCard('description', 'Health Records', stats.totalRecords, 'orange')}
                </div>

                <div class="quick-actions stagger">
                    <button class="quick-action-btn fade-in" onclick="App.navigateTo('doctors')" id="qa-find-doctor">
                        <div class="quick-action-icon" style="background: rgba(14,161,122,0.1); color: var(--primary-500);">
                            <span class="material-icons-round">search</span>
                        </div>
                        <div>
                            <div class="quick-action-label">Find a Doctor</div>
                            <div class="quick-action-sub">Browse specialists</div>
                        </div>
                    </button>
                    <button class="quick-action-btn fade-in" onclick="App.navigateTo('appointments')" id="qa-appointments">
                        <div class="quick-action-icon" style="background: rgba(59,130,246,0.1); color: var(--info);">
                            <span class="material-icons-round">calendar_today</span>
                        </div>
                        <div>
                            <div class="quick-action-label">My Appointments</div>
                            <div class="quick-action-sub">View schedule</div>
                        </div>
                    </button>
                    <button class="quick-action-btn fade-in" onclick="App.navigateTo('records')" id="qa-records">
                        <div class="quick-action-icon" style="background: rgba(245,158,11,0.1); color: var(--warning);">
                            <span class="material-icons-round">description</span>
                        </div>
                        <div>
                            <div class="quick-action-label">Medical Records</div>
                            <div class="quick-action-sub">Health history</div>
                        </div>
                    </button>
                    <button class="quick-action-btn fade-in" onclick="App.navigateTo('profile')" id="qa-profile">
                        <div class="quick-action-icon" style="background: rgba(139,92,246,0.1); color: #8b5cf6;">
                            <span class="material-icons-round">person</span>
                        </div>
                        <div>
                            <div class="quick-action-label">My Profile</div>
                            <div class="quick-action-sub">Update details</div>
                        </div>
                    </button>
                </div>

                <div class="dashboard-grid">
                    <div class="dashboard-section">
                        <div class="dashboard-section-header">
                            <h3 class="dashboard-section-title">
                                <span class="material-icons-round">calendar_today</span>
                                Recent Appointments
                            </h3>
                            <button class="btn btn-ghost btn-sm" onclick="App.navigateTo('appointments')" id="view-all-appointments">
                                View All
                                <span class="material-icons-round" style="font-size:16px;">arrow_forward</span>
                            </button>
                        </div>
                        <div class="appointments-list">
                            ${recent.length > 0
                                ? recent.map(a => Components.renderAppointmentCard(a)).join('')
                                : Components.renderEmptyState('calendar_today', 'No Appointments', 'Start by booking your first appointment.')
                            }
                        </div>
                    </div>

                    <div class="dashboard-section">
                        <div class="dashboard-section-header">
                            <h3 class="dashboard-section-title">
                                <span class="material-icons-round">trending_up</span>
                                Recent Activity
                            </h3>
                        </div>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-dot green">
                                    <span class="material-icons-round">check</span>
                                </div>
                                <div>
                                    <div class="activity-text"><strong>Appointment completed</strong> with Dr. Priya Sharma</div>
                                    <div class="activity-time">2 days ago</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot blue">
                                    <span class="material-icons-round">description</span>
                                </div>
                                <div>
                                    <div class="activity-text"><strong>Medical record</strong> updated by Dr. Rajesh Patel</div>
                                    <div class="activity-time">5 days ago</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot orange">
                                    <span class="material-icons-round">medication</span>
                                </div>
                                <div>
                                    <div class="activity-text"><strong>Prescription renewed</strong> — Amlodipine 5mg</div>
                                    <div class="activity-time">1 week ago</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot green">
                                    <span class="material-icons-round">person_add</span>
                                </div>
                                <div>
                                    <div class="activity-text"><strong>Account created</strong> — Welcome to MediCap!</div>
                                    <div class="activity-time">2 weeks ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== LOGIN PAGE ==========
    login() {
        return `
            <div class="auth-layout">
                <div class="auth-card scale-in">
                    <div class="auth-header">
                        <div class="auth-icon">
                            <span class="material-icons-round">login</span>
                        </div>
                        <h2 class="auth-title">Welcome Back</h2>
                        <p class="auth-subtitle">Sign in to access your MediCap account</p>
                    </div>
                    <form id="login-form" onsubmit="App.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-input" id="login-email"
                                   placeholder="your@email.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" id="login-password"
                                   placeholder="Enter your password" required>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
                            <label style="display:flex; align-items:center; gap:var(--space-2); font-size:0.85rem; cursor:pointer;">
                                <input type="checkbox" id="remember-me" style="accent-color:var(--primary-500);"> Remember me
                            </label>
                            <a href="#" style="font-size:0.85rem; color:var(--primary-500); font-weight:600;">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg btn-full" id="login-submit-btn">
                            <span class="material-icons-round">login</span>
                            Sign In
                        </button>
                    </form>
                    <div class="auth-footer">
                        Don't have an account? <a href="#" onclick="App.navigateTo('register')">Register here</a>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== REGISTER PAGE ==========
    register() {
        return `
            <div class="auth-layout">
                <div class="auth-card scale-in" style="max-width:520px;">
                    <div class="auth-header">
                        <div class="auth-icon">
                            <span class="material-icons-round">person_add</span>
                        </div>
                        <h2 class="auth-title">Create Account</h2>
                        <p class="auth-subtitle">Join MediCap and start managing your health today</p>
                    </div>
                    <form id="register-form" onsubmit="App.handleRegister(event)">
                        <div class="form-group">
                            <label class="form-label">I am a</label>
                            <div class="role-selector">
                                <div class="role-option selected" onclick="App.selectRole(this, 'patient')" id="role-patient">
                                    <span class="material-icons-round">person</span>
                                    <div class="role-label">Patient</div>
                                </div>
                                <div class="role-option" onclick="App.selectRole(this, 'doctor')" id="role-doctor">
                                    <span class="material-icons-round">medical_services</span>
                                    <div class="role-label">Doctor</div>
                                </div>
                            </div>
                            <input type="hidden" id="register-role" value="patient">
                        </div>
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-input" id="register-name"
                                       placeholder="Enter your full name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone Number *</label>
                                <input type="tel" class="form-input" id="register-phone"
                                       placeholder="+91 XXXXX XXXXX" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address *</label>
                            <input type="email" class="form-input" id="register-email"
                                   placeholder="your@email.com" required>
                        </div>
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label class="form-label">City *</label>
                                <select class="form-select" id="register-city" required>
                                    <option value="">Select City</option>
                                    ${CITIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password *</label>
                                <input type="password" class="form-input" id="register-password"
                                       placeholder="Create a password" required minlength="6">
                            </div>
                        </div>
                        <div style="margin-bottom:var(--space-6);">
                            <label style="display:flex; align-items:flex-start; gap:var(--space-2); font-size:0.85rem; cursor:pointer;">
                                <input type="checkbox" required style="accent-color:var(--primary-500); margin-top:3px;" id="agree-terms">
                                I agree to the <a href="#" style="color:var(--primary-500); font-weight:600;">Terms of Service</a> and <a href="#" style="color:var(--primary-500); font-weight:600;">Privacy Policy</a>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg btn-full" id="register-submit-btn">
                            <span class="material-icons-round">how_to_reg</span>
                            Create Account
                        </button>
                    </form>
                    <div class="auth-footer">
                        Already have an account? <a href="#" onclick="App.navigateTo('login')">Sign in</a>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== PROFILE PAGE ==========
    profile() {
        const user = Store.state.currentUser || { name: 'Guest User', email: 'guest@medicap.com', role: 'patient', city: 'Ahmedabad' };

        return `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">My Profile</h1>
                    <p class="page-subtitle">Manage your personal information and preferences</p>
                </div>
            </div>
            <div class="profile-layout">
                <div class="profile-header-card fade-in">
                    <div class="profile-avatar">
                        <span class="material-icons-round">person</span>
                    </div>
                    <div class="profile-info">
                        <h2 class="profile-name">${user.name}</h2>
                        <p class="profile-role">${user.role === 'doctor' ? 'Doctor' : 'Patient'}</p>
                        <p class="profile-location">
                            <span class="material-icons-round">location_on</span>
                            ${user.city || 'Gujarat'}, India
                        </p>
                    </div>
                    <button class="btn btn-outline" onclick="App.editProfile()" id="edit-profile-btn">
                        <span class="material-icons-round">edit</span>
                        Edit Profile
                    </button>
                </div>

                <div class="profile-section fade-in">
                    <h3 class="profile-section-title">
                        <span class="material-icons-round">person</span>
                        Personal Information
                    </h3>
                    <form id="profile-form" onsubmit="App.saveProfile(event)">
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-input" id="profile-name" value="${user.name}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="profile-email" value="${user.email}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-input" id="profile-phone" value="${user.phone || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">City</label>
                                <select class="form-select" id="profile-city">
                                    ${CITIES.map(c => `<option value="${c.name}" ${c.name === user.city ? 'selected' : ''}>${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Date of Birth</label>
                                <input type="date" class="form-input" id="profile-dob" value="${user.dob || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gender</label>
                                <select class="form-select" id="profile-gender">
                                    <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:var(--space-3); margin-top:var(--space-6);">
                            <button type="button" class="btn btn-secondary" onclick="App.navigateTo('dashboard')" id="profile-cancel-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="profile-save-btn">
                                <span class="material-icons-round">save</span>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                <div class="profile-section fade-in">
                    <h3 class="profile-section-title">
                        <span class="material-icons-round">security</span>
                        Security Settings
                    </h3>
                    <div class="profile-form-grid">
                        <div class="form-group">
                            <label class="form-label">Current Password</label>
                            <input type="password" class="form-input" placeholder="Enter current password" id="current-password-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-input" placeholder="Enter new password" id="new-password-input">
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; margin-top:var(--space-4);">
                        <button class="btn btn-secondary" onclick="Components.showToast('info', 'Password', 'Password change simulated successfully.')" id="change-password-btn">
                            <span class="material-icons-round">lock</span>
                            Change Password
                        </button>
                    </div>
                </div>

                <div style="text-align:center; margin-top:var(--space-4);">
                    <button class="btn btn-ghost" style="color:var(--error);" onclick="App.handleLogout()" id="profile-logout-btn">
                        <span class="material-icons-round">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>
        `;
    }
};
