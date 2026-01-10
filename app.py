import os
import sqlite3
import random
import string
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'campus-parcel-secure-key-2024')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database setup
def init_db():
    conn = sqlite3.connect('parcels.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS parcels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            image_path TEXT NOT NULL,
            otp TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            received_at TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def generate_otp(length=6):
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

@app.route('/')
def index():
    """Home page with repository title"""
    return render_template('index.html')

@app.route('/register')
def register_page():
    """Parcel registration page"""
    return render_template('register.html')

@app.route('/verify')
def verify_page():
    """Parcel verification page"""
    return render_template('verify.html')

@app.route('/api/register', methods=['POST'])
def register_parcel():
    """Register a new parcel with image and OTP"""
    try:
        student_name = request.form.get('student_name')
        student_id = request.form.get('student_id')
        
        if not student_name or not student_id:
            return jsonify({'success': False, 'message': 'Student name and ID are required'}), 400
        
        # Handle image upload
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No image selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{student_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Generate OTP
            otp = generate_otp()
            
            # Save to database
            conn = sqlite3.connect('parcels.db')
            c = conn.cursor()
            c.execute('''
                INSERT INTO parcels (student_name, student_id, image_path, otp, status)
                VALUES (?, ?, ?, ?, 'pending')
            ''', (student_name, student_id, filepath, otp))
            parcel_id = c.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Parcel registered successfully!',
                'parcel_id': parcel_id,
                'otp': otp
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify_parcel():
    """Verify parcel with student ID and OTP"""
    try:
        student_id = request.form.get('student_id')
        otp = request.form.get('otp')
        
        if not student_id or not otp:
            return jsonify({'success': False, 'message': 'Student ID and OTP are required'}), 400
        
        # Query database
        conn = sqlite3.connect('parcels.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('''
            SELECT * FROM parcels 
            WHERE student_id = ? AND otp = ? AND status = 'pending'
            ORDER BY registered_at DESC
            LIMIT 1
        ''', (student_id, otp))
        
        parcel = c.fetchone()
        
        if parcel:
            # Mark as received
            c.execute('''
                UPDATE parcels 
                SET status = 'received', received_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (parcel['id'],))
            conn.commit()
            
            # Read image and convert to base64 for display
            with open(parcel['image_path'], 'rb') as img_file:
                image_data = base64.b64encode(img_file.read()).decode('utf-8')
            
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Parcel verified and marked as received!',
                'parcel': {
                    'id': parcel['id'],
                    'student_name': parcel['student_name'],
                    'student_id': parcel['student_id'],
                    'image_data': image_data,
                    'registered_at': parcel['registered_at']
                }
            })
        else:
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid student ID or OTP, or parcel already received'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/parcels', methods=['GET'])
def get_parcels():
    """Get all parcels (for admin view)"""
    try:
        conn = sqlite3.connect('parcels.db')
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM parcels ORDER BY registered_at DESC')
        parcels = [dict(row) for row in c.fetchall()]
        conn.close()
        
        return jsonify({'success': True, 'parcels': parcels})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    init_db()
    # Debug mode should only be enabled during development
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
