# GitHub Pages Deployment Guide

## 🚀 Quick Deploy Steps

### 1. Commit and Push Your Code

```powershell
# Add all files
git add .

# Commit changes
git commit -m "Add PWA support and prepare for GitHub Pages deployment"

# Push to GitHub
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/CampusParcelSecure`
2. Click on **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **Source**, select:
   - Source: **GitHub Actions** (recommended)
5. Click **Save**

### 3. Your Site Will Be Live!

After pushing, GitHub Actions will automatically deploy your site.
- Check the **Actions** tab to see deployment progress
- Your site will be available at: `https://YOUR_USERNAME.github.io/CampusParcelSecure/`

## ⚙️ What's Been Configured

✅ **GitHub Actions Workflow** - Automatic deployment on every push  
✅ **Public folder deployment** - Only the public folder is published  
✅ **PWA support** - Full Progressive Web App functionality  
✅ **.nojekyll file** - Ensures all files are properly served

## 🔧 Update API URLs for Production

After deployment, you need to update the API endpoints in your HTML files.

**Option 1: Deploy Backend Separately**
Deploy your Node.js backend to:
- Heroku
- Railway
- Render
- Vercel (for serverless functions)

Then update all fetch URLs in:
- `public/delivery.html`
- `public/pickup.html`
- `public/admin.html`

Change from:
```javascript
fetch('http://localhost:3000/api/delivery', ...)
```

To:
```javascript
fetch('https://your-backend-url.com/api/delivery', ...)
```

**Option 2: Use GitHub Pages as Frontend Only**
Keep GitHub Pages for the frontend, deploy the backend separately.

## 📱 Testing Your Deployed App

1. Visit: `https://YOUR_USERNAME.github.io/CampusParcelSecure/`
2. Open browser DevTools (F12)
3. Go to **Application** tab → **Manifest**
4. Verify PWA is working
5. Try installing the app (look for install icon in address bar)

## 🔄 Making Updates

After initial deployment, any push to main branch will automatically redeploy:

```powershell
git add .
git commit -m "Your update message"
git push origin main
```

GitHub Actions will automatically redeploy (takes 1-2 minutes).

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Add a CNAME file in public folder with your domain
2. In GitHub Settings → Pages → Custom domain
3. Enter your domain
4. Configure DNS records with your domain provider

## 🆘 Troubleshooting

**404 Error?**
- Make sure GitHub Pages is enabled in Settings
- Check that source is set to "GitHub Actions"
- Verify the workflow ran successfully in Actions tab

**Service Worker Not Working?**
- GitHub Pages uses HTTPS ✅
- Clear browser cache
- Check browser console for errors

**App Not Updating?**
- Hard refresh: Ctrl + Shift + R
- Clear site data in browser settings
- Update CACHE_NAME in service-worker.js

**Backend API Errors?**
- Update API URLs to your production backend
- Ensure CORS is enabled on your backend
- Check backend is deployed and running

## 📊 Check Deployment Status

Go to: `https://github.com/YOUR_USERNAME/CampusParcelSecure/actions`

You'll see:
- ✅ Green check = Deployed successfully
- 🟡 Yellow dot = Currently deploying
- ❌ Red X = Deployment failed (check logs)

## 🔐 Important Security Note

For production, you'll need:
1. **Separate backend deployment** with database
2. **Environment variables** for sensitive data
3. **HTTPS** (GitHub Pages provides this automatically)
4. **CORS configuration** on your backend

## 🎉 You're Done!

Once pushed and deployed, users can:
- Visit your site URL
- Install it as a PWA on their devices
- Use it like a native app

Your app will be live at:
`https://YOUR_USERNAME.github.io/CampusParcelSecure/`
