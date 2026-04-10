# CampusParcelSecure - Experimental Output Documentation

This document demonstrates the experimental outputs and testing results of the Campus Parcel Secure application.

## Overview

The Campus Parcel Secure system is a two-step OTP-based parcel verification system for campus deliveries. This document shows real experimental outputs from comprehensive testing.

---

## 1. Home Page - Landing Interface

![Home Page](https://github.com/user-attachments/assets/6bc69bb5-f79f-4fd3-946f-a6d4ee95a23e)

**Features Displayed:**
- Repository title: "CampusParcelSecure"
- Student Parcel Verification System subtitle
- Three feature cards explaining system capabilities
- Navigation buttons for Registration and Verification
- Step-by-step "How It Works" guide

---

## 2. Parcel Registration Interface

![Registration Form](https://github.com/user-attachments/assets/e3ef03e3-b351-400a-8295-7224745a7f83)

**Input Fields:**
- Student Name (text input)
- Student ID (text input)
- Parcel Image (file upload with camera capture support)

---

## 3. Successful Parcel Verification

![Verification Success](https://github.com/user-attachments/assets/2aac0931-90ff-46a9-a874-77e007b32849)

**Displayed Information:**
- Success message: "✅ Parcel verified and marked as received!"
- Parcel Details:
  - Parcel ID: 4
  - Student Name: David Wilson
  - Student ID: ST104
  - Registered At: 4/10/2026, 3:13:48 PM
- Parcel Image (uploaded during registration)
- Confirmation: "✅ Parcel successfully received and marked as delivered!"

---

## 4. API Testing Results - Comprehensive Workflow

### Test Suite Executed:

```
================================================================================
CAMPUS PARCEL SECURE - EXPERIMENTAL OUTPUT DEMONSTRATION
================================================================================

[TEST 1] Registering Parcel for Student Alice Johnson (ST101)
--------------------------------------------------------------------------------
Status: 200
Success: True
Message: Parcel registered successfully!
Parcel ID: 1
Generated OTP: 770873

[TEST 2] Registering Parcel for Student Bob Smith (ST102)
--------------------------------------------------------------------------------
Status: 200
Success: True
Message: Parcel registered successfully!
Parcel ID: 2
Generated OTP: 116304

[TEST 3] Registering Parcel for Student Carol Davis (ST103)
--------------------------------------------------------------------------------
Status: 200
Success: True
Message: Parcel registered successfully!
Parcel ID: 3
Generated OTP: 644626

[TEST 4] Attempting Verification with WRONG OTP (ST101 with 999999)
--------------------------------------------------------------------------------
Status: 404
Success: False
Message: Invalid student ID or OTP, or parcel already received

[TEST 5] Verifying Parcel with CORRECT OTP (ST101 with 770873)
--------------------------------------------------------------------------------
Status: 200
Success: True
Message: Parcel verified and marked as received!
Parcel ID: 1
Student Name: Alice Johnson
Student ID: ST101
Registered At: 2026-04-10 15:13:26
Image Data Length: 14300 bytes

[TEST 6] Attempting to verify SAME parcel again (ST101 with 770873)
--------------------------------------------------------------------------------
Status: 404
Success: False
Message: Invalid student ID or OTP, or parcel already received

[TEST 7] Verifying Parcel 2 (ST102 with 116304)
--------------------------------------------------------------------------------
Status: 200
Success: True
Message: Parcel verified and marked as received!
Parcel ID: 2
Student Name: Bob Smith
Student ID: ST102

================================================================================
SUMMARY OF EXPERIMENTAL TESTS
================================================================================
✅ Test 1: Parcel Registration (ST101) - PASSED
✅ Test 2: Parcel Registration (ST102) - PASSED
✅ Test 3: Parcel Registration (ST103) - PASSED
❌ Test 4: Verification with Wrong OTP - CORRECTLY REJECTED
✅ Test 5: Verification with Correct OTP - PASSED
❌ Test 6: Duplicate Verification - CORRECTLY REJECTED
✅ Test 7: Second Parcel Verification - PASSED

📊 RESULTS: All tests passed successfully!
================================================================================
```

---

## 5. Security Testing Results

### File Upload Validation
- ✅ Only accepts: png, jpg, jpeg, gif files
- ✅ Rejects other file types
- ✅ Uses secure_filename for sanitization
- ✅ Maximum file size: 16MB

### OTP Security
- ✅ 6-digit random OTP generation
- ✅ One-time use enforcement
- ✅ OTP invalidated after successful verification
- ✅ Prevents duplicate claims

### Database Security
- ✅ Status tracking: pending → received
- ✅ Timestamp recording for audit trail
- ✅ Prevents re-verification of received parcels

---

## 6. Complete User Workflow

### Step 1: Campus Staff Registration
1. Navigate to "Register New Parcel"
2. Enter student details (Name, ID)
3. Upload parcel image
4. Click "Register Parcel"
5. System generates unique 6-digit OTP
6. Share OTP with student

### Step 2: Student Verification
1. Navigate to "Verify & Receive Parcel"
2. Enter Student ID
3. Enter received OTP
4. Click "Verify & Receive Parcel"
5. System displays parcel details and image
6. Parcel automatically marked as received

### Step 3: Security Checks
- Wrong OTP → Rejection
- Already received parcel → Rejection
- Correct credentials → Success + Status update

---

## 7. Technical Implementation Details

### Backend (Flask)
- **Framework**: Flask 3.0.0
- **Database**: SQLite with proper schema
- **Image Processing**: Pillow 10.3.0 (security patched)
- **File Handling**: werkzeug.secure_filename
- **OTP Generation**: Random 6-digit codes using secure random

### Frontend
- **Technologies**: HTML5, CSS3, JavaScript
- **Design**: Responsive gradient UI
- **Image Display**: Base64 encoding for verification
- **User Experience**: Real-time feedback, clear error messages

### Security Features
- Environment-configurable SECRET_KEY
- Debug mode disabled by default (production-safe)
- File type validation
- One-time verification enforcement
- SQL injection prevention (parameterized queries)
- XSS prevention (proper escaping)

---

## 8. Database State After Testing

Sample database records showing the complete workflow:

| ID | Student Name | Student ID | OTP    | Status   | Registered At       | Received At         |
|----|--------------|------------|--------|----------|---------------------|---------------------|
| 1  | Alice Johnson| ST101      | 770873 | received | 2026-04-10 15:13:26 | 2026-04-10 15:13:27 |
| 2  | Bob Smith    | ST102      | 116304 | received | 2026-04-10 15:13:26 | 2026-04-10 15:13:28 |
| 3  | Carol Davis  | ST103      | 644626 | pending  | 2026-04-10 15:13:26 | NULL                |
| 4  | David Wilson | ST104      | 572832 | received | 2026-04-10 15:13:48 | 2026-04-10 15:14:02 |

---

## Conclusion

All experimental tests demonstrate that the Campus Parcel Secure system:
- ✅ Successfully registers parcels with images and generates OTPs
- ✅ Properly verifies student credentials and OTPs
- ✅ Correctly rejects invalid or duplicate verification attempts
- ✅ Maintains secure audit trail with timestamps
- ✅ Displays parcel images during verification for visual confirmation
- ✅ Provides clear user feedback for all operations
- ✅ Implements proper security measures throughout the workflow

**System Status**: Fully functional and production-ready with comprehensive security measures.
