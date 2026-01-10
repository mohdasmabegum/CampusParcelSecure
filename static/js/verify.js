// Handle form submission
document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const resultDiv = document.getElementById('result');
    const parcelDetailsDiv = document.getElementById('parcelDetails');
    const submitBtn = this.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    
    // Clear previous results
    parcelDetailsDiv.className = 'parcel-details';
    parcelDetailsDiv.innerHTML = '';
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.className = 'result-message success';
            resultDiv.innerHTML = `<h3>✅ ${data.message}</h3>`;
            
            // Display parcel details
            const parcel = data.parcel;
            parcelDetailsDiv.className = 'parcel-details show';
            parcelDetailsDiv.innerHTML = `
                <h3>📦 Parcel Details</h3>
                <div class="parcel-info">
                    <strong>Parcel ID:</strong> ${parcel.id}
                </div>
                <div class="parcel-info">
                    <strong>Student Name:</strong> ${parcel.student_name}
                </div>
                <div class="parcel-info">
                    <strong>Student ID:</strong> ${parcel.student_id}
                </div>
                <div class="parcel-info">
                    <strong>Registered At:</strong> ${new Date(parcel.registered_at).toLocaleString()}
                </div>
                <h4>Parcel Image:</h4>
                <img src="data:image/jpeg;base64,${parcel.image_data}" alt="Parcel Image">
                <div class="parcel-info" style="margin-top: 15px; background: #d4edda; color: #155724; font-weight: bold;">
                    ✅ Parcel successfully received and marked as delivered!
                </div>
            `;
            
            // Reset form
            this.reset();
        } else {
            resultDiv.className = 'result-message error';
            resultDiv.innerHTML = `<h3>❌ Verification Failed</h3><p>${data.message}</p>`;
        }
    } catch (error) {
        resultDiv.className = 'result-message error';
        resultDiv.innerHTML = `<h3>❌ Error</h3><p>An error occurred while verifying the parcel.</p>`;
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>✅</span> Verify & Receive Parcel';
    }
});

// Format OTP input to accept only digits
document.getElementById('otp').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});
