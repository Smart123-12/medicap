/* ============================================
   MediCap — Express Server for Cloud Run
   v2.0 — Role-based Auth (Patient/Doctor/Admin)
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'medicap-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== IN-MEMORY DATABASE ====================
const db = {
    users: [],
    appointments: [],
    records: [],
    doctors: []
};

// Seed doctors
function seedDoctors() {
    db.doctors = [
        { id: 'doc-001', name: 'Dr. Priya Sharma', specialty: 'Cardiology', qualification: 'MBBS, MD, DM (Cardiology)', experience: 15, city: 'Ahmedabad', hospital: 'Sterling Hospital', fee: 800, rating: 4.9, reviews: 312, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Renowned cardiologist with 15+ years in interventional cardiology.' },
        { id: 'doc-002', name: 'Dr. Rajesh Patel', specialty: 'General Medicine', qualification: 'MBBS, MD (Medicine)', experience: 20, city: 'Ahmedabad', hospital: 'Apollo Hospital', fee: 500, rating: 4.8, reviews: 548, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Highly experienced general physician.' },
        { id: 'doc-003', name: 'Dr. Anita Desai', specialty: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 12, city: 'Surat', hospital: 'SMIMER Hospital', fee: 700, rating: 4.7, reviews: 214, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Specializes in cosmetic dermatology.' },
        { id: 'doc-004', name: 'Dr. Vikram Singh', specialty: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics)', experience: 18, city: 'Vadodara', hospital: 'SSG Hospital', fee: 900, rating: 4.8, reviews: 387, available: true, languages: ['English', 'Hindi'], about: 'Expert in joint replacement and sports medicine.' },
        { id: 'doc-005', name: 'Dr. Meera Joshi', specialty: 'Pediatrics', qualification: 'MBBS, DCH, MD (Pediatrics)', experience: 10, city: 'Rajkot', hospital: 'Rajkot Civil Hospital', fee: 400, rating: 4.9, reviews: 623, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Compassionate pediatrician.' },
        { id: 'doc-006', name: 'Dr. Amit Trivedi', specialty: 'Neurology', qualification: 'MBBS, MD, DM (Neurology)', experience: 14, city: 'Ahmedabad', hospital: 'SAL Hospital', fee: 1000, rating: 4.6, reviews: 178, available: false, languages: ['English', 'Hindi', 'Gujarati'], about: 'Leading neurologist.' },
        { id: 'doc-007', name: 'Dr. Kavita Mehta', specialty: 'Gynecology', qualification: 'MBBS, MS (OB-GYN)', experience: 16, city: 'Surat', hospital: 'Mahavir Hospital', fee: 600, rating: 4.8, reviews: 445, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Experienced in high-risk pregnancies.' },
        { id: 'doc-008', name: 'Dr. Suresh Nair', specialty: 'ENT', qualification: 'MBBS, MS (ENT)', experience: 11, city: 'Gandhinagar', hospital: 'GCS Medical College', fee: 550, rating: 4.5, reviews: 156, available: true, languages: ['English', 'Hindi'], about: 'ENT specialist.' },
        { id: 'doc-009', name: 'Dr. Pallavi Bhatt', specialty: 'Ophthalmology', qualification: 'MBBS, MS (Ophthalmology)', experience: 9, city: 'Vadodara', hospital: 'Baroda Eye Hospital', fee: 650, rating: 4.7, reviews: 198, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Specializes in LASIK and retinal disorders.' },
        { id: 'doc-010', name: 'Dr. Hardik Shah', specialty: 'Psychiatry', qualification: 'MBBS, MD (Psychiatry)', experience: 8, city: 'Ahmedabad', hospital: 'Mind Wellness Clinic', fee: 750, rating: 4.8, reviews: 234, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Specializing in anxiety and depression.' },
        { id: 'doc-011', name: 'Dr. Ritu Agrawal', specialty: 'Dentistry', qualification: 'BDS, MDS (Orthodontics)', experience: 13, city: 'Rajkot', hospital: 'Smile Care Dental', fee: 350, rating: 4.6, reviews: 412, available: true, languages: ['English', 'Hindi', 'Gujarati'], about: 'Orthodontics specialist.' },
        { id: 'doc-012', name: 'Dr. Nikhil Raval', specialty: 'Urology', qualification: 'MBBS, MS, MCh (Urology)', experience: 17, city: 'Surat', hospital: 'Kiran Hospital', fee: 850, rating: 4.7, reviews: 167, available: true, languages: ['English', 'Hindi'], about: 'Senior urologist.' }
    ];
}

// Seed default admin
async function seedAdmin() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    db.users.push({
        id: 'admin-001',
        name: 'System Admin',
        email: 'admin@medicap.com',
        phone: '+91 90000 00000',
        password: hashedPassword,
        role: 'admin',
        city: 'Ahmedabad',
        verified: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
}

seedDoctors();
seedAdmin();

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// Role check middleware
function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
        }
        next();
    };
}

// ==================== AUTH ROUTES ====================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, role, city, specialty, hospital, qualification } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: 'All fields are required: name, email, phone, password.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }
        if (!/^\+?\d[\d\s-]{8,14}$/.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({ error: 'Please provide a valid phone number.' });
        }

        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = (role === 'doctor' || role === 'admin') ? role : 'patient';

        const user = {
            id: uuidv4(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashedPassword,
            role: userRole,
            city: city || '',
            specialty: userRole === 'doctor' ? (specialty || '') : undefined,
            hospital: userRole === 'doctor' ? (hospital || '') : undefined,
            qualification: userRole === 'doctor' ? (qualification || '') : undefined,
            verified: false,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.users.push(user);

        // Auto-verify after 3 seconds (simulating email verification)
        setTimeout(() => {
            const u = db.users.find(x => x.id === user.id);
            if (u) u.verified = true;
        }, 3000);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...safeUser } = user;
        res.status(201).json({ message: 'Account created successfully!', token, user: safeUser });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Your account has been deactivated. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...safeUser } = user;
        res.json({ message: 'Login successful!', token, user: safeUser });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
});

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { name, phone, city, dob, gender, specialty, hospital, qualification } = req.body;
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (city) user.city = city;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (user.role === 'doctor') {
        if (specialty) user.specialty = specialty;
        if (hospital) user.hospital = hospital;
        if (qualification) user.qualification = qualification;
    }
    user.updatedAt = new Date().toISOString();

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
});

// PUT /api/auth/password
app.put('/api/auth/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    res.json({ message: 'Password changed successfully.' });
});

// POST /api/auth/verify — manual verify trigger
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.verified = true;
    user.updatedAt = new Date().toISOString();
    res.json({ message: 'Account verified successfully!', verified: true });
});

// ==================== ADMIN ROUTES ====================

// GET /api/admin/users — list all users
app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
    const users = db.users.map(u => {
        const { password: _, ...safeUser } = u;
        return safeUser;
    });
    res.json({ users, total: users.length });
});

// PUT /api/admin/users/:id/toggle — activate/deactivate user
app.put('/api/admin/users/:id/toggle', authenticateToken, requireRole('admin'), (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot deactivate admin.' });
    user.active = !user.active;
    user.updatedAt = new Date().toISOString();
    const { password: _, ...safeUser } = user;
    res.json({ message: `User ${user.active ? 'activated' : 'deactivated'}.`, user: safeUser });
});

// PUT /api/admin/users/:id/verify — verify user
app.put('/api/admin/users/:id/verify', authenticateToken, requireRole('admin'), (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.verified = true;
    user.updatedAt = new Date().toISOString();
    const { password: _, ...safeUser } = user;
    res.json({ message: 'User verified.', user: safeUser });
});

// DELETE /api/admin/users/:id — delete user
app.delete('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found.' });
    if (db.users[idx].role === 'admin') return res.status(403).json({ error: 'Cannot delete admin.' });
    db.users.splice(idx, 1);
    db.appointments = db.appointments.filter(a => a.userId !== req.params.id);
    db.records = db.records.filter(r => r.userId !== req.params.id);
    res.json({ message: 'User deleted.' });
});

// GET /api/admin/stats — admin dashboard stats
app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (req, res) => {
    const totalUsers = db.users.length;
    const patients = db.users.filter(u => u.role === 'patient').length;
    const doctors = db.users.filter(u => u.role === 'doctor').length;
    const verified = db.users.filter(u => u.verified).length;
    const unverified = db.users.filter(u => !u.verified).length;
    const totalAppointments = db.appointments.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = db.appointments.filter(a => a.date === todayStr).length;

    res.json({
        totalUsers, patients, doctors, verified, unverified,
        totalAppointments, todayAppointments,
        totalDoctors: db.doctors.length,
        totalRecords: db.records.length,
        citiesServed: [...new Set(db.doctors.map(d => d.city))].length
    });
});

// GET /api/admin/appointments — all appointments
app.get('/api/admin/appointments', authenticateToken, requireRole('admin'), (req, res) => {
    res.json({ appointments: db.appointments, total: db.appointments.length });
});

// ==================== DOCTOR ROUTES ====================

app.get('/api/doctors', (req, res) => {
    let doctors = [...db.doctors];
    const { specialty, city, search } = req.query;
    if (specialty && specialty !== 'All') doctors = doctors.filter(d => d.specialty === specialty);
    if (city && city !== 'All') doctors = doctors.filter(d => d.city === city);
    if (search) {
        const q = search.toLowerCase();
        doctors = doctors.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.specialty.toLowerCase().includes(q) ||
            d.hospital.toLowerCase().includes(q)
        );
    }
    res.json({ doctors, total: doctors.length });
});

app.get('/api/doctors/:id', (req, res) => {
    const doctor = db.doctors.find(d => d.id === req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
    res.json({ doctor });
});

// ==================== APPOINTMENT ROUTES ====================

// GET — patient sees own, doctor sees assigned, admin sees all
app.get('/api/appointments', authenticateToken, (req, res) => {
    let appointments;
    if (req.user.role === 'admin') {
        appointments = db.appointments;
    } else if (req.user.role === 'doctor') {
        // Match by doctor name or ID
        const docUser = db.users.find(u => u.id === req.user.id);
        appointments = db.appointments.filter(a => {
            const doc = db.doctors.find(d => d.id === a.doctorId);
            return doc && (doc.name === (docUser ? docUser.name : '') || a.doctorId === req.user.id);
        });
    } else {
        appointments = db.appointments.filter(a => a.userId === req.user.id);
    }
    appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ appointments });
});

// POST — book appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
    const { doctorId, date, time, type, notes, patientName, phone } = req.body;
    if (!doctorId || !date || !time || !type) {
        return res.status(400).json({ error: 'Doctor, date, time, and type are required.' });
    }
    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const appointment = {
        id: 'apt-' + uuidv4().slice(0, 8),
        userId: req.user.id,
        doctorId,
        patientName: patientName || req.user.name,
        phone: phone || '',
        date, time, type,
        status: 'confirmed',
        notes: notes || '',
        createdAt: new Date().toISOString()
    };

    db.appointments.push(appointment);
    res.status(201).json({ message: 'Appointment booked!', appointment });
});

// PUT — cancel
app.put('/api/appointments/:id/cancel', authenticateToken, (req, res) => {
    const apt = db.appointments.find(a => a.id === req.params.id &&
        (a.userId === req.user.id || req.user.role === 'admin' || req.user.role === 'doctor'));
    if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
    apt.status = 'cancelled';
    apt.updatedAt = new Date().toISOString();
    res.json({ message: 'Appointment cancelled.', appointment: apt });
});

// PUT — complete (doctor/admin only)
app.put('/api/appointments/:id/complete', authenticateToken, requireRole('doctor', 'admin'), (req, res) => {
    const apt = db.appointments.find(a => a.id === req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
    apt.status = 'completed';
    apt.updatedAt = new Date().toISOString();
    res.json({ message: 'Appointment marked complete.', appointment: apt });
});

// ==================== RECORDS ROUTES ====================

app.get('/api/records', authenticateToken, (req, res) => {
    let records;
    if (req.user.role === 'admin') {
        records = db.records;
    } else if (req.user.role === 'doctor') {
        records = db.records.filter(r => r.doctorId === req.user.id);
    } else {
        records = db.records.filter(r => r.userId === req.user.id);
    }
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ records });
});

app.post('/api/records', authenticateToken, requireRole('doctor', 'admin'), (req, res) => {
    const { patientId, diagnosis, notes, vitals, medications, tests } = req.body;
    const record = {
        id: 'rec-' + uuidv4().slice(0, 8),
        userId: patientId,
        doctorId: req.user.id,
        doctorName: req.user.name,
        date: new Date().toISOString().split('T')[0],
        diagnosis, notes, vitals,
        medications: medications || [],
        tests: tests || [],
        createdAt: new Date().toISOString()
    };
    db.records.push(record);
    res.status(201).json({ message: 'Record created.', record });
});

// ==================== STATS ====================
app.get('/api/stats', authenticateToken, (req, res) => {
    const now = new Date();
    let userAppointments;
    if (req.user.role === 'admin') {
        userAppointments = db.appointments;
    } else {
        userAppointments = db.appointments.filter(a => a.userId === req.user.id);
    }
    res.json({
        totalDoctors: db.doctors.length,
        totalAppointments: userAppointments.length,
        upcomingAppointments: userAppointments.filter(a => new Date(a.date) >= now && a.status !== 'cancelled').length,
        completedAppointments: userAppointments.filter(a => a.status === 'completed').length,
        totalRecords: db.records.filter(r => r.userId === req.user.id || req.user.role === 'admin').length,
        citiesServed: [...new Set(db.doctors.map(d => d.city))].length
    });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', service: 'medicap-api', version: '2.0.0', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ==================== SPA CATCH-ALL ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════╗
║     🏥 MediCap Server v2.0              ║
║     Port: ${PORT}                            ║
║     ENV:  ${process.env.NODE_ENV || 'development'}                  ║
║     URL:  http://localhost:${PORT}            ║
║                                           ║
║     Admin Login:                          ║
║     Email: admin@medicap.com              ║
║     Pass:  admin123                       ║
╚═══════════════════════════════════════════╝
    `);
});
