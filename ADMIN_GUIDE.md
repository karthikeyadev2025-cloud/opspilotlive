# Aadya Enterprises - Admin Guide

Welcome to the Aadya Enterprises Content Management System!

## Accessing the Admin Panel

1. Navigate to `/admin` in your browser (e.g., `https://yourwebsite.com/admin`)
2. You'll be presented with a login screen

## First Time Setup

### Creating an Admin Account

Since this is your first time, you need to create an admin account:

1. Open your Supabase dashboard
2. Go to Authentication → Users
3. Click "Add User" or "Invite User"
4. Create a new user with your email and password
5. Use these credentials to log in to `/admin`

## Managing Content

Once logged in, you'll see four main sections:

### 1. Site Content

Edit all text content on your website:

- **Hero Section**: Main title, subtitle, tagline, and description
- **About Section**: About us title and description
- **Contact Section**: Phone number, email, and address

Simply edit the text fields and click "Save Changes"

### 2. Services

Manage the services displayed on your website:

- **Add Service**: Click "+ Add Service" button
  - Enter title (e.g., "CCTV Installation")
  - Enter description
  - Choose an icon (Camera, Sun, Shield, Settings)
  - Set order (lower numbers appear first)
  - Click "Save"

- **Edit Service**: Click the pencil icon on any service
- **Delete Service**: Click the trash icon (will ask for confirmation)

### 3. Gallery

Manage your portfolio images:

- **Add Image**: Click "+ Add Image" button
  - Enter image URL (must be a valid web URL)
  - Enter title/description
  - Choose category (CCTV or Solar)
  - Set order
  - Click "Save"

- **Delete Image**: Click the trash icon on any image

**Note**: Images must be hosted online. You can use free image hosting services or upload to your own server.

### 4. Testimonials

Manage client testimonials:

- **Add Testimonial**: Click "+ Add Testimonial" button
  - Enter client name
  - Enter company (optional)
  - Enter testimonial text
  - Select rating (1-5 stars)
  - Enter client image URL (optional)
  - Click "Save"

- **Edit Testimonial**: Click the pencil icon
- **Delete Testimonial**: Click the trash icon

## Tips for Best Results

### Images
- Use high-quality images (at least 1920x1080 for best results)
- Use consistent aspect ratios for gallery images
- Compress images before uploading to improve loading speed

### Text Content
- Keep taglines short and memorable
- Service descriptions should be 1-2 sentences
- Testimonials are most effective when specific and detailed

### Gallery Organization
- Use the "order" field to control display order (0 appears first)
- Categorize images correctly (CCTV vs Solar)
- Add descriptive titles for better user experience

## Viewing Your Changes

All changes appear on the live website immediately after saving. To see your changes:

1. Click "View Site" in the top navigation
2. Or open your website in a new tab
3. Refresh the page to see updates

## Logging Out

Click the "Logout" button in the top right corner when you're done managing content.

## Support

If you need help or encounter issues:
- Check that all required fields are filled in
- Verify image URLs are valid and accessible
- Ensure you're logged in as an authenticated user
- Contact your developer for technical assistance

## Security Notes

- Never share your admin credentials
- Always log out when finished
- Use a strong, unique password
- Consider enabling two-factor authentication in Supabase

---

**Enjoy managing your website!**
