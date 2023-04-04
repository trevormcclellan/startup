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

async function addNewEvent(event) {
    event.preventDefault();
    const newEvent = {
        name: document.getElementById('name-input').value,
        date: document.getElementById('date-input').value,
        duration: `${document.getElementById('duration-input').value} ${document.getElementById('time-unit-select').value}`,
    };

    try {
        const response = await fetch('/api/event', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(newEvent),
        });
  
        // Store what the service gave us as the high scores
        const events = await response.json();
        localStorage.setItem('events', JSON.stringify(events));
      } catch {
        this.updateEventsLocal(newEvent);
      }
    window.location.href = 'index.html';
}

function updateEventsLocal(newEvent) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
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