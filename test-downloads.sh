#!/bin/bash

# Download Feature Verification Script
# Run this script to quickly verify download endpoints are accessible

echo "======================================"
echo "Oriventa Admin - Download Feature Test"
echo "======================================"
echo ""

BASE_URL="http://localhost:5000"

echo "✓ Testing server connection..."
curl -s -o /dev/null -w "Server Status: %{http_code}\n" "$BASE_URL/"
echo ""

echo "✓ Checking uploads directory..."
if [ -d "../server/uploads" ]; then
    echo "Uploads directory exists ✓"
    FILE_COUNT=$(find ../server/uploads -type f | wc -l)
    echo "Total files in uploads: $FILE_COUNT"
    echo ""
    
    echo "Sample files:"
    find ../server/uploads -type f | head -5
    echo ""
else
    echo "⚠ Uploads directory not found!"
    echo ""
fi

echo "✓ Testing static file serving..."
echo "Checking if /uploads route is accessible..."
# This will return 403 (Forbidden) if directory listing is disabled, which is expected
curl -s -o /dev/null -w "Uploads Route Status: %{http_code}\n" "$BASE_URL/uploads/"
echo ""

echo "======================================"
echo "Manual Testing Required:"
echo "======================================"
echo ""
echo "1. Client Side Downloads:"
echo "   - Login as client user"
echo "   - Navigate to /profile"
echo "   - Click download buttons on CV/LM files"
echo ""
echo "2. Admin Side Downloads:"
echo "   - Login as manager/admin"
echo "   - Navigate to /settings"
echo "   - Open Suivi modal for a user"
echo "   - Click 📥 download buttons"
echo ""
echo "3. Management Downloads:"
echo "   - Navigate to /candidates"
echo "   - Click dropdown actions → Download"
echo "   - Check individual file links in advanced columns"
echo ""
echo "4. Resume Downloads:"
echo "   - Navigate to /resume"
echo "   - Open resume details modal"
echo "   - Click 'Télécharger le reçu' button"
echo ""
echo "======================================"
echo "All downloads should:"
echo "  ✓ Use proper filename"
echo "  ✓ Show toast notification (where applicable)"
echo "  ✓ Download actual file (not HTML)"
echo "  ✓ Work on mobile devices"
echo "======================================"
