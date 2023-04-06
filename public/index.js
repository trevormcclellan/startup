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

    events.sort((a, b) => {
        if (a.acceptedTime && !b.acceptedTime) {
            return 1;
        }
        if (!a.acceptedTime && b.acceptedTime) {
            return -1;
        }
        return new Date(a.date) - new Date(b.date);
    })

    for (let event of events) {
        let eventDiv = document.createElement('div');
        eventDiv.classList.add('card', 'event');
        eventDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${event.name}</h5>
                <p class="mb-0">Duration: ${event.duration}</p>
                <p class="mb-0">Date: ${new Date(event.date).toLocaleDateString()}</p>
                ${event.acceptedTime ? `<p class="mb-0">Planned Time: ${event.acceptedTime}</p>` : ""}
                <a href="plan.html?code=${event.code}" class="mt-3 btn btn-primary">${event.acceptedTime ? "View Planned Event" : "Join Planning Session"}</a>
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