import requests

# Test verification endpoint
url = 'http://127.0.0.1:5000/api/verify'
data = {
    'student_id': 'ST001',
    'otp': '434607'
}

response = requests.post(url, data=data)
print("Status Code:", response.status_code)
print("Response:")
result = response.json()
if result['success']:
    print("Success:", result['message'])
    print("Parcel ID:", result['parcel']['id'])
    print("Student Name:", result['parcel']['student_name'])
    print("Student ID:", result['parcel']['student_id'])
    print("Image data length:", len(result['parcel']['image_data']))
else:
    print("Error:", result['message'])
