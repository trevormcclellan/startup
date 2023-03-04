function addNewEvent(event) {
    event.preventDefault();
    // Generate 6 digit alphanumeric ID
    const id = generateId();
    console.log(id);
    const newEvent = {
        name: document.getElementById('name-input').value,
        date: document.getElementById('date-input').value,
        code: id,
        duration: `${document.getElementById('duration-input').value} ${document.getElementById('time-unit-select').value}`,
    };

    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    window.location.href = 'index.html';
}

function generateId() {
    let id = Math.random().toString(36).substr(2, 6).toUpperCase();
    let events = JSON.parse(localStorage.getItem('events')) || [];
    if (events.find(event => event.code === id)) {
        generateId();
    } else {
        return id;
    }
}

function logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}