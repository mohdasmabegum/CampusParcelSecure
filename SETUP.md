# Setup Instructions for Campus Parcel Secure

## Prerequisites Installation

### Step 1: Install Node.js and npm

1. **Download Node.js**:
   - Visit: https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the installation wizard
   - Make sure to check "Automatically install necessary tools" during installation

2. **Verify Installation**:
   - Open a new PowerShell window
   - Run: `node --version`
   - Run: `npm --version`
   - Both commands should display version numbers

### Step 2: Install Project Dependencies

After Node.js is installed, run these commands in PowerShell:

```powershell
cd "c:\Users\mdasm\OneDrive\ドキュメント\GitHub\CampusParcelSecure"
npm install
```

### Step 3: Start the Application

To start the server:

```powershell
npm start
```

Or for development mode with auto-reload:

```powershell
npm run dev
```

### Step 4: Access the Application

Open your web browser and visit:
- **Main Page**: http://localhost:3000
- **Delivery Page**: http://localhost:3000/delivery.html
- **Pickup Page**: http://localhost:3000/pickup.html
- **Admin Dashboard**: http://localhost:3000/admin.html

## Using the Application

### For Delivery Personnel (Register Parcel)

1. Go to http://localhost:3000/delivery.html
2. Fill in:
   - Student ID (e.g., STU001)
   - Student Name
   - Parcel Description (optional)
   - Upload or capture an image of the parcel
3. Click "Register Parcel"
4. **Important**: Note down the generated OTP and give it to the student

### For Students (Pickup Parcel)

1. Go to http://localhost:3000/pickup.html
2. Fill in:
   - Your Student ID
   - The OTP you received
   - Take a photo of yourself with the parcel
3. Click "Confirm Pickup"
4. If credentials match, parcel will be marked as delivered

### For Administrators (Monitor Parcels)

1. Go to http://localhost:3000/admin.html
2. View all parcels with:
   - Total count, pending, and completed statistics
   - Filter by status
   - View delivery and pickup images
3. Dashboard auto-refreshes every 30 seconds

## Testing the Application

### Test Scenario 1: Complete Delivery Flow

1. **Register a Delivery**:
   - Go to delivery page
   - Student ID: `STU001`
   - Student Name: `John Doe`
   - Upload any image
   - Note the OTP (e.g., `123456`)

2. **Pickup the Parcel**:
   - Go to pickup page
   - Student ID: `STU001`
   - OTP: `123456`
   - Upload another image
   - Submit

3. **Verify in Admin**:
   - Go to admin dashboard
   - See the parcel marked as "Completed"
   - View both delivery and pickup images

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, edit `server.js` and change:
```javascript
const PORT = 3000;
```
to another port like:
```javascript
const PORT = 3001;
```

### Image Upload Issues
- Make sure you're using a supported image format (JPEG, PNG, GIF)
- File size must be under 5MB
- Check if the `uploads` folder exists (it's created automatically)

### Cannot Access from Other Devices
To access from other devices on the same network, change `server.js`:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
```

## Project Features Checklist

✅ Image input through file upload or camera capture  
✅ OTP generation at delivery time  
✅ Student enters same OTP for pickup  
✅ Image verification at pickup  
✅ Credential matching (Student ID + OTP)  
✅ Product marked as done when student receives it  
✅ Admin dashboard to monitor all activities  

## Next Steps

Once you've installed Node.js and tested the application:

1. Consider adding a database (MongoDB or PostgreSQL)
2. Implement SMS/Email notifications for OTP
3. Add user authentication
4. Deploy to a cloud service (Heroku, Vercel, AWS)
5. Create a mobile app version

## Support

If you encounter any issues:
1. Make sure Node.js is properly installed
2. Check the terminal for error messages
3. Verify all files are in the correct locations
4. Ensure port 3000 is available

---

**Created**: January 2026  
**Author**: Mohammad Asma Begum
