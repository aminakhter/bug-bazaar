# Authentication & Token Storage Trade-Offs

## Where the Auth Token Lives
The authentication token is stored **exclusively in memory** inside Redux state (`src/store/authSlice.ts`) and mirrored to a module-scoped variable in `src/api/client.ts`. It is **never** written to `localStorage` or `sessionStorage`.

## Trade-Off Analysis
- **Security Advantage (XSS Mitigation):** Any JavaScript running on the page (including third-party scripts or potential XSS vectors) can read `localStorage` freely. Keeping the bearer token in memory eliminates persistent storage theft across browser tabs or future sessions.
- **UX Trade-Off:** A full browser page reload clears JavaScript memory, requiring the user to sign in again. In a production deployment, this trade-off is resolved by pairing an in-memory short-lived access token with an `HttpOnly; Secure; SameSite=Strict` refresh cookie managed by the backend.