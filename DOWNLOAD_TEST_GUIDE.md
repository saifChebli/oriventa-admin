# Download Feature Testing Guide

## Overview
This document provides a comprehensive guide to test all download functionalities in the Oriventa Admin application.

## Download Implementations Summary

### ✅ Client Side - ClientProfile.jsx
**Location:** `/client/src/pages/client/ClientProfile.jsx`

**Features:**
- Downloads CV files (single or multiple)
- Downloads Lettre de Motivation files (single or multiple)
- HEAD request check before download
- Toast notifications for success/error
- Proper error handling

**Implementation:**
```javascript
const handleDownload = async (filePath, fileName) => {
  const fullUrl = `${api.defaults.baseURL}${filePath}`;
  const response = await fetch(fullUrl, { method: 'HEAD' });
  if (!response.ok) {
    toast.error('Le fichier n\'existe pas ou n\'est pas accessible');
    return;
  }
  // Trigger download with download attribute
  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = fileName;
  link.click();
}
```

### ✅ Admin Side - Settings.jsx (Suivi Modal)
**Location:** `/client/src/pages/settings/Settings.jsx`

**Features:**
- View uploaded CV files
- View uploaded LM files
- Download button (📥) for each file
- Delete button (✕) for each file
- Uses HTML download attribute

**Implementation:**
```jsx
<a 
  href={`${api.defaults.baseURL}${file}`} 
  download
  className="text-blue-600 hover:text-blue-800"
>
  📥
</a>
```

### ✅ Management Side - Candidates.jsx
**Location:** `/client/src/pages/management/Candidates.jsx`

**Features:**
- Download entire dossier as ZIP
- Download individual files (CV, Diplomas, Passport, etc.)
- HEAD request validation
- Uses `api.defaults.baseURL`

**Implementation:**
```javascript
const handleDownload = async (dossierNumber, fullName) => {
  const url = `${api.defaults.baseURL}/api/dossiers/download-folder/${dossierNumber}/${fullName}`;
  const headResp = await fetch(url, { method: 'HEAD' });
  if (!headResp.ok) {
    alert('Download unavailable');
    return;
  }
  // Trigger download
}
```

### ✅ Management Side - ResumeDetailsModal.jsx
**Location:** `/client/src/pages/management/components/ResumeDetailsModal.jsx`

**Features:**
- Download payment receipt
- Uses API endpoint for resume download

**Implementation:**
```javascript
const handleDownload = async (resumeId) => {
  const url = `${api.defaults.baseURL}/api/creation/download-by-id/${resumeId}`;
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${resumeId}.pdf`);
  link.click();
};
```

## Testing Checklist

### 1. Client Profile Page Test
**Route:** `/profile` (as client user)

- [ ] **Test CV Download (Single File)**
  1. Login as client
  2. Navigate to Profile page
  3. Look for "Mes Documents" section
  4. Click "Télécharger" on CV file
  5. Verify file downloads correctly
  6. Verify toast notification appears

- [ ] **Test CV Download (Multiple Files)**
  1. Check if multiple CV files are listed
  2. Click download on each file
  3. Verify all files download with correct names

- [ ] **Test LM Download (Single File)**
  1. Click "Télécharger" on Lettre de Motivation
  2. Verify file downloads correctly

- [ ] **Test LM Download (Multiple Files)**
  1. Click download on each LM file
  2. Verify all files download correctly

- [ ] **Test Missing File Error**
  1. If a file path is broken (test with DB manipulation)
  2. Verify error toast appears: "Le fichier n'existe pas..."

### 2. Settings Page - Suivi Modal Test
**Route:** `/settings` (as manager/admin)

- [ ] **Test CV File Display**
  1. Login as manager/admin
  2. Go to Settings page
  3. Open a user's Suivi modal
  4. Verify uploaded CV files are listed

- [ ] **Test CV Download**
  1. Click the 📥 download button on CV file
  2. Verify file downloads correctly
  3. Test on multiple CV files if available

- [ ] **Test LM File Display**
  1. Verify uploaded LM files are listed

- [ ] **Test LM Download**
  1. Click the 📥 download button on LM file
  2. Verify file downloads correctly
  3. Test on multiple LM files if available

- [ ] **Test Delete After Download**
  1. Download a file
  2. Click ✕ to delete it
  3. Verify file is removed from list
  4. Verify file is deleted from server

### 3. Candidates Page Test
**Route:** `/candidates` (as admin/manager)

- [ ] **Test Dossier ZIP Download**
  1. Navigate to Candidates page
  2. Click the Download action in dropdown menu
  3. Verify ZIP file downloads
  4. Extract and verify contents

- [ ] **Test Individual File Links**
  1. Enable "Afficher colonnes avancées"
  2. Click on CV link in table
  3. Verify file opens/downloads
  4. Test other file links (Diplomas, Passport, Photo, etc.)

### 4. Resume Page Test
**Route:** `/resume` (as resume service user)

- [ ] **Test Payment Receipt Download**
  1. Navigate to Resume page
  2. Click "Voir détails" on a resume
  3. Click "Télécharger le reçu" button
  4. Verify payment receipt downloads

### 5. Cross-Browser Testing

Test all above scenarios in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

### 6. Mobile Testing

Test on mobile devices:
- [ ] Download from client profile
- [ ] Download from settings modal
- [ ] Verify download button size and accessibility

## Common Issues & Solutions

### Issue 1: File downloads as HTML instead of actual file
**Cause:** Server not serving static files correctly
**Solution:** Check server `express.static()` middleware for `/uploads` route

### Issue 2: Download attribute not working
**Cause:** CORS or same-origin policy
**Solution:** Ensure `api.defaults.baseURL` matches server origin or configure CORS properly

### Issue 3: 404 errors on download
**Cause:** File path incorrect or file deleted
**Solution:** Verify file paths in database match actual filesystem structure

### Issue 4: Download button not responsive on mobile
**Cause:** Button too small or touch target insufficient
**Solution:** Already implemented with proper padding classes

## Backend Verification

Ensure these endpoints are working:
1. `GET /uploads/:userId/:filename` - Serves static files
2. `GET /api/dossiers/download-folder/:dossierNumber/:fullName` - ZIP download
3. `GET /api/creation/download-by-id/:resumeId` - Resume download
4. `DELETE /api/suivi/:userId/file` - File deletion (already tested in previous checklist)

## API Configuration

Current base URL: `http://localhost:5000`
File: `client/api.js`

```javascript
const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});
```

**Production Note:** Update `baseURL` to production server URL before deployment.

## Success Criteria

✅ All downloads work without errors
✅ Correct filenames are preserved
✅ Toast notifications appear for success/error
✅ Files are accessible after download
✅ Mobile download buttons are easy to tap
✅ Delete functionality works after download
✅ No console errors during download operations

## Performance Notes

- Downloads use browser's native download mechanism (no memory buffering in JS)
- HEAD requests prevent unnecessary data transfer for missing files
- Multiple file downloads are handled sequentially by browser
