# Security Policy

## Supported Versions

Currently supported versions of VanshVriksh:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **Do Not** Open a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send a detailed report to: **security@vaibhavkotiyal.com** (or your preferred contact)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues within 7 days)

## Security Measures

VanshVriksh implements the following security practices:

### Authentication & Authorization
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT-based session management
- ✅ Server-side session validation on protected routes
- ✅ CSRF protection via NextAuth.js

### Data Protection
- ✅ SQL injection prevention (Prisma ORM with parameterized queries)
- ✅ XSS protection (React automatic escaping)
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforcement in production

### API Security
- ✅ Authentication required for all data operations
- ✅ User-owned data verification
- ✅ Input validation on all endpoints
- ✅ Rate limiting (Vercel automatic DDoS protection)

### Dependencies
- ✅ Regular dependency updates
- ✅ Automated security scanning (GitHub Dependabot)
- ✅ Dependency review on pull requests

## Known Limitations

### Development vs Production

**Development Mode:**
- Local PostgreSQL database
- Self-signed certificates acceptable
- Debug logging enabled

**Production Mode:**
- Always use HTTPS
- Secure database connection strings
- Minimal logging (no sensitive data)

### User Responsibilities

Users should:
- Use strong passwords (min 8 characters)
- Keep credentials confidential
- Report suspicious activity
- Keep their environment variables secure

## Security Best Practices for Deployment

### Environment Variables

**Never commit:**
```
.env
.env.local
.env.production
```

**Always:**
- Use Vercel's encrypted environment variables
- Rotate `NEXTAUTH_SECRET` periodically
- Use strong database passwords

### Database Security

- ✅ Use connection pooling
- ✅ Enable SSL for database connections
- ✅ Restrict database access by IP (if possible)
- ✅ Regular backups

### Cloudinary Security

- ✅ Use unsigned upload presets with restrictions
- ✅ Limit allowed file formats
- ✅ Set maximum file size
- ✅ Consider signed uploads for production

## Vulnerability Disclosure Policy

We follow responsible disclosure:

1. **Report** - Security researcher reports vulnerability privately
2. **Acknowledge** - We acknowledge receipt within 48 hours
3. **Investigate** - We investigate and develop a fix
4. **Patch** - We release a security patch
5. **Disclose** - We coordinate public disclosure with researcher

## Security Updates

Security patches will be released as:
- Patch version bumps (e.g., 0.1.1 → 0.1.2)
- Tagged as security releases
- Documented in CHANGELOG.md

## Attribution

We appreciate security researchers who help make VanshVriksh safer. With your permission, we'll acknowledge your contribution in:
- Security advisory
- Release notes
- README.md security section

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
