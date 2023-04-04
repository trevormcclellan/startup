function login(event) {
    event.preventDefault();
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    const body = {
        email,
        password,
    };
    loginOrCreate('/api/auth/login', body);
}

function register(event) {
    event.preventDefault();
    const email = document.getElementById('email-input').value;
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('confirm-password-input').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const body = {
        email,
        username,
        password,
    };
    loginOrCreate('/api/auth/register', body);
}

async function loginOrCreate(endpoint, body) {
    const response = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    });
    const resp = await response.json();

    if (response?.status === 200) {
        localStorage.setItem('username', body.username);
        localStorage.setItem('email', body.email);
        window.location.href = '/';
    } else {
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${resp.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }
}