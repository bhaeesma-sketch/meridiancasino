# Troubleshooting Guide - Routes Not Working

## Common Issues and Solutions

### Issue: Routes Not Working (Both Admin and User)

If you're experiencing issues accessing routes, try these solutions:

---

## ✅ Solution 1: Clear Browser Cache and Hard Refresh

1. **Clear browser cache:**
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Firefox: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Clear data

2. **Hard refresh:**
   - Windows: `Ctrl+F5` or `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

3. **Try incognito/private window:**
   - This bypasses cache completely

---

## ✅ Solution 2: Restart Dev Server

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Kill any stuck processes:**
   ```bash
   # Find and kill vite processes
   pkill -f vite
   # Or kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Clear node cache (optional):**
   ```bash
   rm -rf node_modules/.vite
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

5. **Wait for server to start:**
   - Look for: "Local: http://localhost:5173/" or similar
   - Note the actual port number

---

## ✅ Solution 3: Check Correct Port Number

Vite might be using a different port (like 5173 instead of 3000).

1. **Check terminal output:**
   ```
   VITE v6.4.1  ready in 500 ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

2. **Use the correct URL:**
   - If it says port 5173, use: `http://localhost:5173/#/admin`
   - If it says port 3000, use: `http://localhost:3000/#/admin`

---

## ✅ Solution 4: Verify HashRouter URL Format

**Correct URL format:**
- ✅ `http://localhost:5173/#/lobby`
- ✅ `http://localhost:5173/#/admin`
- ✅ `http://localhost:5173/#/dice`

**Incorrect URL format:**
- ❌ `http://localhost:5173/lobby` (missing `#`)
- ❌ `http://localhost:5173#admin` (missing `/`)

---

## ✅ Solution 5: Check Browser Console for Errors

1. **Open Developer Tools:**
   - Windows: `F12` or `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

2. **Check Console tab for errors:**
   - Look for red error messages
   - Common issues:
     - Module not found
     - React errors
     - Routing errors

3. **Check Network tab:**
   - Make sure files are loading (status 200)
   - Check for 404 errors

---

## ✅ Solution 6: Verify Routing Configuration

The routing should be configured correctly in `App.tsx`:

```typescript
<Routes>
  <Route path="/" element={<Auth />} />
  <Route path="/lobby" element={context.isConnected ? <Lobby /> : <Navigate to="/" />} />
  <Route path="/admin" element={context.isConnected ? <Admin /> : <Navigate to="/" />} />
  // ... other routes
</Routes>
```

---

## ✅ Solution 7: Test Auth Flow Step by Step

1. **Go to home page:**
   ```
   http://localhost:5173/  (or whatever port vite shows)
   ```

2. **You should see:**
   - "Connect Wallet" button
   - Auth screen with casino branding

3. **Click "Connect Wallet":**
   - This should set `isConnected = true`
   - Should redirect to `/lobby`

4. **If redirected to lobby:**
   - Routing is working
   - Now try: `http://localhost:5173/#/admin`

5. **If stuck on auth screen:**
   - Check browser console for errors
   - Check if `handleConnect` is being called

---

## ✅ Solution 8: Temporary Bypass for Testing

If you want to test routes without authentication:

**Temporarily modify `App.tsx` (line 156-165):**

```typescript
// Change from:
<Route path="/lobby" element={context.isConnected ? <Lobby /> : <Navigate to="/" />} />

// To (temporary, for testing only):
<Route path="/lobby" element={<Lobby />} />
<Route path="/admin" element={<Admin />} />
```

**⚠️ Remember to revert this change after testing!**

---

## ✅ Solution 9: Check React Router Version Compatibility

The app uses `react-router-dom` v7.11.0. If you have compatibility issues:

1. **Check installed version:**
   ```bash
   npm list react-router-dom
   ```

2. **Reinstall if needed:**
   ```bash
   npm install react-router-dom@^7.11.0
   ```

---

## ✅ Solution 10: Verify All Dependencies

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

---

## 🔍 Diagnostic Steps

Run these commands to diagnose:

```bash
# 1. Check if server is running
curl http://localhost:5173

# 2. Check what port is actually in use
lsof -i :5173
lsof -i :3000

# 3. Check for build errors
npm run build

# 4. Check for TypeScript errors
npx tsc --noEmit

# 5. Check React Router is installed
npm list react-router-dom
```

---

## 📋 Quick Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Using correct port (check terminal output)
- [ ] Using HashRouter URL format (`/#/route`)
- [ ] Browser console has no errors
- [ ] Cleared browser cache
- [ ] Clicked "Connect Wallet" first (for protected routes)
- [ ] Network tab shows files loading (200 status)

---

## 🆘 Still Not Working?

If none of these solutions work:

1. **Check the exact error message** in browser console
2. **Check which URL you're using** (copy/paste it here)
3. **Check what happens** when you click "Connect Wallet"
4. **Check terminal output** for any errors
5. **Try a different browser** (Chrome, Firefox, Safari)

Share these details and we can help debug further!

