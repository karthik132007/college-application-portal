const API_URL = 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Login successful!');
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('userEmail', result.user.email);
                    localStorage.setItem('userName', result.user.fullName);
                    localStorage.setItem('userProgram', result.user.program);
                    localStorage.setItem('userRole', result.user.role);
                    
                    if (result.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'Sdash.html';
                    }
                } else {
                    alert(result.message || 'Login failed!');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to log in. Please check if the server is running and try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
