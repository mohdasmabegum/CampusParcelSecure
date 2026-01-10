// Preview image before upload
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Parcel Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const resultDiv = document.getElementById('result');
    const submitBtn = this.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.className = 'result-message success';
            resultDiv.innerHTML = `
                <h3>✅ ${data.message}</h3>
                <p>Parcel ID: ${data.parcel_id}</p>
                <div class="otp-display">${data.otp}</div>
                <p>Please share this OTP with the student for parcel collection.</p>
            `;
            
            // Reset form
            this.reset();
            document.getElementById('imagePreview').innerHTML = '';
        } else {
            resultDiv.className = 'result-message error';
            resultDiv.innerHTML = `<h3>❌ Error</h3><p>${data.message}</p>`;
        }
    } catch (error) {
        resultDiv.className = 'result-message error';
        resultDiv.innerHTML = `<h3>❌ Error</h3><p>An error occurred while registering the parcel.</p>`;
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>📦</span> Register Parcel';
    }
});
