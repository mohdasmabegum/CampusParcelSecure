# Campus Parcel Secure 📦

A comprehensive web application for secure campus parcel management with OTP verification and image authentication.

## Features

- **📸 Image Verification**: Capture images at both delivery and pickup
- **🔐 OTP Authentication**: Secure 6-digit OTP for parcel verification
- **🚚 Delivery Interface**: Register incoming parcels with student details
- **🎓 Student Pickup**: Students verify identity with OTP and photo
- **📊 Admin Dashboard**: Monitor all parcel activities in real-time
- **✅ Status Tracking**: Track parcels from delivery to completion

## How It Works

### Delivery Process
1. Delivery personnel register the parcel with:
   - Student ID
   - Student Name
   - Parcel image
   - Optional description
2. System generates a unique 6-digit OTP
3. OTP is provided to the student

### Pickup Process
1. Student visits the pickup page and enters:
   - Student ID
   - OTP received during delivery
   - Takes a photo with the parcel
2. System verifies the credentials
3. If matched, parcel is marked as completed

### Security
- Both credentials (Student ID + OTP) must match
- Image verification at both ends
- Parcel marked as done only after successful pickup

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohdasmabegum/CampusParcelSecure.git
   cd CampusParcelSecure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **For development with auto-reload**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main page: http://localhost:3000
   - Delivery: http://localhost:3000/delivery.html
   - Pickup: http://localhost:3000/pickup.html
   - Admin: http://localhost:3000/admin.html

## Project Structure

```
CampusParcelSecure/
├── server.js              # Express server and API endpoints
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html        # Landing page
│   ├── delivery.html     # Delivery registration page
│   ├── pickup.html       # Student pickup page
│   ├── admin.html        # Admin dashboard
│   └── styles.css        # Application styles
├── uploads/              # Stored parcel images (auto-created)
└── README.md            # Documentation
```

## API Endpoints

### GET `/api/parcels`
Get all parcels

### GET `/api/parcels/:id`
Get specific parcel by ID

### POST `/api/delivery`
Register new parcel delivery
- **Body**: multipart/form-data
  - `studentId`: Student identifier
  - `studentName`: Student name
  - `parcelDescription`: Description (optional)
  - `image`: Parcel image file

### POST `/api/pickup`
Process parcel pickup
- **Body**: multipart/form-data
  - `studentId`: Student identifier
  - `otp`: 6-digit OTP
  - `image`: Student photo with parcel

### GET `/api/student/:studentId/parcels`
Get pending parcels for a student

### GET `/api/stats`
Get parcel statistics (total, pending, completed)

## Technologies Used

- **Backend**: Node.js, Express.js
- **File Upload**: Multer
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: Supabase Postgres (production) with Upstash/local fallback

## Backend Database Setup

This project is now database-ready and uses **Supabase Postgres** in production when environment variables are set.

### 1) Create a Supabase project

- Go to [supabase.com](https://supabase.com) and create a new project.
- In **SQL Editor**, run [supabase/schema.sql](supabase/schema.sql).
- In **Project Settings → API**, copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2) Add environment variables

- In Vercel Project Settings → Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

For local development, copy `.env.example` to `.env` and fill values.

### 3) Verify database mode

After deploy, open:

- `/api/storage-status`

Expected response:

```json
{ "mode": "supabase-postgres", "filePath": null }
```

If you see `"local-file"`, environment variables are not configured yet.

## Production Runbook

Use this checklist for stable production operations on Vercel + Supabase.

### Required environment variables (Vercel)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### One-time database bootstrap

- Run [supabase/schema.sql](supabase/schema.sql) in Supabase SQL Editor.

### Health checks after deploy

- `GET /api/storage-status` should return:

```json
{ "mode": "supabase-postgres", "filePath": null }
```

- `GET /api/stats` should return valid JSON with `total`, `pending`, `completed`.

### Smoke test flow (manual)

1. Submit one delivery from [public/delivery.html](public/delivery.html).
2. Complete one pickup from [public/pickup.html](public/pickup.html).
3. Confirm counters update in [public/admin.html](public/admin.html) and `GET /api/stats`.

### Common issue signals

- `"Could not find the table 'public.parcels'"` → schema not applied.
- `"mode": "local-file"` in production → missing/incorrect `SUPABASE_*` env vars.

## Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import `CampusParcelSecure`.
3. Keep defaults (Framework Preset: **Other**), then click **Deploy**.
4. Open the generated URL and test:
   - `/delivery.html`
   - `/pickup.html`
   - `/admin.html`

This project includes `vercel.json` and is configured to run `server.js` as a Vercel Node function.

### Important runtime note

Vercel serverless file storage is temporary. Uploaded images are stored in `/tmp/uploads` and may be cleared between invocations/deployments. For production persistence, use object storage (for example, Vercel Blob, S3, or Cloudinary) and a database.

## Features Overview

### Delivery Interface
- Clean form for parcel registration
- Image capture/upload with preview
- Automatic OTP generation
- Success confirmation with OTP display

### Pickup Interface
- Student credential verification
- OTP input validation
- Image capture for pickup verification
- Real-time validation feedback

### Admin Dashboard
- Real-time statistics
- Filter by status (All/Pending/Completed)
- View both delivery and pickup images
- Auto-refresh every 30 seconds
- Image modal for full-size viewing

## Security Considerations

- Image file type validation (JPEG, PNG, GIF)
- File size limits (5MB)
- OTP-based authentication
- Two-factor verification (ID + OTP)
- Image evidence for both delivery and pickup

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- SMS/Email notifications for OTP
- User authentication and roles
- Barcode/QR code scanning
- Advanced image comparison
- Notification system
- Mobile app integration

## License

ISC

## Author

Mohammad Asma Begum

---

**Note**: This application supports production database mode via Supabase. If DB environment variables are not set, it falls back to temporary local storage.
