document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const username = formData.get('username');
            const password = formData.get('password');
            
            // Simple hardcoded login for project simplicity
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                alert('Admin login successful!');
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('Invalid Admin credentials!');
            }
        });
    }
});
