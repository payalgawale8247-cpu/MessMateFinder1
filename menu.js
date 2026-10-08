const params = new URLSearchParams(window.location.search);
const messId = params.get("id") || params.get("mess_id");

const messName = document.getElementById("messName");
const messLocation = document.getElementById("messLocation");
const menuContainer = document.getElementById("menuContainer");

async function loadMessDetails() {
    if (!messId) {
        messName.innerText = "Mess not found";
        messLocation.innerText = "";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/messes/" + messId);

        if (!response.ok) {
            throw new Error("Unable to load mess details");
        }

        const mess = await response.json();
        messName.innerText = mess.mess_name;
        messLocation.innerText = "📍 " + mess.location;
    } catch (error) {
        console.error("Mess Details Error:", error);
        messName.innerText = "Unable to load mess details";
    }
}

async function loadMenu() {
    if (!messId) {
        menuContainer.innerHTML = "<p>Mess information not available.</p>";
        return;
    }

    try {
        const dailyResponse = await fetch("http://127.0.0.1:5000/api/menu/" + messId);
        const dailyMenu = await dailyResponse.json();

        const weeklyResponse = await fetch("http://127.0.0.1:5000/api/menu/weekly/" + messId);
        const weeklyMenu = await weeklyResponse.json();

        let html = "";

        if (dailyResponse.ok) {
            html += `
                <h2>📅 Today's Menu</h2>
                <div class="menu-card">
                    <h3>🌅 Breakfast</h3>
                    <p>${dailyMenu.breakfast}</p>
                </div>
                <div class="menu-card">
                    <h3>☀️ Lunch</h3>
                    <p>${dailyMenu.lunch}</p>
                </div>
                <div class="menu-card">
                    <h3>🌙 Dinner</h3>
                    <p>${dailyMenu.dinner}</p>
                </div>
            `;
        } else {
            html += "<p>Today's menu is not available.</p>";
        }

        if (weeklyResponse.ok && Array.isArray(weeklyMenu)) {
            html += `
                <h2>📆 Weekly Menu</h2>
                <div class="weekly-menu">
            `;

            weeklyMenu.forEach(function(menu) {
                html += `
                    <div class="menu-card">
                        <h3>📅 ${menu.day}</h3>
                        <p><strong>🌅 Breakfast:</strong> ${menu.breakfast}</p>
                        <p><strong>☀️ Lunch:</strong> ${menu.lunch}</p>
                        <p><strong>🌙 Dinner:</strong> ${menu.dinner}</p>
                    </div>
                `;
            });

            html += "</div>";
        } else {
            html += "<p>Weekly menu is not available.</p>";
        }

        menuContainer.innerHTML = html;
    } catch (error) {
        console.error("Menu Error:", error);
        menuContainer.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

function goBack() {
    window.history.back();
}

loadMessDetails();
loadMenu();