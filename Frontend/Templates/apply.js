const API_URL = 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please log in or create a profile to apply.');
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('applicationForm');
    
    if (form) {
        // Auto-fill user profile details
        const userName = localStorage.getItem('userName') || '';
        const userEmail = localStorage.getItem('userEmail') || '';
        const userPhone = localStorage.getItem('userPhone') || '';
        const userProgram = localStorage.getItem('userProgram') || '';

        if (userName) {
            const parts = userName.trim().split(' ');
            const fName = parts[0] || '';
            const lName = parts.slice(1).join(' ') || '';
            const fNameInput = form.querySelector('input[name="firstName"]');
            const lNameInput = form.querySelector('input[name="lastName"]');
            if (fNameInput && !fNameInput.value) fNameInput.value = fName;
            if (lNameInput && !lNameInput.value && lName) lNameInput.value = lName;
        }

        if (userEmail) {
            const emailInput = form.querySelector('input[name="email"]');
            if (emailInput && !emailInput.value) emailInput.value = userEmail;
        }
        
        if (userPhone) {
            const phoneInput = form.querySelector('input[name="phone"]');
            if (phoneInput && !phoneInput.value) phoneInput.value = userPhone;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.userId = userId;
            
            // Check confirmation box
            if (!data.confirm) {
                alert('Please confirm that the information provided is accurate.');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                const response = await fetch(`${API_URL}/applications/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Application submitted successfully!');
                    window.location.href = 'Sdash.html';
                } else {
                    alert(result.message || 'Application submission failed!');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to submit application. Please try again later.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
