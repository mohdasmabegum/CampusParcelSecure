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
- **Storage**: In-memory (upgradable to database)

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

**Note**: This application uses in-memory storage. For production use, integrate with a proper database system. 
