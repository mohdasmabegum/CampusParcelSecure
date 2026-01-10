# CampusParcelSecure

A secure student parcel verification system that ensures safe delivery confirmation using a two-step OTP validation process.

## Features

- 📦 **Parcel Registration**: Campus staff can upload parcel images and generate unique OTPs for students
- 🔍 **Parcel Verification**: Students verify their identity using Student ID and OTP to receive parcels
- 🔒 **Secure Process**: Image verification combined with OTP-based authentication
- ✅ **Status Tracking**: Automatic marking of parcels as received upon successful verification

## How It Works

1. **Registration**: Campus staff uploads parcel image and student details to generate a unique OTP
2. **Notification**: Student receives the OTP for parcel collection
3. **Verification**: Student enters their ID and OTP to verify and collect the parcel
4. **Confirmation**: System marks the parcel as received upon successful verification

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mohdasmabegum/CampusParcelSecure.git
cd CampusParcelSecure
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Set a custom secret key for production:
```bash
export SECRET_KEY='your-secure-random-key-here'
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Registering a Parcel

1. Click "Register New Parcel" on the home page
2. Enter student name and student ID
3. Upload or capture a parcel image
4. Click "Register Parcel"
5. Save the generated OTP and share it with the student

### Verifying and Receiving a Parcel

1. Click "Verify & Receive Parcel" on the home page
2. Enter your Student ID
3. Enter the OTP you received
4. Click "Verify & Receive Parcel"
5. View the parcel details and image confirmation
6. The parcel is automatically marked as received

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Image Processing**: Pillow

## Security Features

- OTP-based authentication (6-digit codes)
- Image verification for parcel confirmation
- Secure file upload with type validation
- One-time parcel verification (prevents duplicate claims)
- Database storage of all transactions
- Environment-based configuration for secret key and debug mode

## Production Deployment

For production deployment, it's recommended to:

1. Set a strong SECRET_KEY:
```bash
export SECRET_KEY='your-strong-random-secret-key'
```

2. Disable debug mode (default):
```bash
# Debug is disabled by default
# Only enable for development: export FLASK_DEBUG=true
python app.py
```

3. Use a production-ready WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

4. Set up HTTPS/SSL for secure communication
5. Use a proper database (PostgreSQL, MySQL) instead of SQLite for production
6. Implement proper backup and monitoring systems

## Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/702f0d19-0af8-4b66-a52e-7e12611fae1e)

### Parcel Registration
![Registration Page](https://github.com/user-attachments/assets/93801391-c4e2-40bd-a68e-3f855a40c835)

### Parcel Verification
![Verification Page](https://github.com/user-attachments/assets/3cc7c3a5-0981-4b53-9ffc-2350a2a5a0b1)

### Successful Verification
![Success Page](https://github.com/user-attachments/assets/cb63a465-232b-4583-974f-7b2edbecd58a)

## License

This project is open source and available under the MIT License. 
