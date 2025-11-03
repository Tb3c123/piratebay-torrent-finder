# Security & Deployment

## Security Considerations

### Authentication & Authorization

#### JWT Token Security

**Token Structure:**

- Header: {alg: "HS256", typ: "JWT"}
- Payload: {id, username, isAdmin, iat, exp}
- Signature: HMACSHA256(header + payload + secret)

**Security Features:**

- 7-day expiration
- Strong secret key (64+ characters)
- Stateless (không cần server-side storage)
- Signature verification prevents tampering

**Token Storage:**

- Client: localStorage
- Transmitted: `Authorization: Bearer <token>` header
- Vulnerable to XSS (mitigated by HTTPS + short expiry)

#### Password Security

**bcrypt Hashing:**

- Salt rounds: 10 (configurable)
- Unique salt per password
- Slow hashing (resistant to brute-force)
- One-way (cannot reverse)

**Password Policy (Recommended):**

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Currently NOT enforced (TODO for production)

#### Role-Based Access Control (RBAC)

**Admin Middleware:**

- Check `req.user.isAdmin`
- Return 403 nếu không phải admin
- Used for: logs, user management

**First User Auto-Admin:**

- Count users trong database
- Nếu 0 users → new user gets admin = true

**Protected Routes:**

- `/api/history` - Requires authentication
- `/api/settings` - Requires authentication
- `/api/logs` - Requires admin
- `/api/auth/users` - Requires admin

### Data Isolation

#### Per-User Settings

**Structure:**

```json
{
  "users": {
    "1": {qbittorrent: {...}, jellyfin: {...}},
    "2": {qbittorrent: {...}, jellyfin: {...}}
  }
}
```

**Access Control:**

- Users can only access own settings
- Admins can access all settings
- Verified bằng `req.user.id`

#### Per-User History

**Filtering:**

- Load all history từ JSON
- Filter by `userId`
- Return only user's data

**Privacy:**

- Users không thể see history của users khác
- Isolation tại application layer

### Security Headers (Helmet)

**Headers Applied:**

- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - Enable XSS filter
- `Strict-Transport-Security` - Force HTTPS
- `Content-Security-Policy` - Control resource loading

### CORS Configuration

**Current Setup:**

- Origin: `process.env.FRONTEND_URL` hoặc `http://localhost:3000`
- Credentials: true (allow cookies & auth headers)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization

**Production:**

- Whitelist specific domains only
- Reject unknown origins

### Input Validation

#### SQL Injection Prevention

**Prepared Statements:**

- Always use parameterized queries
- Never concatenate SQL strings
- SQLite automatically escapes parameters

#### XSS Prevention

**React Auto-Escaping:**

- React automatically escapes JSX content
- Avoid `dangerouslySetInnerHTML`

**Backend Sanitization:**

- Sanitize user input before storing
- Validate data types
- Reject malicious patterns

#### Path Traversal Prevention

**File Path Validation:**

- Resolve paths với `path.resolve()`
- Check path starts with base directory
- Reject paths với `..` or absolute paths

### Environment Variables

**Sensitive Data:**

- JWT_SECRET - Token signing key
- OMDB_API_KEY - External API key
- QBITTORRENT_USERNAME/PASSWORD
- JELLYFIN_API_KEY

**.gitignore:**

- .env files NEVER committed
- settings.json contains passwords (gitignored)

**Loading:**

- Use `dotenv` package
- Check required vars at startup
- Fail fast if missing

### File Permissions

**Recommended:**

- `chmod 600` - users.db (sensitive)
- `chmod 600` - settings.json (contains passwords)
- `chmod 644` - search-history.json
- `chmod 644` - logs.json

**Docker:**

- Run as non-root user (nodejs:nodejs)
- UID/GID: 1001
- Change ownership of files

## Deployment

### Development

**docker-compose.yml:**

- Backend: Port 3001, volume mount src/ cho hot reload
- Frontend: Port 3000, volume mount src/ cho hot reload
- Volumes: `./backend/data:/app/data`
- Networks: app-network (bridge)
- Restart: unless-stopped

**Start:**

```bash
docker-compose up -d
docker-compose logs -f
```

### Production

**docker-compose.deploy.yml:**

**Differences:**

- No source code mounts (baked into image)
- Resource limits (CPU: 0.5-1.0, Memory: 256-512MB)
- Nginx reverse proxy
- Named volumes thay vì bind mounts
- Restart: always
- Multi-stage builds (target: production)

**Services:**

- backend (3 replicas for load balancing)
- frontend (1 replica)
- nginx (SSL termination, reverse proxy)

### Nginx Reverse Proxy

**Configuration:**

**HTTP → HTTPS Redirect:**

- Listen port 80
- Redirect all to https://

**HTTPS Server:**

- Listen port 443 với SSL
- SSL certs: Let's Encrypt
- Protocols: TLSv1.2, TLSv1.3
- Strong ciphers only

**Routing:**

- `/api/*` → backend:3001
- `/*` → frontend:3000
- `/_next/static/*` → frontend (cached 60 minutes)

**Security Headers:**

- HSTS với includeSubDomains
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

**Proxy Headers:**

- X-Real-IP
- X-Forwarded-For
- X-Forwarded-Proto

### SSL/TLS Configuration

**Let's Encrypt:**

```bash
certbot certonly --standalone -d yourdomain.com
```

**Auto-Renewal:**

- Cron job: `0 0 1 * * certbot renew --quiet`
- Restart nginx after renewal

**SSL Settings:**

- Minimum TLS 1.2
- Disable weak ciphers
- HSTS với 1-year max-age

### Data Backup Strategy

**Automated Backup:**

- Daily cron job at 2 AM
- Tar all files trong backend/data/
- Keep last 30 days
- Store off-site (S3, Google Drive)

**Backup Script:**

- Create tar.gz of data folder
- Include timestamp trong filename
- Rotate old backups (delete >30 days)

**Restore:**

```bash
docker-compose down
tar -xzf backup.tar.gz
docker-compose up -d
```

### Monitoring & Logging

**Health Check Endpoint:**

- `/api/health`
- Returns: status, uptime, memory, database connection

**Logging:**

- Morgan cho HTTP request logs
- Custom logs to logs.json
- Keep last 1000 log entries
- Levels: INFO, WARN, ERROR, DEBUG

**Monitoring (Future):**

- Prometheus metrics
- Grafana dashboards
- Alerting rules
- Uptime monitoring

### Scaling Considerations

**Horizontal Scaling:**

- Deploy multiple backend instances
- Nginx load balancing (least_conn)
- Stateless JWT allows scaling

**Database:**

- SQLite không ideal cho horizontal scaling
- Migrate to PostgreSQL for production
- Use connection pooling
- Database replication

**Caching:**

- Implement Redis for shared cache
- Cache movie searches, settings
- Session storage

## Security Checklist

### Pre-Deployment

- [ ] Change default JWT secret (64+ chars)
- [ ] Strong passwords for all services
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set file permissions (600/644)
- [ ] Remove dev dependencies
- [ ] Enable Helmet security headers
- [ ] Configure CORS properly
- [ ] Set up automated backups
- [ ] Implement rate limiting
- [ ] Enable logging
- [ ] Test error handling
- [ ] Validate all inputs
- [ ] Review API endpoints
- [ ] Test authentication flow

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Monitor security advisories
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Rotate secrets quarterly
- [ ] Review user permissions
- [ ] Monitor resource usage
- [ ] Check SSL cert expiry
- [ ] Audit codebase

## Summary

**Security Layers:**

1. **Authentication** - JWT + bcrypt
2. **Authorization** - RBAC (user/admin)
3. **Data Isolation** - Per-user settings & history
4. **Security Headers** - Helmet middleware
5. **CORS** - Origin whitelist
6. **Input Validation** - Prepared statements, sanitization
7. **HTTPS** - SSL/TLS encryption
8. **File Permissions** - Restricted access
9. **Env Variables** - Secret management
10. **Backups** - Automated daily backups

**Deployment:**

- Docker containers
- Nginx reverse proxy
- SSL/TLS certificates
- Resource limits
- Health checks
- Monitoring & logging

**Production Enhancements:**

- PostgreSQL database
- Redis caching
- Load balancing
- Rate limiting
- Security audits
- Penetration testing
