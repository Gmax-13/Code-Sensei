# CodeSensei Security Documentation

## Authentication

### JWT (JSON Web Tokens)
- Tokens are signed with a server-side secret (`JWT_SECRET` in `.env.local`)
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Stored in **HTTP-only cookies** — not accessible via JavaScript (`document.cookie`)

### HTTP-Only Cookie Policy
| Attribute | Value | Purpose |
|-----------|-------|---------|
| HttpOnly | true | Prevents XSS access to the token |
| SameSite | Lax | Mitigates CSRF for cross-site requests |
| Secure | true (prod) | Ensures HTTPS-only in production |
| Path | / | Cookie valid for all routes |

### Password Security
- Passwords are hashed with **bcrypt** using 12 salt rounds
- Passwords are **never stored in plaintext**
- The `password` field is excluded from queries by default (`select: false`)
- Login errors return generic messages to prevent email enumeration

## Input Validation

All API inputs are validated using **Zod** schemas before processing:
- **Registration**: name (2-50 chars), email (valid format), password (6-100 chars)
- **Login**: email (valid format), password (required)
- **Report/Diagram/Codebase**: Code content validated for presence and max length (50KB)

## Route Protection

- API routes are protected using the `withAuth` middleware wrapper
- The middleware extracts and verifies the JWT from cookies
- Role-based access control is supported (`user`, `admin`)
- Unauthenticated requests receive `401 Unauthorized`
- Unauthorized roles receive `403 Forbidden`

## Frontend Protection

- Client-side route groups use an `(authenticated)/layout.js` guard
- Unauthenticated users are redirected to the login page
- User state is managed via TanStack Query with automatic cache invalidation on auth changes

## Security Best Practices Applied

1. **No client-accessible tokens** — JWT stored in HTTP-only cookie
2. **Password hashing** — bcrypt with 12 rounds
3. **Input sanitization** — Zod validation on all endpoints
4. **Generic error messages** — Prevents information leakage
5. **Secure cookie attributes** — HttpOnly, SameSite, Secure
6. **Role-based access** — Middleware supports role checks

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value (32+ characters)
- [ ] Enable `Secure` flag on cookies (automatic when `NODE_ENV=production`)
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable rate limiting (e.g., via Vercel's edge middleware or Express rate limiter)
- [ ] Set up HTTPS
- [ ] Add CSRF protection for state-changing operations
- [ ] Implement request logging and monitoring
