async function checkAuth() {
    let authenticated = false;
    const email = localStorage.getItem('email');
    if (email) {
        const user = await getUser(email);
        authenticated = user?.authenticated;
    }

    if (authenticated) {
        getEvents();
    }
    else {
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

async function getEvents() {
    let events = [];

    try {
        const response = await fetch('/api/events')
        events = await response.json();
    } catch {
        let eventsJson = localStorage.getItem('events') || '[]';
        events = JSON.parse(eventsJson);
    }

    if (events.length === 0) {
        document.getElementById('events-header').innerHTML += `
            <div class="alert alert-info" role="alert">
                You don't have any events yet. Create one <a href="create.html">here</a>.
            </div>
        `;
    }

    for (let event of events) {
        let eventDiv = document.createElement('div');
        eventDiv.classList.add('card', 'event');
        eventDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${event.name}</h5>
                <p class="card-text">Duration: ${event.duration}</p>
                <a href="plan.html?code=${event.code}" class="btn btn-primary">Join Planning Session</a>
            </div>
            <div class="card-footer text-muted">
                Code: ${event.code}
            </div>
        `;

        document.getElementById('events').appendChild(eventDiv);
    }
}

function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("events");
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
}

checkAuth();