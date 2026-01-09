# Admin Dashboard Access Instructions

## 🔗 How to Access Admin Dashboard

### Step-by-Step Instructions

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Go to: `http://localhost:3000`

3. **Connect Wallet (Required):**
   - You'll see the "Connect Wallet" button
   - Click it (this sets `isConnected = true`)
   - You'll be redirected to the Lobby

4. **Navigate to Admin:**
   - Since you're using HashRouter, use this URL:
   ```
   http://localhost:3000/#/admin
   ```
   - Type it directly in the address bar, OR
   - After connecting wallet, manually type `/#/admin` in the URL

### ⚠️ Important Notes

- **HashRouter:** The URL uses `#` (HashRouter), so it's `/#/admin` not `/admin`
- **Must be Connected:** You must click "Connect Wallet" first (sets `isConnected = true`)
- **No Real Auth:** Currently, any connected user can access admin (prototype only)

### Quick Test

If you want to test without clicking Connect Wallet, you can temporarily modify the route in `App.tsx`:

```typescript
// Temporary: Remove auth check for testing
<Route path="/admin" element={<Admin />} />
```

But remember to restore the auth check after testing!

### Direct URL Format

**Correct:**
- ✅ `http://localhost:3000/#/admin`

**Incorrect:**
- ❌ `http://localhost:3000/admin` (won't work with HashRouter)
- ❌ `http://localhost:3000/#admin` (missing slash)

### Troubleshooting

**Problem: Redirects to home page**
- Solution: Make sure you clicked "Connect Wallet" first
- Check: `context.isConnected` must be `true`

**Problem: 404 or page not found**
- Solution: Make sure you're using `/#/admin` (with hash and slashes)
- Solution: Check that dev server is running on port 3000

**Problem: Access Denied message**
- This is from the Admin component's `isAdmin` check
- Currently hardcoded to `true`, so this shouldn't appear
- If it does, check `screens/Admin.tsx` line 127

### Current Route Configuration

```typescript
// App.tsx line 165
<Route path="/admin" element={context.isConnected ? <Admin /> : <Navigate to="/" />} />
```

This route:
- ✅ Exists and is configured correctly
- ✅ Checks if user is connected
- ✅ Redirects to home if not connected
- ⚠️ No real authentication (anyone connected can access)


## 📊 How to Monitor User Activity

### Viewing "Active Users"
1.  **Access the Dashboard**: Follow the steps above to reach `/#/admin`.
2.  **Dashboard Overview**:
    - Look at the top "Key Metrics" grid.
    - **Active Users**: This number represents unique users who have logged in within the last **24 hours**.
    - If a user hasn't logged in for >24h, they are not counted here.

### Checking Specific User Activity
1.  Click the **Users** tab (second tab).
2.  Locate the user in the table.
3.  **Status Column**: Shows if they are 'active', 'suspended', etc.
4.  **Last Login**: Verification of the exact date and time they last accessed the platform.
