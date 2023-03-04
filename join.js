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