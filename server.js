const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
let Redis = null;

try {
  ({ Redis } = require('@upstash/redis'));
} catch (error) {
  Redis = null;
}

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_FILE = IS_VERCEL
  ? path.join('/tmp', 'parcel-data.json')
  : path.join(__dirname, 'parcel-data.json');
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS = Boolean(Redis && REDIS_URL && REDIS_TOKEN);
const redis = USE_REDIS ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = USE_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })
  : null;

// Resolve absolute paths for public and uploads (important for hosted environments)
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = IS_VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/login.html', (req, res) => {
  res.redirect('/admin.html');
});

app.get('/register.html', (req, res) => {
  res.redirect('/admin.html');
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();

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

function buildImageReference(file) {
  if (!file || !file.buffer || !file.mimetype) {
    return null;
  }

  const base64Payload = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64Payload}`;
}

// Data store (Upstash Redis in production when configured; local file fallback)
let parcels = [];
let parcelIdCounter = 1;
let users = [];
let userIdCounter = 1;
let dataLoaded = false;
let loadPromise = null;
let defaultAdminEnsured = false;
const DEFAULT_ADMIN_ACCOUNT = {
  fullName: 'VMTW Admin',
  email: 'vmtw',
  password: 'admin',
  role: 'admin'
};

async function loadPersistedData() {
  try {
    let parsed = null;

    if (USE_REDIS) {
      parsed = await redis.get('campusParcelData');
    } else if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      parsed = raw ? JSON.parse(raw) : null;
    }

    if (!parsed) {
      return;
    }

    parcels = Array.isArray(parsed.parcels) ? parsed.parcels : [];
    users = Array.isArray(parsed.users) ? parsed.users : [];
    parcelIdCounter = Number(parsed.parcelIdCounter) || (parcels.length + 1);
    userIdCounter = Number(parsed.userIdCounter) || (users.length + 1);
  } catch (error) {
    console.error('Failed to load persisted data:', error.message);
  }
}

async function persistData() {
  const payload = {
    parcels,
    users,
    parcelIdCounter,
    userIdCounter,
    updatedAt: new Date().toISOString()
  };

  if (USE_REDIS) {
    await redis.set('campusParcelData', payload);
    return;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

async function ensureDataLoaded() {
  if (USE_SUPABASE) {
    return;
  }

  if (dataLoaded) {
    return;
  }

  if (!loadPromise) {
    loadPromise = loadPersistedData()
      .then(() => {
        dataLoaded = true;
      })
      .catch((error) => {
        console.error('Data initialization failed:', error.message);
      });
  }

  await loadPromise;
}

async function ensureDefaultAdminAccount() {
  if (defaultAdminEnsured) {
    return;
  }

  const normalizedEmail = DEFAULT_ADMIN_ACCOUNT.email.toLowerCase();

  if (USE_SUPABASE) {
    const { data: existingUsers, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1);

    if (existingUserError) {
      throw new Error(existingUserError.message);
    }

    if (existingUsers && existingUsers.length > 0) {
      defaultAdminEnsured = true;
      return;
    }

    const { data: existingAdmins, error: adminLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(2);

    if (adminLookupError) {
      throw new Error(adminLookupError.message);
    }

    if ((existingAdmins || []).length >= 2) {
      return;
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: DEFAULT_ADMIN_ACCOUNT.fullName,
        email: normalizedEmail,
        password: DEFAULT_ADMIN_ACCOUNT.password,
        role: DEFAULT_ADMIN_ACCOUNT.role,
        student_id: null
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    defaultAdminEnsured = true;
    return;
  }

  const existingUser = users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    defaultAdminEnsured = true;
    return;
  }

  const existingAdmins = users.filter((user) => user.role === 'admin');
  if (existingAdmins.length >= 2) {
    return;
  }

  users.push({
    id: userIdCounter++,
    fullName: DEFAULT_ADMIN_ACCOUNT.fullName,
    email: normalizedEmail,
    password: DEFAULT_ADMIN_ACCOUNT.password,
    role: DEFAULT_ADMIN_ACCOUNT.role,
    studentId: null,
    createdAt: new Date().toISOString()
  });

  await persistData();
  defaultAdminEnsured = true;
}

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentId: user.studentId
  };
}

function mapDbUserToApi(userRow) {
  return {
    id: userRow.id,
    fullName: userRow.full_name,
    email: userRow.email,
    role: userRow.role,
    studentId: userRow.student_id
  };
}

function mapDbParcelToApi(parcelRow) {
  return {
    id: parcelRow.id,
    studentId: parcelRow.student_id,
    studentName: parcelRow.student_name,
    parcelDescription: parcelRow.parcel_description,
    deliveryImage: parcelRow.delivery_image,
    deliveryTimestamp: parcelRow.delivery_timestamp,
    otp: parcelRow.otp,
    status: parcelRow.status,
    pickupImage: parcelRow.pickup_image,
    pickupTimestamp: parcelRow.pickup_timestamp
  };
}

app.use(async (req, res, next) => {
  await ensureDataLoaded();
  await ensureDefaultAdminAccount();
  next();
});

// API Routes

// Register a new user (student, customer, or one admin)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role, studentId } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['student', 'customer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student, customer, or admin' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({ error: 'Student ID is required for student registration' });
    }

    if (role === 'admin' && studentId) {
      return res.status(400).json({ error: 'Student ID is not required for admin registration' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (USE_SUPABASE) {
      if (role === 'admin') {
        const { data: existingAdmins, error: adminLookupError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(2);

        if (adminLookupError) {
          throw new Error(adminLookupError.message);
        }

        if (existingAdmins && existingAdmins.length >= 2) {
          return res.status(403).json({ error: 'Admin registration limit reached. Only 2 admin accounts are allowed.' });
        }
      }

      const { data: existingUsers, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .limit(1);

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: String(fullName).trim(),
          email: normalizedEmail,
          password,
          role,
          student_id: role === 'student' ? String(studentId).trim() : null
        })
        .select('*')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const apiUser = mapDbUserToApi(insertedUser);

      return res.json({
        success: true,
        message: 'Registration successful',
        user: apiUser
      });
    }

    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    if (role === 'admin') {
      const existingAdmins = users.filter(u => u.role === 'admin');
      if (existingAdmins.length >= 2) {
        return res.status(403).json({ error: 'Admin registration limit reached. Only 2 admin accounts are allowed.' });
      }
    }

    const user = {
      id: userIdCounter++,
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password,
      role,
      studentId: role === 'student' ? String(studentId).trim() : null,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await persistData();

    res.json({
      success: true,
      message: 'Registration successful',
      user: toPublicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let loginUser = null;

    if (USE_SUPABASE) {
      const { data: dbUser, error: loginError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('password', password)
        .single();

      if (loginError && loginError.code !== 'PGRST116') {
        throw new Error(loginError.message);
      }

      if (dbUser) {
        loginUser = mapDbUserToApi(dbUser);
      }
    } else {
      const user = users.find(u => u.email === normalizedEmail && u.password === password);
      if (user) {
        loginUser = toPublicUser(user);
      }
    }

    if (!loginUser) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const authToken = Buffer.from(`${loginUser.id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: 'Login successful',
      token: authToken,
      user: loginUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin account status (for login page guidance)
app.get('/api/auth/admin-status', async (req, res) => {
  try {
    let adminCount = 0;

    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (error) {
        throw new Error(error.message);
      }

      adminCount = (data || []).length;
    } else {
      adminCount = users.filter((user) => user.role === 'admin').length;
    }

    res.json({
      adminCount,
      canRegister: adminCount < 2
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all parcels
app.get('/api/parcels', async (req, res) => {
  try {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('delivery_timestamp', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return res.json((data || []).map(mapDbParcelToApi));
    }

    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parcel by ID
app.get('/api/parcels/:id', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.id);

    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('id', parcelId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      if (!data) {
        return res.status(404).json({ error: 'Parcel not found' });
      }

      return res.json(mapDbParcelToApi(data));
    }

    const parcel = parcels.find(p => p.id === parcelId);
    if (parcel) {
      res.json(parcel);
    } else {
      res.status(404).json({ error: 'Parcel not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delivery: Register new parcel with image and generate OTP
app.post('/api/delivery', upload.single('image'), async (req, res) => {
  try {
    const { studentId, studentName, parcelDescription, otp } = req.body;
    const normalizedStudentId = String(studentId || 'N/A').trim() || 'N/A';
    const deliveryImageRef = buildImageReference(req.file);
    
    if (!studentName || !otp || !deliveryImageRef) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate OTP is 6 numeric digits
    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be exactly 6 digits' });
    }

    let parcelId = null;

    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('parcels')
        .insert({
          student_id: normalizedStudentId,
          student_name: String(studentName).trim(),
          parcel_description: parcelDescription || 'N/A',
          delivery_image: deliveryImageRef,
          otp,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      parcelId = data.id;
    } else {
      const parcel = {
        id: parcelIdCounter++,
        studentId: normalizedStudentId,
        studentName,
        parcelDescription: parcelDescription || 'N/A',
        deliveryImage: deliveryImageRef,
        deliveryTimestamp: new Date().toISOString(),
        otp,
        status: 'pending',
        pickupImage: null,
        pickupTimestamp: null
      };

      parcels.push(parcel);
      await persistData();
      parcelId = parcel.id;
    }
    
    res.json({
      success: true,
      message: 'Parcel registered successfully',
      parcelId,
      otp,
      studentId: normalizedStudentId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pickup: Verify OTP and image, mark as delivered
app.post('/api/pickup', upload.single('image'), async (req, res) => {
  try {
    const { studentId, otp } = req.body;
    const normalizedStudentId = String(studentId || '').trim();
    const shouldEnforceStudentId = normalizedStudentId && normalizedStudentId.toUpperCase() !== 'N/A';
    const pickupImageRef = buildImageReference(req.file);
    
    if (!otp || !pickupImageRef) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be exactly 6 digits' });
    }

    let parcelId = null;

    if (USE_SUPABASE) {
      const { data: pendingParcels, error: fetchError } = await supabase
        .from('parcels')
        .select('id, student_id')
        .eq('otp', otp)
        .eq('status', 'pending')
        .limit(10);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!pendingParcels || pendingParcels.length === 0) {
        const { data: otpRows, error: otpLookupError } = await supabase
          .from('parcels')
          .select('status, student_id')
          .eq('otp', otp)
          .limit(5);

        if (otpLookupError) {
          throw new Error(otpLookupError.message);
        }

        if (!otpRows || otpRows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Invalid OTP'
          });
        }

        const hasPendingForOtp = otpRows.some((row) => row.status === 'pending');
        if (!hasPendingForOtp) {
          return res.status(409).json({
            success: false,
            error: 'This OTP has already been used for pickup'
          });
        }

        if (normalizedStudentId) {
          return res.status(404).json({
            success: false,
            error: 'Student ID does not match this OTP'
          });
        }

        return res.status(404).json({
          success: false,
          error: 'No pending parcel found for this OTP'
        });
      }

      let targetParcel = pendingParcels[0];

      if (shouldEnforceStudentId) {
        const exactMatch = pendingParcels.find((row) => row.student_id === normalizedStudentId);
        if (exactMatch) {
          targetParcel = exactMatch;
        } else {
          const noIdMatch = pendingParcels.find((row) => !row.student_id || String(row.student_id).toUpperCase() === 'N/A');
          if (noIdMatch) {
            targetParcel = noIdMatch;
          } else {
            return res.status(404).json({
              success: false,
              error: 'Student ID does not match this OTP'
            });
          }
        }
      }

      const targetId = targetParcel.id;
      const { error: updateError } = await supabase
        .from('parcels')
        .update({
          pickup_image: pickupImageRef,
          pickup_timestamp: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', targetId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      parcelId = targetId;
    } else {
      // Find pending parcel by OTP and optionally studentId
      const parcel = parcels.find(
        p => p.otp === otp &&
             p.status === 'pending'
      );

      let targetParcel = parcel;

      if (targetParcel && shouldEnforceStudentId) {
        if (targetParcel.studentId !== normalizedStudentId && String(targetParcel.studentId || '').toUpperCase() !== 'N/A') {
          targetParcel = null;
        }
      }

      if (!targetParcel) {
        const otpParcels = parcels.filter((item) => item.otp === otp);
        if (otpParcels.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Invalid OTP'
          });
        }

        const hasPendingForOtp = otpParcels.some((item) => item.status === 'pending');
        if (!hasPendingForOtp) {
          return res.status(409).json({
            success: false,
            error: 'This OTP has already been used for pickup'
          });
        }

        if (shouldEnforceStudentId) {
          const hasNoIdPending = otpParcels.some((item) => item.status === 'pending' && String(item.studentId || '').toUpperCase() === 'N/A');
          if (hasNoIdPending) {
            targetParcel = otpParcels.find((item) => item.status === 'pending' && String(item.studentId || '').toUpperCase() === 'N/A');
          } else {
            return res.status(404).json({
              success: false,
              error: 'Student ID does not match this OTP'
            });
          }
        }

        if (!targetParcel && shouldEnforceStudentId) {
          return res.status(404).json({
            success: false,
            error: 'Student ID does not match this OTP'
          });
        }

        return res.status(404).json({
          success: false,
          error: 'No pending parcel found for this OTP'
        });
      }

      // Update parcel with pickup information
      targetParcel.pickupImage = pickupImageRef;
      targetParcel.pickupTimestamp = new Date().toISOString();
      targetParcel.status = 'completed';
      await persistData();
      parcelId = targetParcel.id;
    }

    res.json({
      success: true,
      message: 'Parcel picked up successfully',
      parcelId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending parcels for a student
app.get('/api/student/:studentId/parcels', async (req, res) => {
  try {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .eq('student_id', req.params.studentId)
        .eq('status', 'pending')
        .order('delivery_timestamp', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return res.json((data || []).map(mapDbParcelToApi));
    }

    const studentParcels = parcels.filter(
      p => p.studentId === req.params.studentId && p.status === 'pending'
    );
    res.json(studentParcels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('parcels')
        .select('status');

      if (error) {
        throw new Error(error.message);
      }

      const rows = data || [];
      const stats = {
        total: rows.length,
        pending: rows.filter(p => p.status === 'pending').length,
        completed: rows.filter(p => p.status === 'completed').length
      };

      return res.json(stats);
    }

    const stats = {
      total: parcels.length,
      pending: parcels.filter(p => p.status === 'pending').length,
      completed: parcels.filter(p => p.status === 'completed').length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/storage-status', (req, res) => {
  res.json({
    mode: USE_SUPABASE ? 'supabase-postgres' : (USE_REDIS ? 'upstash-redis' : 'local-file'),
    filePath: USE_SUPABASE || USE_REDIS ? null : DATA_FILE
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }

  return res.status(500).json({ error: err.message || 'A server error occurred' });
});

if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Delivery page: http://localhost:${PORT}/delivery.html`);
    console.log(`Pickup page: http://localhost:${PORT}/pickup.html`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
  });
}

module.exports = app;
