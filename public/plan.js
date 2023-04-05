async function checkAuth() {
    let authenticated = false;
    const email = localStorage.getItem('email');
    if (email) {
        currUser = await getUser(email);
        authenticated = currUser?.authenticated;
    }

    if (authenticated) {
        startPlanning();
        startApp();
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
            broadcastEvent("availability", { myBusyTimes: busyTimes })
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
        if (msg.type === "availability") {
            busyTimes.push(...msg.value.myBusyTimes)
            updateAvailability()
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

function updateTable(planEvent, rows, i, fromOther = false) {
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
    planEvent = await loadEventData();
    let rows = document.querySelector('tbody').rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].onclick = function () {
            updateTable(planEvent, rows, i)
        }
    }
}

function updateAvailability() {
    let start = new Date(planEvent.date)
    start.setHours(6)
    let startString = start.toISOString()
    let rows = document.querySelector('tbody').rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove('table-success');
    }
    for (let i = 6; i < 21; i++) {
        let currStart = new Date(startString)
        let currEnd = new Date(startString)
        currStart.setHours(i)
        currEnd.setHours(i + 1)
        let busy = false
        for (let j = 0; j < busyTimes.length; j++) {
            let busyStart = new Date(busyTimes[j].start)
            let busyEnd = new Date(busyTimes[j].end)
            if (busyStart <= currStart && busyEnd >= currEnd) {
                busy = true
            }
        }
        if (!busy) {
            rows[i - 6].classList.add('table-success')
        }
    }
}

var googleUser = {};
var startApp = function () {
    gapi.load('auth2', function () {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id: '540697024878-ubdgjp1bn93n9t3gddqj5698bqkoefld.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            scope: 'https://www.googleapis.com/auth/calendar.readonly'
        });
        attachSignin(document.getElementById('import'));
    });
};

function attachSignin(element) {
    auth2.attachClickHandler(element, {},
        function (googleUser) {
            let token = googleUser.getAuthResponse().access_token;
            let start = new Date(planEvent.date)
            start.setHours(6)
            let end = new Date(planEvent.date)
            end.setHours(21)
            let startString = start.toISOString()
            let endString = end.toISOString()
            fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "timeMin": startString,
                    "timeMax": endString,
                    "items": [
                        {
                            "id": "primary"
                        }
                    ]
                })
            }).then(response => response.json())
                .then(data => {
                    let myBusyTimes = data.calendars.primary.busy
                    busyTimes.push(...myBusyTimes)
                    broadcastEvent("availability", { myBusyTimes })
                    updateAvailability()
                })
            googleUser.getBasicProfile().getName();
        }, function (error) {
            alert(JSON.stringify(error, undefined, 2));
        });
}

let busyTimes = []
let planEvent = {}
let currUser = {}
let usersOnline = []
let socket;
window.onbeforeunload = function () {
    broadcastEvent("disconnected", currUser)
    socket.close();
}

checkAuth();
