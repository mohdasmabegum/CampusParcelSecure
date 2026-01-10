import requests

# Test verification with wrong OTP
url = 'http://127.0.0.1:5000/api/verify'
data = {
    'student_id': 'ST002',
    'otp': '123456'  # Wrong OTP
}

response = requests.post(url, data=data)
print("Status Code:", response.status_code)
print("Response:", response.json())
