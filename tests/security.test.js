const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Recreate the basic security setup of our server for unit testing purposes
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.post('/test-endpoint', (req, res) => {
    res.json({ message: 'Success', query: req.query, body: req.body });
});

describe('MediCap Security Middleware Integrations', () => {
    it('should have Helmet security headers configured', async () => {
        const res = await request(app).post('/test-endpoint').send({});
        expect(res.headers).toHaveProperty('x-dns-prefetch-control');
        expect(res.headers).toHaveProperty('x-frame-options');
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(res.headers).toHaveProperty('content-security-policy');
    });

    it('should have CORS enabled', async () => {
        const res = await request(app).options('/test-endpoint');
        expect(res.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should block known XSS payload vectors implicitly', async () => {
        const payload = { test: "<script>alert('xss')</script>" };
        const res = await request(app).post('/test-endpoint').send(payload);
        // xss-clean strips or escapes tags. We verify it sanitizes the body.
        expect(res.body.body.test).not.toBe("<script>alert('xss')</script>");
        // Usually it removes the content or escapes the brackets entirely
        expect(res.body.body.test).not.toContain("<script>");
    });
    
    it('should block NoSQL injection in payloads (mongoSanitize)', async () => {
        const payload = { "$gt": "" }; // typical nosql injection structure
        const res = await request(app).post('/test-endpoint').send(payload);
        // express-mongo-sanitize removes keys starting with $
        expect(res.body.body).not.toHaveProperty('$gt');
    });
});
