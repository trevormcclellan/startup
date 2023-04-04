async function checkAuth() {
    let authenticated = false;
    const email = localStorage.getItem('email');
    if (email) {
        const user = await getUser(email);
        authenticated = user?.authenticated;
    }
    
    if (authenticated) {
        startPlanning();
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

async function loadEventData() {
    let params = (new URL(document.location)).searchParams;
    let code = params.get("code");
    

    let response = await fetch(`/api/event/${code}`)
    if (response.status === 200) {
        const event = await response.json();
        const eventTitle = document.getElementById("event-name");
        eventTitle.innerText = event.name;
        const eventDate = document.getElementById("event-date");
        eventDate.innerText = `Date: ${new Date(event.date).toLocaleDateString()}`;
        const eventDuration = document.getElementById("event-duration");
        eventDuration.innerText = `Duration: ${event.duration}`;
        const eventCode = document.getElementById("event-code");
        eventCode.innerText = `Code: ${event.code}`;

        return event;
    }
    else {
        window.location.href = "join.html";
    }
}

function addUserOnline() {
    let user = localStorage.getItem("username");
    const usersOnline = document.getElementById("users-online");
    if (user) {
        usersOnline.innerHTML += `<li class="list-group-item">${user}</li>`;
    }
}

function updateCurrentSelection(newSelection, danger) {
    const currentSelection = document.getElementById("selection-time");
    currentSelection.innerText = newSelection;

    if (danger) {
        currentSelection.classList.add("text-danger");
    } 
    else {
        currentSelection.classList.remove("text-danger");
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

async function startPlanning() {
    const planEvent = await loadEventData();
    addUserOnline();
    
    let rows = document.querySelector('tbody').rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].onclick = function () {
            let duration = planEvent.duration.split(" ")
            let danger = false
    
            for (let j = 0; j < rows.length; j++) {
                rows[j].classList.remove('table-active');
                rows[j].classList.remove('table-danger');
            }
    
            if (duration[1] === "hours") {
                for (let j = 0; j < duration[0]; j++) {
                    rows[i + j].classList.toggle('table-active');
    
                    if (!rows[i + j].classList.contains('table-success')) {
                        rows[i + j].classList.add('table-danger');
                        danger = true;
                    }
    
                    if (j === duration[0] - 1) {
                        updateCurrentSelection(`${rows[i].cells[0].innerText} - ${rows[i + j + 1].cells[0].innerText}`, danger);
                    }
                }
            } 
    
            else {
                rows[i].classList.toggle('table-active');
    
                if (!rows[i].classList.contains('table-success')) {
                    rows[i].classList.add('table-danger');
                    danger = true;
                }
    
                updateCurrentSelection(`${rows[i].cells[0].innerText}`, danger);
            }
        };
    }
}

checkAuth();
