// Profile form submission handler
const API_URL = 'http://localhost:4000/api'; // Update this with your backend URL

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                stream: formData.get('stream'),
                program: formData.get('program')
            };
            
            // Client-side validation
            if (data.password !== data.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (data.password.length < 8) {
                alert('Password must be at least 8 characters long!');
                return;
            }
            
            if (!formData.get('terms')) {
                alert('Please agree to the terms and privacy policy.');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating profile...';
            
            try {
                const response = await fetch(`${API_URL}/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Profile created successfully!');
                    // Store user data in localStorage for future use
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('userEmail', result.user.email);
                    localStorage.setItem('userName', result.user.fullName);
                    
                    // Redirect to application page
                    window.location.href = 'apply.html';
                } else {
                    alert(result.message || 'Registration failed!');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to create profile. Please check if the server is running and try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Program selection based on stream
    const streamSelect = document.getElementById('streamSelect');
    const programSelect = document.getElementById('programSelect');
    
    const programOptions = {
        'btech': [
            'Computer Science and Engineering',
            'Electronics and Communication Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Information Technology'
        ],
        'bba': [
            'General Management',
            'Marketing',
            'Finance',
            'Human Resources'
        ],
        'bsc': [
            'Physics',
            'Chemistry',
            'Mathematics',
            'Computer Science',
            'Biotechnology'
        ],
        'bca': [
            'Computer Applications',
            'Data Science',
            'Cloud Computing'
        ],
        'pharmacy': [
            'B.Pharmacy',
            'Pharm.D'
        ],
        'mtech': [
            'Computer Science and Engineering',
            'VLSI Design',
            'Power Systems',
            'Structural Engineering'
        ],
        'mba': [
            'General Management',
            'Marketing',
            'Finance',
            'Human Resources',
            'Operations Management'
        ],
        'mca': [
            'Computer Applications',
            'Software Engineering'
        ],
        'msc': [
            'Physics',
            'Chemistry',
            'Mathematics',
            'Computer Science'
        ],
        'phd': [
            'Engineering',
            'Science',
            'Management',
            'Pharmacy'
        ]
    };
    
    if (streamSelect && programSelect) {
        streamSelect.addEventListener('change', function() {
            const selectedStream = this.value;
            programSelect.innerHTML = '<option value="">-- Select Program --</option>';
            
            if (selectedStream && programOptions[selectedStream]) {
                programSelect.disabled = false;
                programOptions[selectedStream].forEach(program => {
                    const option = document.createElement('option');
                    option.value = program;
                    option.textContent = program;
                    programSelect.appendChild(option);
                });
            } else {
                programSelect.disabled = true;
                programSelect.innerHTML = '<option value="">-- First select a stream --</option>';
            }
        });
    }
});
