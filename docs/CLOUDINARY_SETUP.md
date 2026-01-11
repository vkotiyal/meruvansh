# Cloudinary Setup Guide

This guide will help you configure Cloudinary for profile picture uploads in MeruVansh.

## Why Cloudinary?

Cloudinary provides:

- Free tier with generous limits (25 GB storage, 25 GB bandwidth/month)
- Automatic image optimization and transformations
- CDN delivery for fast loading
- Secure upload widget

## Setup Steps

### 1. Create a Cloudinary Account

1. Visit [Cloudinary.com](https://cloudinary.com/)
2. Click "Sign Up for Free"
3. Complete the registration

### 2. Get Your Credentials

After logging in to your Cloudinary dashboard:

1. Go to **Dashboard** → **Programmable Media**
2. You'll see your **Cloud Name**, **API Key**, and **API Secret**
3. Copy these values - you'll need them for your `.env.local` file

### 3. Create an Upload Preset

An upload preset defines how images are handled when uploaded:

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `vanshvriksh-profiles` (or any name you prefer)
   - **Signing Mode**: **Unsigned** (allows client-side uploads)
   - **Folder**: `vanshvriksh/profiles` (optional, organizes uploads)
   - **Allowed formats**: `jpg`, `png`, `webp`, `gif`
   - **Transformation**: Set to limit file size if needed
     - Example: `c_limit,w_800,h_800,q_auto`
5. Click **Save**
6. Copy the **Upload preset name**

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="vanshvriksh-profiles"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Replace:

- `your-cloud-name` with your Cloud Name from step 2
- `vanshvriksh-profiles` with your upload preset name from step 3
- `your-api-key` with your API Key from step 2
- `your-api-secret` with your API Secret from step 2

### 5. Restart Development Server

```bash
# Stop the server (Ctrl+C) and restart:
npm run dev
```

### 6. Test Image Upload

1. Go to **Add Member** page
2. Click **Upload Photo**
3. Select an image from your computer
4. The image should upload and display a preview
5. Complete the form and save

## Security Best Practices

### Unsigned vs Signed Uploads

- **Unsigned**: Easier to set up, good for public uploads with restrictions via upload preset
- **Signed**: More secure, requires server-side signature generation

For production, consider implementing signed uploads for better security.

### Recommended Upload Preset Settings

```
Signing Mode: Unsigned
Folder: vanshvriksh/profiles
Allowed formats: jpg, png, webp
Max file size: 5 MB
Transformation: c_limit,w_800,h_800,q_auto:good
```

## Troubleshooting

### Upload Widget Not Appearing

**Problem**: Upload button doesn't open widget

**Solutions**:

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is set correctly
3. Ensure upload preset is set to "Unsigned" mode
4. Restart development server after adding env variables

### Images Not Loading

**Problem**: Uploaded images don't display

**Solutions**:

1. Check `next.config.mjs` includes Cloudinary domain:
   ```js
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "res.cloudinary.com",
       },
     ],
   }
   ```
2. Verify the image URL is being saved to database
3. Check browser console for CORS errors

### "Invalid Upload Preset" Error

**Problem**: Error when trying to upload

**Solutions**:

1. Verify upload preset name matches exactly (case-sensitive)
2. Ensure upload preset is set to "Unsigned" mode
3. Check you're using the correct Cloudinary cloud name

## Free Tier Limits

Cloudinary Free Plan includes:

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Video**: 2 GB storage, 5 GB bandwidth/month

For a family tree app, this is more than sufficient for thousands of users.

## Alternative: Local File Storage

If you prefer not to use Cloudinary, you can implement local file storage:

1. Use Next.js API routes for file uploads
2. Store files in `public/uploads/` directory
3. Save relative paths to database

This approach is simpler but:

- No CDN (slower loading for users far from your server)
- No automatic image optimization
- Manual backup required
- Not recommended for production deployments on Vercel (ephemeral filesystem)

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [next-cloudinary](https://next-cloudinary.spacejelly.dev/)
- [Upload Widget Docs](https://cloudinary.com/documentation/upload_widget)
