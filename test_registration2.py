import requests

# Test registration endpoint for second parcel
url = 'http://127.0.0.1:5000/api/register'
files = {'image': open('/tmp/test_parcel.jpg', 'rb')}
data = {
    'student_name': 'Jane Smith',
    'student_id': 'ST002'
}

response = requests.post(url, files=files, data=data)
print("Status Code:", response.status_code)
result = response.json()
print("Response:", result)
if result['success']:
    print("\n=== OTP for ST002:", result['otp'], "===")
