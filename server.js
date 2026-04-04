/* ============================================
   MediCap — Express Server for Cloud Run
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
const PORT = process.env.PORT || 8080; // Cloud Run uses PORT env
const JWT_SECRET = process.env.JWT_SECRET || 'medicap-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================== IN-MEMORY DATABASE ====================
// In production, replace with Cloud SQL / Firestore / MongoDB Atlas
const db = {
    users: [],
    appointments: [],
    records: [],
    doctors: []
};

// Seed doctors on startup
function seedDoctors() {
    db.doctors = [
        {
            id: 'doc-001', name: 'Dr. Priya Sharma', specialty: 'Cardiology',
            qualification: 'MBBS, MD, DM (Cardiology)', experience: 15,
            city: 'Ahmedabad', hospital: 'Sterling Hospital', fee: 800,
            rating: 4.9, reviews: 312, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Renowned cardiologist with 15+ years in interventional cardiology.'
        },
        {
            id: 'doc-002', name: 'Dr. Rajesh Patel', specialty: 'General Medicine',
            qualification: 'MBBS, MD (Medicine)', experience: 20,
            city: 'Ahmedabad', hospital: 'Apollo Hospital', fee: 500,
            rating: 4.8, reviews: 548, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Highly experienced general physician with comprehensive approach.'
        },
        {
            id: 'doc-003', name: 'Dr. Anita Desai', specialty: 'Dermatology',
            qualification: 'MBBS, MD (Dermatology)', experience: 12,
            city: 'Surat', hospital: 'SMIMER Hospital', fee: 700,
            rating: 4.7, reviews: 214, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Specializes in cosmetic dermatology and laser treatments.'
        },
        {
            id: 'doc-004', name: 'Dr. Vikram Singh', specialty: 'Orthopedics',
            qualification: 'MBBS, MS (Orthopedics)', experience: 18,
            city: 'Vadodara', hospital: 'SSG Hospital', fee: 900,
            rating: 4.8, reviews: 387, available: true,
            languages: ['English', 'Hindi'],
            about: 'Expert orthopedic surgeon in joint replacement and sports medicine.'
        },
        {
            id: 'doc-005', name: 'Dr. Meera Joshi', specialty: 'Pediatrics',
            qualification: 'MBBS, DCH, MD (Pediatrics)', experience: 10,
            city: 'Rajkot', hospital: 'Rajkot Civil Hospital', fee: 400,
            rating: 4.9, reviews: 623, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Compassionate pediatrician specializing in newborn care.'
        },
        {
            id: 'doc-006', name: 'Dr. Amit Trivedi', specialty: 'Neurology',
            qualification: 'MBBS, MD, DM (Neurology)', experience: 14,
            city: 'Ahmedabad', hospital: 'SAL Hospital', fee: 1000,
            rating: 4.6, reviews: 178, available: false,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Leading neurologist specializing in stroke and epilepsy.'
        },
        {
            id: 'doc-007', name: 'Dr. Kavita Mehta', specialty: 'Gynecology',
            qualification: 'MBBS, MS (OB-GYN)', experience: 16,
            city: 'Surat', hospital: 'Mahavir Hospital', fee: 600,
            rating: 4.8, reviews: 445, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Experienced in high-risk pregnancies and minimally invasive surgery.'
        },
        {
            id: 'doc-008', name: 'Dr. Suresh Nair', specialty: 'ENT',
            qualification: 'MBBS, MS (ENT)', experience: 11,
            city: 'Gandhinagar', hospital: 'GCS Medical College', fee: 550,
            rating: 4.5, reviews: 156, available: true,
            languages: ['English', 'Hindi'],
            about: 'ENT specialist focused on cochlear implants and sinus surgery.'
        },
        {
            id: 'doc-009', name: 'Dr. Pallavi Bhatt', specialty: 'Ophthalmology',
            qualification: 'MBBS, MS (Ophthalmology)', experience: 9,
            city: 'Vadodara', hospital: 'Baroda Eye Hospital', fee: 650,
            rating: 4.7, reviews: 198, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Specializes in cataract surgery, LASIK, and retinal disorders.'
        },
        {
            id: 'doc-010', name: 'Dr. Hardik Shah', specialty: 'Psychiatry',
            qualification: 'MBBS, MD (Psychiatry)', experience: 8,
            city: 'Ahmedabad', hospital: 'Mind Wellness Clinic', fee: 750,
            rating: 4.8, reviews: 234, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Caring psychiatrist specializing in anxiety and depression.'
        },
        {
            id: 'doc-011', name: 'Dr. Ritu Agrawal', specialty: 'Dentistry',
            qualification: 'BDS, MDS (Orthodontics)', experience: 13,
            city: 'Rajkot', hospital: 'Smile Care Dental', fee: 350,
            rating: 4.6, reviews: 412, available: true,
            languages: ['English', 'Hindi', 'Gujarati'],
            about: 'Orthodontics specialist offering braces and aligners.'
        },
        {
            id: 'doc-012', name: 'Dr. Nikhil Raval', specialty: 'Urology',
            qualification: 'MBBS, MS, MCh (Urology)', experience: 17,
            city: 'Surat', hospital: 'Kiran Hospital', fee: 850,
            rating: 4.7, reviews: 167, available: true,
            languages: ['English', 'Hindi'],
            about: 'Senior urologist with expertise in kidney stones and robotic surgery.'
        }
    ];
}

seedDoctors();

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// Optional auth — attach user if token present, but don't block
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            req.user = null;
        }
    }
    next();
}

// ==================== AUTH ROUTES ====================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, role, city } = req.body;

        // Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: 'All fields are required: name, email, phone, password.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        // Check email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        // Check if user exists
        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            id: uuidv4(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashedPassword,
            role: role || 'patient',
            city: city || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.users.push(user);

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return user (without password)
        const { password: _, ...safeUser } = user;
        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: safeUser
        });

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

        // Find user
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...safeUser } = user;
        res.json({
            message: 'Login successful!',
            token,
            user: safeUser
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// GET /api/auth/me — verify token & get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
});

// PUT /api/auth/profile — update profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const { name, phone, city, dob, gender } = req.body;
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (city) user.city = city;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    user.updatedAt = new Date().toISOString();

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
});

// PUT /api/auth/password — change password
app.put('/api/auth/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date().toISOString();

    res.json({ message: 'Password changed successfully.' });
});

// ==================== DOCTOR ROUTES ====================

// GET /api/doctors
app.get('/api/doctors', (req, res) => {
    let doctors = [...db.doctors];
    const { specialty, city, search } = req.query;

    if (specialty && specialty !== 'All') {
        doctors = doctors.filter(d => d.specialty === specialty);
    }
    if (city && city !== 'All') {
        doctors = doctors.filter(d => d.city === city);
    }
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

// GET /api/doctors/:id
app.get('/api/doctors/:id', (req, res) => {
    const doctor = db.doctors.find(d => d.id === req.params.id);
    if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }
    res.json({ doctor });
});

// ==================== APPOINTMENT ROUTES ====================

// GET /api/appointments
app.get('/api/appointments', authenticateToken, (req, res) => {
    const userAppointments = db.appointments
        .filter(a => a.userId === req.user.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ appointments: userAppointments });
});

// POST /api/appointments
app.post('/api/appointments', authenticateToken, (req, res) => {
    const { doctorId, date, time, type, notes, patientName, phone } = req.body;

    if (!doctorId || !date || !time || !type) {
        return res.status(400).json({ error: 'Doctor, date, time, and type are required.' });
    }

    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    const appointment = {
        id: 'apt-' + uuidv4().slice(0, 8),
        userId: req.user.id,
        doctorId,
        patientName: patientName || req.user.name,
        phone: phone || '',
        date,
        time,
        type,
        status: 'confirmed',
        notes: notes || '',
        createdAt: new Date().toISOString()
    };

    db.appointments.push(appointment);
    res.status(201).json({ message: 'Appointment booked successfully!', appointment });
});

// PUT /api/appointments/:id/cancel
app.put('/api/appointments/:id/cancel', authenticateToken, (req, res) => {
    const apt = db.appointments.find(a => a.id === req.params.id && a.userId === req.user.id);
    if (!apt) {
        return res.status(404).json({ error: 'Appointment not found.' });
    }

    apt.status = 'cancelled';
    apt.updatedAt = new Date().toISOString();
    res.json({ message: 'Appointment cancelled.', appointment: apt });
});

// ==================== RECORDS ROUTES ====================

// GET /api/records
app.get('/api/records', authenticateToken, (req, res) => {
    const userRecords = db.records
        .filter(r => r.userId === req.user.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ records: userRecords });
});

// POST /api/records
app.post('/api/records', authenticateToken, (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ error: 'Only doctors can create medical records.' });
    }

    const { patientId, diagnosis, notes, vitals, medications, tests } = req.body;

    const record = {
        id: 'rec-' + uuidv4().slice(0, 8),
        userId: patientId,
        doctorId: req.user.id,
        doctorName: req.user.name,
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        notes,
        vitals,
        medications: medications || [],
        tests: tests || [],
        createdAt: new Date().toISOString()
    };

    db.records.push(record);
    res.status(201).json({ message: 'Record created.', record });
});

// ==================== STATS ROUTE ====================
app.get('/api/stats', authenticateToken, (req, res) => {
    const now = new Date();
    const userAppointments = db.appointments.filter(a => a.userId === req.user.id);

    res.json({
        totalDoctors: db.doctors.length,
        totalAppointments: userAppointments.length,
        upcomingAppointments: userAppointments.filter(a =>
            new Date(a.date) >= now && a.status !== 'cancelled'
        ).length,
        completedAppointments: userAppointments.filter(a => a.status === 'completed').length,
        totalRecords: db.records.filter(r => r.userId === req.user.id).length,
        citiesServed: [...new Set(db.doctors.map(d => d.city))].length
    });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'medicap-api',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ==================== CATCH-ALL: SERVE SPA ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════╗
║     🏥 MediCap Server Running            ║
║     Port: ${PORT}                            ║
║     ENV:  ${process.env.NODE_ENV || 'development'}                  ║
║     URL:  http://localhost:${PORT}            ║
╚═══════════════════════════════════════════╝
    `);
});
