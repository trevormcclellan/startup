async function checkAuth() {
    let authenticated = false;
    const email = localStorage.getItem('email');
    if (email) {
        currUser = await getUser(email);
        authenticated = currUser?.authenticated;
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

        configureWebSocket(event.code)

        return event;
    }
    else {
        window.location.href = "join.html";
    }
}

function renderUsersOnline() {
    const usersOnlineList = document.getElementById("users-online");
    usersOnlineList.innerHTML = "";
    usersOnline.forEach(user => {
        usersOnlineList.innerHTML += `<li class="list-group-item">${user.username}</li>`;
    })
}

function configureWebSocket(code) {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    socket = new WebSocket(`${protocol}://${window.location.host}/ws/${code}`);
    socket.onopen = (event) => {
        addUserOnline(currUser)
        broadcastEvent("connected", currUser)
    };
    socket.onclose = (event) => {
        console.log("disconnected")
    };
    socket.onmessage = async (event) => {
        const msg = JSON.parse(await event.data.text());
        if (msg.type === "connected") {
            addUserOnline(msg.value)
            broadcastEvent("users", JSON.stringify(usersOnline))
        }
        if (msg.type === "disconnected") {
            usersOnline = usersOnline.filter(user => user.email !== msg.value.email)
            renderUsersOnline()
        }
        if (msg.type === "users") {
            let onlineUsers = JSON.parse(msg.value)
            usersOnline = onlineUsers
            renderUsersOnline()
        }
        if (msg.type === "click") {
            updateTable(msg.value.planEvent, document.querySelector('tbody').rows, msg.value.i, true)
        }
    };
}

function broadcastEvent(type, value) {
    const event = {
        type: type,
        value: value,
    };
    socket.send(JSON.stringify(event));
}

function addUserOnline(user) {
    let userExists = usersOnline.find(userToFind => userToFind.email === user.email)
    let username = user.username
    if (username && !userExists) {
        usersOnline.push(user)
        renderUsersOnline()
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

function updateTable(planEvent, rows, i, fromOther=false) {
        if (!fromOther) {
            broadcastEvent("click", { planEvent, i })
        }
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
                    let newSelection = `${rows[i].cells[0].innerText} - ${rows[i + j + 1].cells[0].innerText}`
                    updateCurrentSelection(newSelection, danger);
                }
            }
        }

        else {
            rows[i].classList.toggle('table-active');

            if (!rows[i].classList.contains('table-success')) {
                rows[i].classList.add('table-danger');
                danger = true;
            }
            let newSelection = `${rows[i].cells[0].innerText}`
            updateCurrentSelection(newSelection, danger);
        }
}

async function startPlanning() {
    const planEvent = await loadEventData();

    let rows = document.querySelector('tbody').rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].onclick = function () {
            updateTable(planEvent, rows, i)
        }
    }
}

let currUser = {}
let usersOnline = []
let socket;
window.onbeforeunload = function () {
    broadcastEvent("disconnected", currUser)
    socket.close();
}

checkAuth();
