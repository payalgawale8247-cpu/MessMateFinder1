const id = new URLSearchParams(window.location.search).get("id");

const messName = document.getElementById("messName");
const locationElement = document.getElementById("location");
const foodType = document.getElementById("foodType");
const price = document.getElementById("price");
const rating = document.getElementById("rating");
const description = document.getElementById("description");
const openingTime = document.getElementById("openingTime");
const closingTime = document.getElementById("closingTime");
const writeReviewBtn = document.getElementById("writeReviewBtn");

async function loadMessDetails() {
    if (!id) {
        messName.innerText = "Mess not found";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/api/messes/" + id);

        if (!response.ok) {
            throw new Error("Unable to fetch mess details");
        }

        const mess = await response.json();

        if (mess.error) {
            messName.innerText = "Mess not found";
            return;
        }

        messName.innerText = mess.mess_name;
        locationElement.textContent = mess.location;
        foodType.textContent = mess.food_type;
        price.textContent = mess.price;
        rating.textContent = mess.rating;
        description.textContent = mess.description || "No description available";
        openingTime.textContent = mess.opening_time || "Not available";
        closingTime.textContent = mess.closing_time || "Not available";

        if (writeReviewBtn) {
            writeReviewBtn.href = "reviews.html?id=" + id;
        }
    } catch (error) {
        console.error("Mess Details Error:", error);
        messName.innerText = "Unable to load mess details";
    }
}

function goBack() {
    window.location.href = "index.html";
}

function bookMess() {
    window.location.href = "booking.html?id=" + id;
}

function openMenu() {
    if (!id) {
        alert("Mess information not available.");
        return;
    }

    window.location.href = "menu.html?id=" + id;
}

loadMessDetails();