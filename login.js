function login() {
    const email = document.getElementById('email-input').value;
    
    localStorage.setItem('email', email);
    window.location = '/index.html';
}