const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// In-memory database (replace with a real database in production)
let parcels = [];
let parcelIdCounter = 1;

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Routes

// Get all parcels
app.get('/api/parcels', (req, res) => {
  res.json(parcels);
});

// Get parcel by ID
app.get('/api/parcels/:id', (req, res) => {
  const parcel = parcels.find(p => p.id === parseInt(req.params.id));
  if (parcel) {
    res.json(parcel);
  } else {
    res.status(404).json({ error: 'Parcel not found' });
  }
});

// Delivery: Register new parcel with image and generate OTP
app.post('/api/delivery', upload.single('image'), (req, res) => {
  try {
    const { studentId, studentName, parcelDescription } = req.body;
    
    if (!studentId || !studentName || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const otp = generateOTP();
    const parcel = {
      id: parcelIdCounter++,
      studentId,
      studentName,
      parcelDescription: parcelDescription || 'N/A',
      deliveryImage: req.file.filename,
      deliveryTimestamp: new Date().toISOString(),
      otp,
      status: 'pending',
      pickupImage: null,
      pickupTimestamp: null
    };

    parcels.push(parcel);
    
    res.json({
      success: true,
      message: 'Parcel registered successfully',
      parcelId: parcel.id,
      otp: parcel.otp,
      studentId: parcel.studentId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pickup: Verify OTP and image, mark as delivered
app.post('/api/pickup', upload.single('image'), (req, res) => {
  try {
    const { studentId, otp } = req.body;
    
    if (!studentId || !otp || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find pending parcel with matching studentId and OTP
    const parcel = parcels.find(
      p => p.studentId === studentId && 
           p.otp === otp && 
           p.status === 'pending'
    );

    if (!parcel) {
      return res.status(404).json({ 
        success: false,
        error: 'Invalid credentials or parcel not found' 
      });
    }

    // Update parcel with pickup information
    parcel.pickupImage = req.file.filename;
    parcel.pickupTimestamp = new Date().toISOString();
    parcel.status = 'completed';

    res.json({
      success: true,
      message: 'Parcel picked up successfully',
      parcelId: parcel.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending parcels for a student
app.get('/api/student/:studentId/parcels', (req, res) => {
  const studentParcels = parcels.filter(
    p => p.studentId === req.params.studentId && p.status === 'pending'
  );
  res.json(studentParcels);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: parcels.length,
    pending: parcels.filter(p => p.status === 'pending').length,
    completed: parcels.filter(p => p.status === 'completed').length
  };
  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Delivery page: http://localhost:${PORT}/delivery.html`);
  console.log(`Pickup page: http://localhost:${PORT}/pickup.html`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});
