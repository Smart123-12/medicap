# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :x:                |

## Reporting a Vulnerability

As a healthcare application dealing with sensitive patient data, security is our top priority. 

If you discover a security vulnerability within MediCap, please send an e-mail to security@medicap.com. All security vulnerabilities will be promptly addressed.

### Threat Models Evaluated:
- SQL Injection (Migrated using parameterized prepared statements via `better-sqlite3`)
- Cross-Site Scripting XSS (Addressed using Content-Security-Policy via Helmet.js, HTML stripping)
- DDoS / Brute Force (Mitigated using `express-rate-limit`)
- Data exposure in transit (Forced TLS termination via Google Cloud Run)
