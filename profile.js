const userId = localStorage.getItem("user_id");

if (!userId) {
    alert("Please login first.");
    window.location.href = "login.html";
}

async function loadProfile() {
    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/users/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Unable to load profile.");
            return;
        }

        document.getElementById("name").textContent = data.name;
        document.getElementById("email").textContent = data.email;
        document.getElementById("mobile").textContent = data.mobile;

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

loadProfile();