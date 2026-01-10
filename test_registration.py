import requests

# Test registration endpoint
url = 'http://127.0.0.1:5000/api/register'
files = {'image': open('/tmp/test_parcel.jpg', 'rb')}
data = {
    'student_name': 'John Doe',
    'student_id': 'ST001'
}

response = requests.post(url, files=files, data=data)
print("Status Code:", response.status_code)
print("Response:", response.json())
