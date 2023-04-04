function loadEventData() {
    let params = (new URL(document.location)).searchParams;
    let code = params.get("code");
    
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let event = events.find(e => e.code === code);

    if (!event) {
        window.location.href = "join.html";
    }
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
    window.location.href = "login.html";
}

const planEvent = loadEventData();
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