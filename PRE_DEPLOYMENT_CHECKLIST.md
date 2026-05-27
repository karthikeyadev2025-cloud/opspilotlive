# Pre-Deployment Checklist

## Before Uploading to Hostinger

### 1. Update Domain References
- [ ] Replace `yourdomain.com` in `index.html` with actual domain
- [ ] Update `public/sitemap.xml` with actual domain URLs
- [ ] Update `public/.well-known/security.txt` contact email
- [ ] Update Open Graph URLs in `index.html`

### 2. Verify Build
- [x] Run `npm run build` successfully
- [x] Check `dist` folder exists with all files
- [x] Verify `.htaccess` file is present in dist
- [x] Check assets folder has CSS and JS files

### 3. Test Locally
- [ ] Run `npm run preview` to test production build
- [ ] Check all pages load correctly
- [ ] Verify mobile responsiveness
- [ ] Test all animations work smoothly
- [ ] Check forms are functional

### 4. Supabase Configuration
- [x] Environment variables set correctly
- [ ] Create admin account after deployment
- [ ] Add WhatsApp number in admin panel
- [ ] Upload gallery images
- [ ] Configure contact information

### 5. Upload to Hostinger
- [ ] Connect via FTP/File Manager
- [ ] Upload all files from `dist` folder to `public_html`
- [ ] Verify `.htaccess` file is uploaded (hidden file)
- [ ] Check folder structure matches expected

### 6. Post-Deployment Steps
- [ ] Enable SSL certificate in hPanel
- [ ] Verify HTTPS works (green padlock)
- [ ] Test website on mobile device
- [ ] Check all internal links work
- [ ] Verify WhatsApp button appears (after configuring)
- [ ] Test contact form submission
- [ ] Check admin panel access: `/admin-aadya-2024`

### 7. SEO & Performance
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt is accessible
- [ ] Check PageSpeed Insights score
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Verify all images load with lazy loading

### 8. Admin Panel Setup
- [ ] Visit `/admin-aadya-2024`
- [ ] Create admin account
- [ ] Login successfully
- [ ] Add company information
- [ ] Upload gallery images (CCTV, Solar projects)
- [ ] Configure WhatsApp number
- [ ] Add team members info
- [ ] Customize service descriptions

## Files to Upload (from dist folder)
```
✓ index.html
✓ .htaccess
✓ robots.txt
✓ sitemap.xml
✓ assets/ (entire folder)
✓ .well-known/ (entire folder)
```

## Critical Settings
- **Admin URL**: `/admin-aadya-2024`
- **Supabase URL**: https://qwnbdhqfkexvcmnfkxvt.supabase.co
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Quick Command Reference
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# List dist files
ls -la dist/
```

## Need Help?
Refer to `HOSTINGER_DEPLOYMENT_GUIDE.md` for detailed instructions.
