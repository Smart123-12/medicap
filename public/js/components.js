/* ============================================
   MediCap — Reusable UI Components
   ============================================ */

const Components = {

    // Toast Notification
    showToast(type, title, message, duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="material-icons-round toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <span class="material-icons-round" style="font-size:16px;">close</span>
            </button>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Doctor Card
    renderDoctorCard(doctor) {
        const stars = Array(5).fill(0).map((_, i) =>
            `<span class="material-icons-round ${i < Math.floor(doctor.rating) ? 'star-filled' : ''}" style="font-size:14px;">${i < Math.floor(doctor.rating) ? 'star' : 'star_border'}</span>`
        ).join('');

        return `
            <div class="doctor-card fade-in" data-doctor-id="${doctor.id}" id="doctor-card-${doctor.id}">
                <div class="doctor-card-header">
                    <div class="doctor-avatar">
                        <span class="material-icons-round">person</span>
                    </div>
                    <div class="doctor-info">
                        <h3 class="doctor-name">${doctor.name}</h3>
                        <p class="doctor-specialty">${doctor.specialty}</p>
                    </div>
                </div>
                <div class="doctor-card-body">
                    <div class="doctor-detail">
                        <span class="material-icons-round">school</span>
                        ${doctor.qualification}
                    </div>
                    <div class="doctor-detail">
                        <span class="material-icons-round">local_hospital</span>
                        ${doctor.hospital}, ${doctor.city}
                    </div>
                    <div class="doctor-detail">
                        <span class="material-icons-round">work_history</span>
                        ${doctor.experience} years experience
                    </div>
                    <div class="doctor-detail">
                        <div class="doctor-rating">${stars}</div>
                        <span style="margin-left:4px;">${doctor.rating}</span>
                        <span style="color:var(--text-tertiary);">(${doctor.reviews})</span>
                    </div>
                </div>
                <div class="doctor-card-footer">
                    <div class="doctor-fee">₹${doctor.fee} <span>/ visit</span></div>
                    <button class="btn btn-primary btn-sm" onclick="App.navigateTo('book-appointment', '${doctor.id}')" id="book-btn-${doctor.id}">
                        <span class="material-icons-round">calendar_today</span>
                        Book Now
                    </button>
                </div>
            </div>
        `;
    },

    // Stat Card
    renderStatCard(icon, label, value, color, trend = null) {
        const trendHTML = trend ? `
            <div class="stat-trend ${trend.direction}">
                <span class="material-icons-round">${trend.direction === 'up' ? 'trending_up' : 'trending_down'}</span>
                ${trend.value}
            </div>
        ` : '';

        return `
            <div class="stat-card fade-in">
                <div class="stat-icon ${color}">
                    <span class="material-icons-round">${icon}</span>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${label}</div>
                    ${trendHTML}
                </div>
            </div>
        `;
    },

    // Appointment Card
    renderAppointmentCard(appointment) {
        const date = new Date(appointment.date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const doctor = Store.getDoctorById(appointment.doctorId);
        const doctorName = doctor ? doctor.name : 'Unknown Doctor';

        const statusMap = {
            confirmed: { class: 'badge-success', label: 'Confirmed', icon: 'check_circle' },
            pending: { class: 'badge-warning', label: 'Pending', icon: 'schedule' },
            completed: { class: 'badge-info', label: 'Completed', icon: 'task_alt' },
            cancelled: { class: 'badge-error', label: 'Cancelled', icon: 'cancel' }
        };
        const status = statusMap[appointment.status] || statusMap.pending;

        const isPast = date < new Date() || appointment.status === 'completed' || appointment.status === 'cancelled';
        const actions = isPast ? '' : `
            <div class="appointment-actions">
                <button class="btn btn-sm btn-outline" onclick="App.rescheduleAppointment('${appointment.id}')" id="reschedule-${appointment.id}">
                    Reschedule
                </button>
                <button class="btn btn-sm btn-ghost" onclick="App.cancelAppointment('${appointment.id}')" id="cancel-${appointment.id}" style="color:var(--error);">
                    Cancel
                </button>
            </div>
        `;

        return `
            <div class="appointment-card fade-in" id="appointment-${appointment.id}">
                <div class="appointment-date-badge">
                    <span class="day">${date.getDate()}</span>
                    <span class="month">${months[date.getMonth()]}</span>
                </div>
                <div class="appointment-info">
                    <div class="appointment-title">${doctorName}</div>
                    <div class="appointment-subtitle">
                        <span class="material-icons-round">medical_services</span>
                        ${appointment.type} • ${appointment.notes || ''}
                    </div>
                    <div class="appointment-time">
                        <span class="material-icons-round">schedule</span>
                        ${appointment.time}
                    </div>
                </div>
                <span class="badge ${status.class}">
                    <span class="material-icons-round" style="font-size:12px;">${status.icon}</span>
                    ${status.label}
                </span>
                ${actions}
            </div>
        `;
    },

    // Record Card
    renderRecordCard(record) {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const medsHTML = record.medications.map(m => `
            <span class="medication-tag">
                <span class="material-icons-round">medication</span>
                ${m.name} — ${m.dosage}
            </span>
        `).join('');

        const testsHTML = record.tests ? record.tests.map(t => `
            <span class="medication-tag">
                <span class="material-icons-round">biotech</span>
                ${t}
            </span>
        `).join('') : '';

        return `
            <div class="record-card fade-in" id="record-${record.id}">
                <div class="record-header">
                    <div>
                        <h3 style="font-weight:700; font-size:1rem; margin-bottom:2px;">${record.diagnosis}</h3>
                        <p style="font-size:0.85rem; color:var(--primary-500); font-weight:600;">${record.doctorName} — ${record.doctorSpecialty}</p>
                    </div>
                    <div class="record-date">
                        <span class="material-icons-round">calendar_today</span>
                        ${formattedDate}
                    </div>
                </div>
                <div class="record-body">
                    <h4><span class="material-icons-round">description</span> Clinical Notes</h4>
                    <p>${record.notes}</p>

                    ${record.vitals ? `
                        <h4><span class="material-icons-round">monitor_heart</span> Vitals</h4>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-2); margin-bottom: var(--space-4);">
                            <div style="background:var(--bg-secondary); padding:var(--space-3); border-radius:var(--radius-lg); text-align:center;">
                                <div style="font-weight:700; font-size:0.95rem;">${record.vitals.bp}</div>
                                <div style="font-size:0.7rem; color:var(--text-tertiary); text-transform:uppercase;">BP</div>
                            </div>
                            <div style="background:var(--bg-secondary); padding:var(--space-3); border-radius:var(--radius-lg); text-align:center;">
                                <div style="font-weight:700; font-size:0.95rem;">${record.vitals.heartRate}</div>
                                <div style="font-size:0.7rem; color:var(--text-tertiary); text-transform:uppercase;">Heart Rate</div>
                            </div>
                            <div style="background:var(--bg-secondary); padding:var(--space-3); border-radius:var(--radius-lg); text-align:center;">
                                <div style="font-weight:700; font-size:0.95rem;">${record.vitals.weight}</div>
                                <div style="font-size:0.7rem; color:var(--text-tertiary); text-transform:uppercase;">Weight</div>
                            </div>
                            <div style="background:var(--bg-secondary); padding:var(--space-3); border-radius:var(--radius-lg); text-align:center;">
                                <div style="font-weight:700; font-size:0.95rem;">${record.vitals.temperature}</div>
                                <div style="font-size:0.7rem; color:var(--text-tertiary); text-transform:uppercase;">Temp</div>
                            </div>
                        </div>
                    ` : ''}

                    <h4><span class="material-icons-round">medication</span> Medications</h4>
                    <div class="medication-list" style="margin-bottom: var(--space-4);">
                        ${medsHTML}
                    </div>

                    ${testsHTML ? `
                        <h4><span class="material-icons-round">biotech</span> Tests Ordered</h4>
                        <div class="medication-list">
                            ${testsHTML}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Empty State
    renderEmptyState(icon, title, text, actionText = null, actionPage = null) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons-round">${icon}</span>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-text">${text}</p>
                ${actionText ? `<button class="btn btn-primary" onclick="App.navigateTo('${actionPage}')" id="empty-action-btn">${actionText}</button>` : ''}
            </div>
        `;
    },

    // Modal
    showModal(title, bodyHTML, footerHTML = '') {
        const existing = document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" id="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="btn-icon" onclick="Components.closeModal()" id="modal-close-btn">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="modal-body">${bodyHTML}</div>
                ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
            </div>
        `;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Components.closeModal();
        });
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }
};
