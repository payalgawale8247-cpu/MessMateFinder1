const form = document.getElementById("registrationForm");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !mobile || !password) {
        alert("Please fill all fields.");
        return;
    }

    const userData = {
        name: name,
        email: email,
        mobile: mobile,
        password: password
    };

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || data.error || "Registration failed");
            return;
        }

        alert("Registration successful!");

        form.reset();

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
});