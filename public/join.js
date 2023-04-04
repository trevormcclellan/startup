async function checkAuth() {
    let authenticated = false;
    const email = localStorage.getItem('email');
    if (email) {
        const user = await getUser(email);
        authenticated = user?.authenticated;
    }
    
    if (!authenticated) {
        window.location = '/login.html';
    }
}

async function getUser(email) {
    // See if we have a user with the given email.
    const response = await fetch(`/api/user/${email}`);
    if (response.status === 200) {
        return response.json();
    }

    return null;
}

function checkCode(event) {
    event.preventDefault();
    const code = document.getElementById("code-input").value;
    let events = JSON.parse(localStorage.getItem('events')) || [];

    if (events.find(event => event.code === code)) {
        window.location.href = `plan.html?code=${code}`;
    }
    else {
        document.getElementById("code-input").classList.add("form-invalid");
        document.querySelector(".invalid-feedback").style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
}

checkAuth();