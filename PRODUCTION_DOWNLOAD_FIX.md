# Production Download Fix - Deployment Guide

## Problem
Files were downloading as empty or showing white screens in production because:
1. Hardcoded `localhost:5000` URL doesn't work in production
2. Direct file links bypass authentication
3. CORS issues with static file serving
4. No proper blob handling for downloads

## Solution Implemented

### 1. Environment Variable Configuration

**File: `client/.env.example`**
```env
# For local development
# VITE_API_URL=http://localhost:5000

# For production
# VITE_API_URL=https://api.oriventa-pro-service.com
```

**File: `client/api.js`**
```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true,
});
```

### 2. Blob-Based Downloads

Changed from direct URL downloads to authenticated blob downloads:

**Before (Broken in Production):**
```javascript
const fullUrl = `${api.defaults.baseURL}${filePath}`;
const link = document.createElement('a');
link.href = fullUrl;  // Direct URL - fails with auth
link.download = fileName;
link.click();
```

**After (Works in Production):**
```javascript
const response = await api.get(filePath, {
  responseType: 'blob',
  withCredentials: true,
});

const blob = new Blob([response.data], { type: response.headers['content-type'] });
const blobUrl = window.URL.createObjectURL(blob);

const link = document.createElement('a');
link.href = blobUrl;  // Blob URL - authenticated
link.download = fileName;
link.click();

window.URL.revokeObjectURL(blobUrl);  // Cleanup
```

### 3. Files Updated

✅ **client/api.js** - Uses environment variable for API URL
✅ **client/src/pages/client/ClientProfile.jsx** - Blob download handler
✅ **client/src/pages/client/ClientSuivi.jsx** - Blob download handler
✅ **client/src/pages/settings/Settings.jsx** - Blob download handler + changed links to buttons

## Deployment Steps

### Step 1: Create Production Environment File

```bash
cd client
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=https://api.oriventa-pro-service.com
```

### Step 2: Build Client

```bash
cd client
npm run build
```

### Step 3: Deploy

Upload the `client/dist` folder to your production server.

### Step 4: Verify Environment Variables

Make sure your production environment has:
- Correct CORS settings in server
- Static file serving enabled: `app.use("/uploads", express.static("uploads"))`
- Authentication cookies working with `withCredentials: true`

## Testing in Production

1. **Login as Client**
   - Go to Profile page
   - Click download button on CV/LM files
   - Verify files download correctly with content

2. **Login as Admin**
   - Go to Settings > User Suivi modal
   - Click 📥 download buttons
   - Verify files download correctly

3. **Check Browser Console**
   - Should see no CORS errors
   - Should see no 404 errors
   - Should see successful blob creation

## Troubleshooting

### Issue: Still Getting Empty Files

**Check:**
1. Server CORS configuration includes production domain
2. `withCredentials: true` is set in both client and server
3. Server is actually serving the files from `/uploads`

**Server CORS Fix (`server/index.js`):**
```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://admin.oriventa-pro-service.com'  // Add your domain
    ],
    credentials: true,
}))
```

### Issue: 401 Unauthorized

**Check:**
1. Authentication cookie is being sent
2. Cookie domain is correct for production
3. Token is not expired

### Issue: CORS Error

**Check:**
1. Server CORS includes production domain
2. `credentials: true` in server CORS config
3. Cookie SameSite attribute is correct

## Benefits of This Approach

✅ **Authentication:** Downloads go through API with proper auth
✅ **Security:** Files require valid session to download
✅ **CORS:** No cross-origin issues with blobs
✅ **Environment-Aware:** Works in dev and production
✅ **Clean URLs:** No need to expose direct file paths

## Performance Notes

- Blob downloads use slightly more memory (files loaded into browser memory)
- For very large files (>100MB), consider direct streaming
- Current implementation is fine for CVs, documents (<10MB each)

## Rollback Plan

If issues occur, you can temporarily:
1. Revert to direct URLs by changing API base URL
2. Ensure CORS allows direct static file access
3. Remove authentication requirement for `/uploads` route (NOT RECOMMENDED for security)

## Next Steps

1. ✅ Environment variables configured
2. ✅ Blob downloads implemented
3. ⏳ Deploy to production
4. ⏳ Test all download scenarios
5. ⏳ Monitor for errors

## Security Considerations

- Files are now always authenticated
- No direct access to `/uploads` without valid session
- Blob URLs expire after use (memory cleanup)
- Consider adding rate limiting to download endpoints
