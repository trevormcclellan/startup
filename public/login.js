function login() {
    console.log('login');
    const email = document.getElementById('email-input').value;
    const username = document.getElementById('username-input').value;
    
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);
    
    window.location = '/index.html';
}