# Hostinger Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Build Your Project Locally
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

### 2. Prepare Your Hostinger Account
- Log in to your Hostinger control panel (hPanel)
- Navigate to File Manager
- Go to your domain's `public_html` folder (or subdomain folder)

### 3. Upload Files to Hostinger

#### Option A: Using File Manager (Recommended)
1. In hPanel, open **File Manager**
2. Navigate to `public_html` folder
3. Delete any existing files (index.html, etc.)
4. Click **Upload** button (top right)
5. Select ALL files from your `dist` folder:
   - `index.html`
   - `.htaccess`
   - `robots.txt`
   - `sitemap.xml`
   - `assets/` folder (entire folder)
   - `.well-known/` folder (entire folder)
6. Wait for upload to complete

#### Option B: Using VS Code FTP Extension
1. Install "SFTP" extension in VS Code
2. Create `.vscode/sftp.json`:
```json
{
  "name": "Hostinger",
  "host": "your-server.hostinger.com",
  "protocol": "ftp",
  "port": 21,
  "username": "your-ftp-username",
  "password": "your-ftp-password",
  "remotePath": "/public_html",
  "uploadOnSave": false
}
```
3. Right-click `dist` folder → Upload Folder

#### Option C: Using FileZilla
1. Download FileZilla (free FTP client)
2. Connect using your FTP credentials from hPanel
3. Navigate to `public_html` on server
4. Drag all files from local `dist` folder to server

### 4. Verify .htaccess File
Make sure `.htaccess` is uploaded correctly (it starts with a dot and might be hidden).

The file includes:
- GZIP compression
- Browser caching
- Security headers
- SPA routing (redirect all to index.html)
- Force HTTPS

### 5. Configure SSL Certificate
1. In hPanel, go to **SSL** section
2. Enable **Free SSL Certificate** for your domain
3. Wait 5-10 minutes for activation
4. Verify HTTPS works

### 6. Update Domain Settings (If needed)
1. Go to **Domains** section
2. Make sure your domain points to the correct folder
3. If using subdomain, create it first and point to correct folder

### 7. Test Your Site
Visit your domain and check:
- ✓ Homepage loads correctly
- ✓ Navigation works
- ✓ All sections visible
- ✓ Forms work
- ✓ WhatsApp button appears
- ✓ Mobile responsive
- ✓ HTTPS is active (green padlock)

### 8. Update SEO Meta Tags
Before uploading, update these in `index.html`:
- Replace `yourdomain.com` with your actual domain
- Update contact email in `security.txt`
- Update sitemap.xml URLs

## Important Environment Variables

Your Supabase credentials are already configured:
- VITE_SUPABASE_URL: https://qwnbdhqfkexvcmnfkxvt.supabase.co
- VITE_SUPABASE_ANON_KEY: (already embedded in build)

These are PUBLIC keys and safe to include in the build.

## Common Issues & Solutions

### Issue: Pages return 404 when refreshed
**Solution**: Make sure `.htaccess` file is uploaded correctly

### Issue: HTTPS not working
**Solution**: Enable SSL in hPanel and wait 10 minutes

### Issue: Files not uploading
**Solution**: Check folder permissions (755 for folders, 644 for files)

### Issue: WhatsApp number not set
**Solution**: Log in to admin panel at `/admin-aadya-2024` and configure

### Issue: Site looks broken
**Solution**: Clear browser cache (Ctrl+Shift+R) and check all files uploaded

## File Structure in public_html
```
public_html/
├── index.html
├── .htaccess
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   ├── vendor-[hash].js
│   └── supabase-[hash].js
└── .well-known/
    └── security.txt
```

## Performance Optimization
The build includes:
- Code splitting (vendor, supabase, app chunks)
- Minified JavaScript and CSS
- GZIP compression via .htaccess
- Browser caching headers
- Optimized images with lazy loading

## Admin Panel Access
URL: `https://yourdomain.com/admin-aadya-2024`

Create admin account:
1. Visit `/admin-aadya-2024`
2. Click "Sign up here"
3. Use email: admin@yourdomain.com
4. Create secure password
5. Login and start managing content

## Updating Content
1. Make changes locally
2. Run `npm run build`
3. Upload only changed files from `dist` folder
4. Or upload entire `dist` folder to replace all

## Support
For Hostinger-specific issues:
- Visit Hostinger Help Center
- Contact Hostinger support (24/7 live chat)

For website issues:
- Check browser console for errors (F12)
- Verify Supabase connection
- Check admin panel for content
