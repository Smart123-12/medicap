/* ============================================
   MediCap — Express Server for Cloud Run
   v3.0 — SQLite Database + Full RBAC
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
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const xss = require('xss-clean');
const hpp = require('hpp');
const apicache = require('apicache');
const cookieParser = require('cookie-parser');
const cache = apicache.middleware;

// Google Cloud Services
let gcloud = null;
try {
  gcloud = require('./services/google-cloud');
} catch (e) {}

// ==================== DATABASE SETUP ====================
let Database;
let db;
try {
  Database = require('better-sqlite3');
  const dbDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  db = new Database(path.join(dbDir, 'medicap.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('✅ SQLite database connected');
} catch (err) {
  console.warn('⚠️ SQLite not available, using in-memory fallback');
  db = null;
}

// ==================== APP SETUP ====================
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'medicap-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(compression()); // EFFICIENCY: Gzip compression to improve performance

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://accounts.google.com',
          'https://www.googletagmanager.com',
          'https://www.google.com',
          'https://maps.googleapis.com',
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// SECURITY: Rate Limiting to prevent brute-force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' })); // SECURITY: Body parser limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// SECURITY: Prevent Cross-Site Scripting (XSS)
app.use(xss());

// SECURITY: Prevent HTTP Parameter Pollution
app.use(hpp());

// SECURITY: Parse Cookies securely
app.use(cookieParser());

// EFFICIENCY: Cache static or slow data endpoints
app.use('/api/stats', cache('5 minutes'));
app.use('/api/health', cache('1 minute'));

// Google Cloud request logging
if (gcloud && gcloud.requestLogger) app.use(gcloud.requestLogger);

// ==================== DATABASE LAYER ====================
// Abstraction layer that works with SQLite or in-memory fallback

const memDb = { users: [], appointments: [], records: [], doctors: [] };

function initDatabase() {
  if (db) {
    // Create tables
    db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'patient',
                city TEXT DEFAULT '',
                specialty TEXT DEFAULT '',
                hospital TEXT DEFAULT '',
                qualification TEXT DEFAULT '',
                dob TEXT DEFAULT '',
                gender TEXT DEFAULT '',
                verified INTEGER DEFAULT 0,
                active INTEGER DEFAULT 1,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS doctors (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                qualification TEXT DEFAULT '',
                experience INTEGER DEFAULT 0,
                city TEXT DEFAULT '',
                hospital TEXT DEFAULT '',
                fee INTEGER DEFAULT 500,
                rating REAL DEFAULT 4.5,
                reviews INTEGER DEFAULT 0,
                available INTEGER DEFAULT 1,
                languages TEXT DEFAULT '[]',
                about TEXT DEFAULT '',
                createdAt TEXT DEFAULT '',
                addedBy TEXT DEFAULT 'system'
            );

            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                doctorId TEXT NOT NULL,
                patientName TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                type TEXT DEFAULT 'consultation',
                status TEXT DEFAULT 'confirmed',
                notes TEXT DEFAULT '',
                createdAt TEXT NOT NULL,
                updatedAt TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS records (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                doctorId TEXT NOT NULL,
                doctorName TEXT DEFAULT '',
                date TEXT NOT NULL,
                diagnosis TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                vitals TEXT DEFAULT '',
                medications TEXT DEFAULT '[]',
                tests TEXT DEFAULT '[]',
                createdAt TEXT NOT NULL
            );
        `);
    console.log('✅ Database tables initialized');
  }
}

// DB helper functions
const DB = {
  // === USERS ===
  findUserByEmail(email) {
    if (db) {
      return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    }
    return memDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id) {
    if (db) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    return memDb.users.find((u) => u.id === id);
  },

  createUser(user) {
    if (db) {
      db.prepare(
        `INSERT INTO users (id, name, email, phone, password, role, city, specialty, hospital, qualification, verified, active, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        user.id,
        user.name,
        user.email,
        user.phone,
        user.password,
        user.role,
        user.city || '',
        user.specialty || '',
        user.hospital || '',
        user.qualification || '',
        user.verified ? 1 : 0,
        user.active ? 1 : 0,
        user.createdAt,
        user.updatedAt,
      );
      return this.findUserById(user.id);
    }
    memDb.users.push(user);
    return user;
  },

  updateUser(id, updates) {
    if (db) {
      const sets = [];
      const values = [];
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'verified' || key === 'active') {
          sets.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      }
      sets.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);
      db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
      return this.findUserById(id);
    }
    const user = memDb.users.find((u) => u.id === id);
    if (user) Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    return user;
  },

  deleteUser(id) {
    if (db) {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      db.prepare('DELETE FROM appointments WHERE userId = ?').run(id);
      db.prepare('DELETE FROM records WHERE userId = ?').run(id);
      return true;
    }
    const idx = memDb.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memDb.users.splice(idx, 1);
      memDb.appointments = memDb.appointments.filter((a) => a.userId !== id);
      memDb.records = memDb.records.filter((r) => r.userId !== id);
      return true;
    }
    return false;
  },

  getAllUsers() {
    if (db) {
      return db
        .prepare('SELECT * FROM users ORDER BY createdAt DESC')
        .all()
        .map((u) => {
          u.verified = !!u.verified;
          u.active = !!u.active;
          return u;
        });
    }
    return memDb.users;
  },

  // === DOCTORS ===
  getAllDoctors(filters = {}) {
    if (db) {
      let query = 'SELECT * FROM doctors WHERE 1=1';
      const params = [];
      if (filters.specialty && filters.specialty !== 'All') {
        query += ' AND specialty = ?';
        params.push(filters.specialty);
      }
      if (filters.city && filters.city !== 'All') {
        query += ' AND city = ?';
        params.push(filters.city);
      }
      if (filters.search) {
        query += ' AND (LOWER(name) LIKE ? OR LOWER(specialty) LIKE ? OR LOWER(hospital) LIKE ?)';
        const q = `%${filters.search.toLowerCase()}%`;
        params.push(q, q, q);
      }
      return db
        .prepare(query)
        .all(params)
        .map((d) => {
          d.available = !!d.available;
          try {
            d.languages = JSON.parse(d.languages);
          } catch (e) {
            d.languages = [];
          }
          return d;
        });
    }
    let docs = [...memDb.doctors];
    if (filters.specialty && filters.specialty !== 'All')
      docs = docs.filter((d) => d.specialty === filters.specialty);
    if (filters.city && filters.city !== 'All') docs = docs.filter((d) => d.city === filters.city);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q),
      );
    }
    return docs;
  },

  findDoctorById(id) {
    if (db) {
      const d = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
      if (d) {
        d.available = !!d.available;
        try {
          d.languages = JSON.parse(d.languages);
        } catch (e) {
          d.languages = [];
        }
      }
      return d;
    }
    return memDb.doctors.find((d) => d.id === id);
  },

  createDoctor(doctor) {
    if (db) {
      db.prepare(
        `INSERT INTO doctors (id, name, specialty, qualification, experience, city, hospital, fee, rating, reviews, available, languages, about, createdAt, addedBy)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        doctor.id,
        doctor.name,
        doctor.specialty,
        doctor.qualification || '',
        doctor.experience || 0,
        doctor.city || '',
        doctor.hospital || '',
        doctor.fee || 500,
        doctor.rating || 4.5,
        doctor.reviews || 0,
        doctor.available ? 1 : 0,
        JSON.stringify(doctor.languages || []),
        doctor.about || '',
        doctor.createdAt || new Date().toISOString(),
        doctor.addedBy || 'system',
      );
      return this.findDoctorById(doctor.id);
    }
    memDb.doctors.push(doctor);
    return doctor;
  },

  updateDoctor(id, updates) {
    if (db) {
      const sets = [];
      const values = [];
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'available') {
          sets.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else if (key === 'languages') {
          sets.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      }
      values.push(id);
      db.prepare(`UPDATE doctors SET ${sets.join(', ')} WHERE id = ?`).run(...values);
      return this.findDoctorById(id);
    }
    const doc = memDb.doctors.find((d) => d.id === id);
    if (doc) Object.assign(doc, updates);
    return doc;
  },

  deleteDoctor(id) {
    if (db) {
      db.prepare('DELETE FROM doctors WHERE id = ?').run(id);
      return true;
    }
    const idx = memDb.doctors.findIndex((d) => d.id === id);
    if (idx !== -1) {
      memDb.doctors.splice(idx, 1);
      return true;
    }
    return false;
  },

  getDoctorCount() {
    if (db) return db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    return memDb.doctors.length;
  },

  // === APPOINTMENTS ===
  getAppointments(userId, role) {
    if (db) {
      let rows;
      if (role === 'admin')
        rows = db.prepare('SELECT * FROM appointments ORDER BY date DESC').all();
      else if (role === 'doctor')
        rows = db
          .prepare('SELECT * FROM appointments WHERE doctorId = ? ORDER BY date DESC')
          .all(userId);
      else
        rows = db
          .prepare('SELECT * FROM appointments WHERE userId = ? ORDER BY date DESC')
          .all(userId);
      return rows;
    }
    let apts;
    if (role === 'admin') apts = memDb.appointments;
    else if (role === 'doctor') apts = memDb.appointments.filter((a) => a.doctorId === userId);
    else apts = memDb.appointments.filter((a) => a.userId === userId);
    return apts.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  createAppointment(apt) {
    if (db) {
      db.prepare(
        `INSERT INTO appointments (id, userId, doctorId, patientName, phone, date, time, type, status, notes, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        apt.id,
        apt.userId,
        apt.doctorId,
        apt.patientName || '',
        apt.phone || '',
        apt.date,
        apt.time,
        apt.type,
        apt.status || 'confirmed',
        apt.notes || '',
        apt.createdAt,
      );
      return db.prepare('SELECT * FROM appointments WHERE id = ?').get(apt.id);
    }
    memDb.appointments.push(apt);
    return apt;
  },

  updateAppointmentStatus(id, status, userId, role) {
    if (db) {
      if (role === 'admin' || role === 'doctor') {
        db.prepare('UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ?').run(
          status,
          new Date().toISOString(),
          id,
        );
      } else {
        db.prepare(
          'UPDATE appointments SET status = ?, updatedAt = ? WHERE id = ? AND userId = ?',
        ).run(status, new Date().toISOString(), id, userId);
      }
      return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    }
    const apt = memDb.appointments.find(
      (a) => a.id === id && (a.userId === userId || role === 'admin' || role === 'doctor'),
    );
    if (apt) {
      apt.status = status;
      apt.updatedAt = new Date().toISOString();
    }
    return apt;
  },

  getAllAppointmentsCount() {
    if (db) return db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    return memDb.appointments.length;
  },

  // === RECORDS ===
  getRecords(userId, role) {
    if (db) {
      if (role === 'admin') return db.prepare('SELECT * FROM records ORDER BY date DESC').all();
      if (role === 'doctor')
        return db
          .prepare('SELECT * FROM records WHERE doctorId = ? ORDER BY date DESC')
          .all(userId);
      return db.prepare('SELECT * FROM records WHERE userId = ? ORDER BY date DESC').all(userId);
    }
    let recs;
    if (role === 'admin') recs = memDb.records;
    else if (role === 'doctor') recs = memDb.records.filter((r) => r.doctorId === userId);
    else recs = memDb.records.filter((r) => r.userId === userId);
    return recs.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  createRecord(record) {
    if (db) {
      db.prepare(
        `INSERT INTO records (id, userId, doctorId, doctorName, date, diagnosis, notes, vitals, medications, tests, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id,
        record.userId,
        record.doctorId,
        record.doctorName || '',
        record.date,
        record.diagnosis || '',
        record.notes || '',
        record.vitals || '',
        JSON.stringify(record.medications || []),
        JSON.stringify(record.tests || []),
        record.createdAt,
      );
      return db.prepare('SELECT * FROM records WHERE id = ?').get(record.id);
    }
    memDb.records.push(record);
    return record;
  },

  getRecordCount() {
    if (db) return db.prepare('SELECT COUNT(*) as count FROM records').get().count;
    return memDb.records.length;
  },
};

// ==================== SEED DATA ====================
async function seedData() {
  // Check if admin already exists
  const existingAdmin = DB.findUserByEmail('admin@medicap.com');
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    DB.createUser({
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
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Admin user seeded');
  }

  // Seed doctors if none exist
  if (DB.getDoctorCount() === 0) {
    const seedDocs = [
      {
        id: 'doc-001',
        name: 'Dr. Priya Sharma',
        specialty: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: 15,
        city: 'Ahmedabad',
        hospital: 'Sterling Hospital',
        fee: 800,
        rating: 4.9,
        reviews: 312,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Renowned cardiologist with 15+ years in interventional cardiology.',
      },
      {
        id: 'doc-002',
        name: 'Dr. Rajesh Patel',
        specialty: 'General Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experience: 20,
        city: 'Ahmedabad',
        hospital: 'Apollo Hospital',
        fee: 500,
        rating: 4.8,
        reviews: 548,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Highly experienced general physician.',
      },
      {
        id: 'doc-003',
        name: 'Dr. Anita Desai',
        specialty: 'Dermatology',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 12,
        city: 'Surat',
        hospital: 'SMIMER Hospital',
        fee: 700,
        rating: 4.7,
        reviews: 214,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Specializes in cosmetic dermatology.',
      },
      {
        id: 'doc-004',
        name: 'Dr. Vikram Singh',
        specialty: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 18,
        city: 'Vadodara',
        hospital: 'SSG Hospital',
        fee: 900,
        rating: 4.8,
        reviews: 387,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'Expert in joint replacement and sports medicine.',
      },
      {
        id: 'doc-005',
        name: 'Dr. Meera Joshi',
        specialty: 'Pediatrics',
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        experience: 10,
        city: 'Rajkot',
        hospital: 'Rajkot Civil Hospital',
        fee: 400,
        rating: 4.9,
        reviews: 623,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Compassionate pediatrician.',
      },
      {
        id: 'doc-006',
        name: 'Dr. Amit Trivedi',
        specialty: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: 14,
        city: 'Ahmedabad',
        hospital: 'SAL Hospital',
        fee: 1000,
        rating: 4.6,
        reviews: 178,
        available: false,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Leading neurologist.',
      },
      {
        id: 'doc-007',
        name: 'Dr. Kavita Mehta',
        specialty: 'Gynecology',
        qualification: 'MBBS, MS (OB-GYN)',
        experience: 16,
        city: 'Surat',
        hospital: 'Mahavir Hospital',
        fee: 600,
        rating: 4.8,
        reviews: 445,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Experienced in high-risk pregnancies.',
      },
      {
        id: 'doc-008',
        name: 'Dr. Suresh Nair',
        specialty: 'ENT',
        qualification: 'MBBS, MS (ENT)',
        experience: 11,
        city: 'Gandhinagar',
        hospital: 'GCS Medical College',
        fee: 550,
        rating: 4.5,
        reviews: 156,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'ENT specialist.',
      },
      {
        id: 'doc-009',
        name: 'Dr. Pallavi Bhatt',
        specialty: 'Ophthalmology',
        qualification: 'MBBS, MS (Ophthalmology)',
        experience: 9,
        city: 'Vadodara',
        hospital: 'Baroda Eye Hospital',
        fee: 650,
        rating: 4.7,
        reviews: 198,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Specializes in LASIK and retinal disorders.',
      },
      {
        id: 'doc-010',
        name: 'Dr. Hardik Shah',
        specialty: 'Psychiatry',
        qualification: 'MBBS, MD (Psychiatry)',
        experience: 8,
        city: 'Ahmedabad',
        hospital: 'Mind Wellness Clinic',
        fee: 750,
        rating: 4.8,
        reviews: 234,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Specializing in anxiety and depression.',
      },
      {
        id: 'doc-011',
        name: 'Dr. Ritu Agrawal',
        specialty: 'Dentistry',
        qualification: 'BDS, MDS (Orthodontics)',
        experience: 13,
        city: 'Rajkot',
        hospital: 'Smile Care Dental',
        fee: 350,
        rating: 4.6,
        reviews: 412,
        available: true,
        languages: ['English', 'Hindi', 'Gujarati'],
        about: 'Orthodontics specialist.',
      },
      {
        id: 'doc-012',
        name: 'Dr. Nikhil Raval',
        specialty: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology)',
        experience: 17,
        city: 'Surat',
        hospital: 'Kiran Hospital',
        fee: 850,
        rating: 4.7,
        reviews: 167,
        available: true,
        languages: ['English', 'Hindi'],
        about: 'Senior urologist.',
      },
    ];
    seedDocs.forEach((d) => DB.createDoctor(d));
    console.log(`✅ ${seedDocs.length} doctors seeded`);
  }
}

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

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

function safeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  if (typeof safe.verified === 'number') safe.verified = !!safe.verified;
  if (typeof safe.active === 'number') safe.active = !!safe.active;
  return safe;
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, city, specialty, hospital, qualification } =
      req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: 'All fields are required: name, email, phone, password.' });
    }
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const existing = DB.findUserByEmail(email);
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = ['doctor', 'admin'].includes(role) ? role : 'patient';

    const user = DB.createUser({
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: userRole,
      city: city || '',
      specialty: userRole === 'doctor' ? specialty || '' : '',
      hospital: userRole === 'doctor' ? hospital || '' : '',
      qualification: userRole === 'doctor' ? qualification || '' : '',
      verified: false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-verify after 3 seconds
    setTimeout(() => {
      DB.updateUser(user.id, { verified: true });
    }, 3000);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.status(201).json({ message: 'Account created successfully!', token, user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = DB.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (user.active === false || user.active === 0)
      return res.status(403).json({ error: 'Account deactivated. Contact admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.json({ message: 'Login successful!', token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = DB.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: safeUser(user) });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, phone, city, dob, gender, specialty, hospital, qualification } = req.body;
  const updates = {};
  if (name) updates.name = name.trim();
  if (phone) updates.phone = phone.trim();
  if (city) updates.city = city;
  if (dob) updates.dob = dob;
  if (gender) updates.gender = gender;
  if (req.user.role === 'doctor') {
    if (specialty) updates.specialty = specialty;
    if (hospital) updates.hospital = hospital;
    if (qualification) updates.qualification = qualification;
  }
  const user = DB.updateUser(req.user.id, updates);
  res.json({ message: 'Profile updated.', user: safeUser(user) });
});

app.put('/api/auth/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Both passwords required.' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  const user = DB.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  DB.updateUser(req.user.id, { password: hashed });
  res.json({ message: 'Password changed successfully.' });
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  DB.updateUser(req.user.id, { verified: true });
  res.json({ message: 'Account verified!', verified: true });
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = DB.getAllUsers().map((u) => safeUser(u));
  res.json({ users, total: users.length });
});

app.put('/api/admin/users/:id/toggle', authenticateToken, requireRole('admin'), (req, res) => {
  const user = DB.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Cannot deactivate admin.' });
  const updated = DB.updateUser(req.params.id, {
    active: !user.active && user.active !== 0 ? false : true,
  });
  res.json({
    message: `User ${updated.active ? 'activated' : 'deactivated'}.`,
    user: safeUser(updated),
  });
});

app.put('/api/admin/users/:id/verify', authenticateToken, requireRole('admin'), (req, res) => {
  const user = DB.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const updated = DB.updateUser(req.params.id, { verified: true });
  res.json({ message: 'User verified.', user: safeUser(updated) });
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const user = DB.findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin.' });
  DB.deleteUser(req.params.id);
  res.json({ message: 'User deleted.' });
});

// Admin: Add new doctor to directory
app.post('/api/admin/doctors', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, specialty, qualification, experience, city, hospital, fee, about, languages } =
    req.body;
  if (!name || !specialty)
    return res.status(400).json({ error: 'Doctor name and specialty are required.' });
  const doctor = DB.createDoctor({
    id: 'doc-' + uuidv4().slice(0, 8),
    name,
    specialty,
    qualification: qualification || '',
    experience: parseInt(experience) || 0,
    city: city || '',
    hospital: hospital || '',
    fee: parseInt(fee) || 500,
    rating: 4.5,
    reviews: 0,
    available: true,
    languages: languages || ['English', 'Hindi'],
    about: about || '',
    createdAt: new Date().toISOString(),
    addedBy: req.user.id,
  });
  res.status(201).json({ message: 'Doctor added!', doctor });
});

// Admin: Update doctor
app.put('/api/admin/doctors/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const doctor = DB.findDoctorById(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
  const updated = DB.updateDoctor(req.params.id, req.body);
  res.json({ message: 'Doctor updated.', doctor: updated });
});

// Admin: Delete doctor
app.delete('/api/admin/doctors/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const doctor = DB.findDoctorById(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
  DB.deleteDoctor(req.params.id);
  res.json({ message: 'Doctor removed.' });
});

// Admin: Add patient (create user with patient role)
app.post('/api/admin/patients', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, email, phone, city, password } = req.body;
  if (!name || !email || !phone)
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  const existing = DB.findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already exists.' });
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password || 'medicap123', salt);
  const user = DB.createUser({
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashed,
    role: 'patient',
    city: city || '',
    verified: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  res.status(201).json({ message: 'Patient added!', user: safeUser(user) });
});

app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (req, res) => {
  const allUsers = DB.getAllUsers();
  const todayStr = new Date().toISOString().split('T')[0];
  res.json({
    totalUsers: allUsers.length,
    patients: allUsers.filter((u) => u.role === 'patient').length,
    doctors: allUsers.filter((u) => u.role === 'doctor').length,
    verified: allUsers.filter((u) => u.verified).length,
    unverified: allUsers.filter((u) => !u.verified).length,
    totalAppointments: DB.getAllAppointmentsCount(),
    totalDoctors: DB.getDoctorCount(),
    totalRecords: DB.getRecordCount(),
    citiesServed: [...new Set(DB.getAllDoctors().map((d) => d.city))].length,
  });
});

// ==================== DOCTOR ROUTES ====================

app.get('/api/doctors', (req, res) => {
  const doctors = DB.getAllDoctors(req.query);
  res.json({ doctors, total: doctors.length });
});

app.get('/api/doctors/:id', (req, res) => {
  const doctor = DB.findDoctorById(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
  res.json({ doctor });
});

// ==================== APPOINTMENT ROUTES ====================

app.get('/api/appointments', authenticateToken, (req, res) => {
  const appointments = DB.getAppointments(req.user.id, req.user.role);
  res.json({ appointments });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const { doctorId, date, time, type, notes, patientName, phone } = req.body;
  if (!doctorId || !date || !time || !type)
    return res.status(400).json({ error: 'Doctor, date, time, and type required.' });
  const doctor = DB.findDoctorById(doctorId);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

  const apt = DB.createAppointment({
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
    createdAt: new Date().toISOString(),
  });
  res.status(201).json({ message: 'Appointment booked!', appointment: apt });
});

app.put('/api/appointments/:id/cancel', authenticateToken, (req, res) => {
  const apt = DB.updateAppointmentStatus(req.params.id, 'cancelled', req.user.id, req.user.role);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
  res.json({ message: 'Appointment cancelled.', appointment: apt });
});

app.put(
  '/api/appointments/:id/complete',
  authenticateToken,
  requireRole('doctor', 'admin'),
  (req, res) => {
    const apt = DB.updateAppointmentStatus(req.params.id, 'completed', req.user.id, req.user.role);
    if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Appointment completed.', appointment: apt });
  },
);

// ==================== RECORDS ROUTES ====================

app.get('/api/records', authenticateToken, (req, res) => {
  const records = DB.getRecords(req.user.id, req.user.role);
  res.json({ records });
});

app.post('/api/records', authenticateToken, requireRole('doctor', 'admin'), (req, res) => {
  const { patientId, diagnosis, notes, vitals, medications, tests } = req.body;
  const record = DB.createRecord({
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
    createdAt: new Date().toISOString(),
  });
  res.status(201).json({ message: 'Record created.', record });
});

// ==================== STATS ====================
app.get('/api/stats', authenticateToken, (req, res) => {
  const now = new Date();
  const appointments = DB.getAppointments(req.user.id, req.user.role);
  res.json({
    totalDoctors: DB.getDoctorCount(),
    totalAppointments: appointments.length,
    upcomingAppointments: appointments.filter(
      (a) => new Date(a.date) >= now && a.status !== 'cancelled',
    ).length,
    completedAppointments: appointments.filter((a) => a.status === 'completed').length,
    totalRecords: DB.getRecords(req.user.id, req.user.role).length,
    citiesServed: [...new Set(DB.getAllDoctors().map((d) => d.city))].length,
  });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (req, res) => {
  const cloudMeta = gcloud ? await gcloud.getCloudMetadata() : { project: 'local' };
  res.json({
    status: 'healthy',
    service: 'medicap-api',
    version: '3.1.0',
    database: db ? 'sqlite' : 'memory',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cloud: cloudMeta,
    environment: process.env.NODE_ENV || 'development',
    googleCloud: {
      project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || null,
      region: process.env.CLOUD_RUN_REGION || null,
      service: process.env.K_SERVICE || null,
      revision: process.env.K_REVISION || null,
    },
  });
});

// ==================== SPA CATCH-ALL ====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  if (gcloud) gcloud.reportError(err, { path: req.path, method: req.method });
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START ====================
async function start() {
  initDatabase();
  await seedData();
  if (gcloud && gcloud.initGoogleCloud) gcloud.initGoogleCloud();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║      🏥 MediCap Server v3.0                  ║
║      Port: ${PORT}                                ║
║      DB:   ${db ? 'SQLite (persistent)' : 'In-Memory'}             ║
║      ENV:  ${(process.env.NODE_ENV || 'development').padEnd(20)}         ║
║      URL:  http://localhost:${PORT}                ║
║                                               ║
║      Admin:  admin@medicap.com / admin123     ║
╚═══════════════════════════════════════════════╝
        `);
  });
}
start();
