/* ============================================
   MediCap — API Integration Tests
   Comprehensive test suite for all endpoints
   ============================================ */

const http = require('http');
const assert = require('assert');

const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';
let adminToken = '';
let patientToken = '';
let doctorToken = '';
let testDoctorId = '';
let testAppointmentId = '';
let testPatientId = '';

// HTTP helper
function apiCall(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Test results
let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
    try {
        await fn();
        passed++;
        results.push({ name, status: '✅ PASS' });
        console.log(`  ✅ ${name}`);
    } catch (err) {
        failed++;
        results.push({ name, status: '❌ FAIL', error: err.message });
        console.log(`  ❌ ${name}: ${err.message}`);
    }
}

// ==================== TEST SUITE ====================

async function runTests() {
    console.log('\n🧪 MediCap API Test Suite\n');
    console.log('=' .repeat(50));

    // ========== HEALTH CHECK TESTS ==========
    console.log('\n📋 Health Check Tests:');

    await test('GET /api/health returns 200', async () => {
        const res = await apiCall('GET', '/api/health');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.status, 'healthy');
    });

    await test('Health check returns version', async () => {
        const res = await apiCall('GET', '/api/health');
        assert.ok(res.body.version.startsWith('3.'));
    });

    await test('Health check returns database type', async () => {
        const res = await apiCall('GET', '/api/health');
        assert.ok(['sqlite', 'memory'].includes(res.body.database));
    });

    // ========== AUTH TESTS ==========
    console.log('\n🔐 Authentication Tests:');

    await test('POST /api/auth/login with admin credentials', async () => {
        const res = await apiCall('POST', '/api/auth/login', {
            email: 'admin@medicap.com', password: 'admin123'
        });
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.token);
        assert.strictEqual(res.body.user.role, 'admin');
        adminToken = res.body.token;
    });

    await test('Login fails with wrong password', async () => {
        const res = await apiCall('POST', '/api/auth/login', {
            email: 'admin@medicap.com', password: 'wrong'
        });
        assert.strictEqual(res.status, 401);
    });

    await test('Login fails with non-existent email', async () => {
        const res = await apiCall('POST', '/api/auth/login', {
            email: 'nobody@test.com', password: 'test'
        });
        assert.strictEqual(res.status, 401);
    });

    await test('Login fails with empty fields', async () => {
        const res = await apiCall('POST', '/api/auth/login', { email: '', password: '' });
        assert.strictEqual(res.status, 400);
    });

    await test('Register new patient', async () => {
        const res = await apiCall('POST', '/api/auth/register', {
            name: 'Test Patient', email: `testpatient${Date.now()}@test.com`,
            phone: '+91 99999 88888', password: 'test123', role: 'patient', city: 'Ahmedabad'
        });
        assert.strictEqual(res.status, 201);
        assert.ok(res.body.token);
        assert.strictEqual(res.body.user.role, 'patient');
        patientToken = res.body.token;
        testPatientId = res.body.user.id;
    });

    await test('Register new doctor', async () => {
        const res = await apiCall('POST', '/api/auth/register', {
            name: 'Dr. Test', email: `testdoctor${Date.now()}@test.com`,
            phone: '+91 88888 77777', password: 'test123', role: 'doctor',
            city: 'Surat', specialty: 'Cardiology'
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.user.role, 'doctor');
        doctorToken = res.body.token;
    });

    await test('Register fails with duplicate email', async () => {
        const res = await apiCall('POST', '/api/auth/register', {
            name: 'Dup', email: 'admin@medicap.com',
            phone: '+91 11111 22222', password: 'test123'
        });
        assert.strictEqual(res.status, 409);
    });

    await test('Register fails with short password', async () => {
        const res = await apiCall('POST', '/api/auth/register', {
            name: 'Test', email: 'short@test.com',
            phone: '+91 11111 22222', password: '12'
        });
        assert.strictEqual(res.status, 400);
    });

    await test('Register fails with invalid email', async () => {
        const res = await apiCall('POST', '/api/auth/register', {
            name: 'Test', email: 'notemail',
            phone: '+91 11111 22222', password: 'test123'
        });
        assert.strictEqual(res.status, 400);
    });

    await test('GET /api/auth/me returns current user', async () => {
        const res = await apiCall('GET', '/api/auth/me', null, adminToken);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.user.email, 'admin@medicap.com');
    });

    await test('GET /api/auth/me fails without token', async () => {
        const res = await apiCall('GET', '/api/auth/me');
        assert.strictEqual(res.status, 401);
    });

    await test('GET /api/auth/me fails with invalid token', async () => {
        const res = await apiCall('GET', '/api/auth/me', null, 'invalid-token');
        assert.strictEqual(res.status, 403);
    });

    await test('PUT /api/auth/profile updates user', async () => {
        const res = await apiCall('PUT', '/api/auth/profile', {
            name: 'Updated Patient', city: 'Surat'
        }, patientToken);
        assert.strictEqual(res.status, 200);
    });

    await test('POST /api/auth/verify verifies account', async () => {
        const res = await apiCall('POST', '/api/auth/verify', null, patientToken);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.verified, true);
    });

    await test('PUT /api/auth/password changes password', async () => {
        const res = await apiCall('PUT', '/api/auth/password', {
            currentPassword: 'test123', newPassword: 'newpass123'
        }, patientToken);
        assert.strictEqual(res.status, 200);
    });

    await test('Password change fails with wrong current password', async () => {
        const res = await apiCall('PUT', '/api/auth/password', {
            currentPassword: 'wrongpass', newPassword: 'newpass123'
        }, patientToken);
        assert.strictEqual(res.status, 401);
    });

    // ========== DOCTOR TESTS ==========
    console.log('\n🩺 Doctor API Tests:');

    await test('GET /api/doctors returns doctors list', async () => {
        const res = await apiCall('GET', '/api/doctors');
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.body.doctors));
        assert.ok(res.body.doctors.length >= 12);
        testDoctorId = res.body.doctors[0].id;
    });

    await test('GET /api/doctors/:id returns single doctor', async () => {
        const res = await apiCall('GET', `/api/doctors/${testDoctorId}`);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.doctor.name);
    });

    await test('GET /api/doctors/:id returns 404 for invalid id', async () => {
        const res = await apiCall('GET', '/api/doctors/invalid-id');
        assert.strictEqual(res.status, 404);
    });

    await test('Doctor filtering by specialty works', async () => {
        const res = await apiCall('GET', '/api/doctors?specialty=Cardiology');
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.doctors.length > 0);
    });

    await test('Doctor filtering by city works', async () => {
        const res = await apiCall('GET', '/api/doctors?city=Ahmedabad');
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.doctors.length > 0);
    });

    await test('Doctor search works', async () => {
        const res = await apiCall('GET', '/api/doctors?search=priya');
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.doctors.length > 0);
    });

    // ========== APPOINTMENT TESTS ==========
    console.log('\n📅 Appointment Tests:');

    await test('POST /api/appointments books appointment', async () => {
        const res = await apiCall('POST', '/api/appointments', {
            doctorId: testDoctorId, date: '2026-05-01',
            time: '10:00 AM', type: 'Consultation', notes: 'Test booking'
        }, patientToken);
        assert.strictEqual(res.status, 201);
        assert.ok(res.body.appointment.id);
        testAppointmentId = res.body.appointment.id;
    });

    await test('Booking fails without required fields', async () => {
        const res = await apiCall('POST', '/api/appointments', {
            doctorId: testDoctorId
        }, patientToken);
        assert.strictEqual(res.status, 400);
    });

    await test('Booking fails with invalid doctor', async () => {
        const res = await apiCall('POST', '/api/appointments', {
            doctorId: 'fake-doc', date: '2026-05-01', time: '10:00 AM', type: 'Consultation'
        }, patientToken);
        assert.strictEqual(res.status, 404);
    });

    await test('GET /api/appointments returns user appointments', async () => {
        const res = await apiCall('GET', '/api/appointments', null, patientToken);
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.body.appointments));
    });

    await test('PUT /api/appointments/:id/cancel cancels appointment', async () => {
        const res = await apiCall('PUT', `/api/appointments/${testAppointmentId}/cancel`, null, patientToken);
        assert.strictEqual(res.status, 200);
    });

    await test('Appointments require authentication', async () => {
        const res = await apiCall('GET', '/api/appointments');
        assert.strictEqual(res.status, 401);
    });

    // ========== RECORDS TESTS ==========
    console.log('\n📋 Records Tests:');

    await test('GET /api/records returns user records', async () => {
        const res = await apiCall('GET', '/api/records', null, patientToken);
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.body.records));
    });

    await test('POST /api/records creates record (doctor)', async () => {
        const res = await apiCall('POST', '/api/records', {
            patientId: testPatientId, diagnosis: 'Test diagnosis',
            notes: 'Test notes', vitals: 'Normal'
        }, doctorToken);
        assert.strictEqual(res.status, 201);
    });

    await test('Patient cannot create records', async () => {
        const res = await apiCall('POST', '/api/records', {
            patientId: testPatientId, diagnosis: 'Test'
        }, patientToken);
        assert.strictEqual(res.status, 403);
    });

    // ========== ADMIN TESTS ==========
    console.log('\n🛡️ Admin Tests:');

    await test('GET /api/admin/users returns all users', async () => {
        const res = await apiCall('GET', '/api/admin/users', null, adminToken);
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.body.users));
        assert.ok(res.body.total > 0);
    });

    await test('Admin users endpoint denied for patients', async () => {
        const res = await apiCall('GET', '/api/admin/users', null, patientToken);
        assert.strictEqual(res.status, 403);
    });

    await test('Admin users endpoint denied for doctors', async () => {
        const res = await apiCall('GET', '/api/admin/users', null, doctorToken);
        assert.strictEqual(res.status, 403);
    });

    await test('GET /api/admin/stats returns statistics', async () => {
        const res = await apiCall('GET', '/api/admin/stats', null, adminToken);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.totalUsers >= 1);
        assert.ok(res.body.totalDoctors >= 12);
    });

    await test('POST /api/admin/doctors adds new doctor', async () => {
        const res = await apiCall('POST', '/api/admin/doctors', {
            name: 'Dr. Test Suite', specialty: 'Cardiology',
            city: 'Ahmedabad', hospital: 'Test Hospital'
        }, adminToken);
        assert.strictEqual(res.status, 201);
    });

    await test('POST /api/admin/patients adds new patient', async () => {
        const res = await apiCall('POST', '/api/admin/patients', {
            name: 'Admin Added Patient', email: `adminadd${Date.now()}@test.com`,
            phone: '+91 55555 66666'
        }, adminToken);
        assert.strictEqual(res.status, 201);
    });

    await test('Cannot delete admin user', async () => {
        const res = await apiCall('DELETE', '/api/admin/users/admin-001', null, adminToken);
        assert.strictEqual(res.status, 403);
    });

    // ========== STATS TESTS ==========
    console.log('\n📊 Stats Tests:');

    await test('GET /api/stats returns user stats', async () => {
        const res = await apiCall('GET', '/api/stats', null, patientToken);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.totalDoctors >= 12);
    });

    await test('Stats require authentication', async () => {
        const res = await apiCall('GET', '/api/stats');
        assert.strictEqual(res.status, 401);
    });

    // ========== EDGE CASE TESTS ==========
    console.log('\n🔧 Edge Case Tests:');

    await test('Invalid JSON body returns error', async () => {
        const res = await apiCall('POST', '/api/auth/login', null);
        assert.ok(res.status >= 400);
    });

    await test('SPA catch-all returns HTML', async () => {
        const res = await apiCall('GET', '/nonexistent-page');
        assert.strictEqual(res.status, 200);
    });

    await test('Doctor doctors endpoint is public (no auth needed)', async () => {
        const res = await apiCall('GET', '/api/doctors');
        assert.strictEqual(res.status, 200);
    });

    // ==================== RESULTS ====================
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
    console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
        console.log('❌ Failed tests:');
        results.filter(r => r.status === '❌ FAIL').forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
});
