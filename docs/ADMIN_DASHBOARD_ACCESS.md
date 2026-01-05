# Admin Dashboard Access Guide

## 📍 Current Access

### URL
The admin dashboard is accessible at:
- **Local Development:** `http://localhost:3000/#/admin`
- **Production:** `https://yourdomain.com/#/admin`

### Current State (Development/Prototype)

**⚠️ WARNING: Currently NO real authentication implemented!**

The admin dashboard is currently a **frontend prototype** with:
- ✅ UI/UX implemented
- ✅ Mock data displayed
- ❌ **NO real authentication**
- ❌ **NO authorization checks**
- ❌ **NO backend connection**

### How to Access Right Now

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Connect wallet or bypass auth:**
   - Currently, the route only checks `context.isConnected`
   - Once you're "connected" (via the mock Auth screen), you can access `/admin`

3. **Navigate to admin:**
   - Type in browser: `http://localhost:3000/#/admin`
   - Or add a link in the navbar (not currently visible)

4. **Current "Authentication":**
   - Line 127 in `screens/Admin.tsx`: `const isAdmin = true;` (hardcoded)
   - This means **anyone who is "connected" can access admin**
   - **This is NOT secure for production!**

---

## 🔒 Production Security Requirements

According to the security architecture, admin access should require:

### Required Security Layers

1. **VPN Connection** (required)
   - Admin panel should only be accessible via VPN
   - Public URL should redirect/block

2. **IP Allowlist**
   - Only pre-approved IP addresses can access
   - Office/home IPs only
   - Configure in backend/nginx/cloudflare

3. **Hardware Key MFA (Mandatory)**
   - Primary: Hardware security key (YubiKey, Titan)
   - Backup: Authenticator app (TOTP)
   - Emergency: Backup codes

4. **Separate Admin URL**
   - Not in public DNS
   - Hidden endpoint (e.g., `/admin-panel-v2` or custom domain)
   - Not linked from public pages

5. **Role-Based Access Control (RBAC)**
   - Different admin roles with different permissions
   - Roles: Super Admin, Finance Admin, Support Admin, Game Admin, Security Admin, Read-Only Admin

6. **Session Security**
   - Session timeout: 30 minutes idle, 4 hours max
   - Re-authentication for sensitive actions
   - Activity logging for all actions

---

## 🚀 Implementation Plan

### Phase 1: Basic Authentication (Current - NOT Implemented)

**What needs to be done:**

1. **Create Admin Authentication Flow:**
   ```typescript
   // Backend: /admin/auth/login
   - Wallet address whitelist (only approved admin addresses)
   - Signature verification (same as user auth)
   - Issue admin JWT token (with role)
   
   // Frontend: Admin login screen
   - Connect wallet
   - Verify signature
   - Check if address is in admin whitelist
   - Store admin JWT token
   ```

2. **Update Admin.tsx:**
   ```typescript
   // Replace hardcoded isAdmin check
   const isAdmin = checkAdminAuth(); // Check JWT token + role
   ```

3. **Protect Admin Route:**
   ```typescript
   // App.tsx
   <Route path="/admin" element={
     context.isAdmin && context.isConnected ? <Admin /> : <Navigate to="/" />
   } />
   ```

### Phase 2: Enhanced Security (Production)

1. **VPN + IP Allowlist:**
   - Configure at infrastructure level (nginx/cloudflare)
   - Block all non-whitelisted IPs
   - Return 403 Forbidden

2. **Hardware MFA:**
   - Integrate WebAuthn API for hardware keys
   - TOTP for backup (Google Authenticator, Authy)
   - Store backup codes securely

3. **Admin User Management:**
   - Database table: `admin_users`
   - Fields: `wallet_address`, `role`, `mfa_enabled`, `created_at`
   - Whitelist of approved admin addresses

4. **Audit Logging:**
   - Log all admin actions
   - Store in database: `admin_audit_logs`
   - Fields: `admin_address`, `action`, `details`, `timestamp`, `ip_address`

---

## 📋 Quick Access (Development Only)

**For development/testing purposes:**

1. **Option 1: Direct URL**
   - Navigate to: `http://localhost:3000/#/admin`
   - Works if `isConnected = true` in context

2. **Option 2: Add to Navbar (Temporary)**
   ```typescript
   // App.tsx - Navbar component
   const navItems: GameMode[] = ['Lobby', 'Dice', 'Roulette', 'Blackjack', 'Plinko', 'Limbo', 'Admin'];
   ```

3. **Option 3: Mock Admin Context**
   ```typescript
   // In App.tsx or Auth.tsx
   useEffect(() => {
     // For development only!
     context?.setIsAdmin?.(true);
   }, []);
   ```

---

## ⚠️ Security Warnings

### DO NOT:
- ❌ Deploy admin dashboard to production without authentication
- ❌ Expose admin URL in public navigation
- ❌ Use hardcoded `isAdmin = true` in production
- ❌ Skip IP allowlist in production
- ❌ Skip MFA in production

### DO:
- ✅ Implement proper admin authentication
- ✅ Use VPN + IP allowlist in production
- ✅ Require hardware MFA
- ✅ Log all admin actions
- ✅ Use separate admin URL/domain
- ✅ Implement RBAC (role-based access)

---

## 🔐 Recommended Admin Authentication Flow

```
1. Admin navigates to /admin
2. Frontend checks for admin JWT token
3. If no token → Show admin login screen
4. Admin connects wallet (same as user auth)
5. Frontend sends wallet address to backend
6. Backend checks if address is in admin whitelist
7. If approved → Generate nonce → Request signature
8. Admin signs message
9. Backend verifies signature + checks admin whitelist
10. Backend issues admin JWT token (with role)
11. Frontend stores admin token
12. Redirect to admin dashboard
13. All admin API calls include admin JWT token
14. Backend validates token + role on every request
```

---

## 📚 Related Documentation

- `docs/COMPLETE_CASINO_SECURITY_ARCHITECTURE.md` - Full security architecture
- `CONFIG_SETUP.md` - Configuration guide
- `docs/AUTHENTICATION_FLOW_REVIEW.md` - Authentication flow details

---

## 🎯 Summary

**Current State:**
- ✅ Admin dashboard exists at `/admin`
- ✅ UI is implemented
- ❌ **NO authentication (anyone can access)**
- ❌ **NOT production-ready**

**To Access Now (Development):**
1. Start dev server: `npm run dev`
2. Connect wallet (mock auth)
3. Navigate to: `http://localhost:3000/#/admin`

**For Production:**
- Implement admin authentication (wallet whitelist + signature)
- Add VPN + IP allowlist
- Add hardware MFA
- Implement RBAC
- Add audit logging
- Use hidden admin URL

**⚠️ DO NOT deploy admin dashboard to production without proper authentication!**

