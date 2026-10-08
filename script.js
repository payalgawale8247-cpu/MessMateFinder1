const API_URL = "http://messmatefinder.onrender.com/api/messes

let allMesses = [];
let selectedFilter = "All";

function toggleAdvancedOptions() {
    const advancedOptions = document.getElementById("advancedOptions");
    if (!advancedOptions) {
        return;
    }
    if (advancedOptions.style.display === "none" || advancedOptions.style.display === "") {
        advancedOptions.style.display = "block";
    } else {
        advancedOptions.style.display = "none";
    }
}

function toggleFilterSection(sectionId, arrowId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(arrowId);
    if (!section) {
        return;
    }
    if (section.classList.contains("open")) {
        section.classList.remove("open");
        if (arrow) {
            arrow.textContent = "›";
        }
    } else {
        section.classList.add("open");
        if (arrow) {
            arrow.textContent = "⌄";
        }
    }
}

function showSelectedLocation() {
    const selectedState = localStorage.getItem("selectedState");
    const selectedDistrict = localStorage.getItem("selectedDistrict");
    const selectedLocationText = document.getElementById("selectedLocationText");

    if (selectedState && selectedDistrict && selectedLocationText) {
        selectedLocationText.textContent = "📍 " + selectedDistrict + ", " + selectedState;
    }
}

function logout() {
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

function checkLogin() {
    if (!sessionStorage.getItem("loggedIn")) {
        window.location.href = "login.html";
    }
}

function getMessImage(messId) {
    const imageMap = {
        1: "images/mess1.jpg",
        2: "images/mess2.jpg",
        3: "images/mess3.jpg",
        4: "images/mess4.jpg",
        5: "images/mess5.jpg",
        6: "images/mess6.jpg",
        7: "images/mess7.jpg",
        8: "images/mess8.jpg",
        9: "images/mess9.jpg",
        10: "images/mess10.jpg",
        11: "images/mess11.jpg"
    };

    return imageMap[messId] || "images/mess1.jpg";
}

function getFavorites() {
    return JSON.parse(localStorage.getItem("favoriteMesses") || "[]");
}

function isFavorite(id) {
    const favorites = getFavorites();
    return favorites.includes(id);
}

function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        favorites = favorites.filter(favoriteId => favoriteId !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem("favoriteMesses", JSON.stringify(favorites));
    filterMesses();
}

async function loadMesses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API error");
        }

        allMesses = await response.json();
        filterMesses();
    } catch (error) {
        const container = document.getElementById("messContainer");

        if (container) {
            container.innerHTML = "<p class='no-result'>Unable to load mess data.</p>";
        }

        console.error(error);
    }
}

function displayMesses(messes) {
    const container = document.getElementById("messContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (messes.length === 0) {
        container.innerHTML = "<p class='no-result'>No mess found.</p>";
        return;
    }

    messes.forEach(mess => {
        const image = getMessImage(mess.mess_id);
        const favorite = isFavorite(mess.mess_id);

        container.innerHTML += `
            <div class="mess-card">
                <div class="image-container">
                    <img
                        src="${image}"
                        alt="${mess.mess_name}"
                        class="mess-image"
                    >
                    <button
                        class="favorite-btn ${favorite ? "active" : ""}"
                        onclick="toggleFavorite(${mess.mess_id})"
                        title="Add to Favorites"
                    >
                        ${favorite ? "❤️" : "♡"}
                    </button>
                </div>
                <div class="mess-card-content">
                    <h2>${mess.mess_name}</h2>
                    <p>📍 ${mess.location}</p>
                    <p>🍴 ${mess.food_type}</p>
                    <p>💰 ₹${mess.price}</p>
                    <p class="rating">⭐ ${mess.rating}</p>
                    <button
                        class="details-btn"
                        onclick="viewDetails(${mess.mess_id})"
                    >
                        View Details
                    </button>
                </div>
            </div>
        `;
    });
}

function setFilter(type) {
    selectedFilter = type;
    filterMesses();
}

function filterMesses() {
    const searchBox = document.getElementById("searchBox");

    if (!searchBox) {
        return;
    }

    const search = searchBox.value.trim().toLowerCase();

    const result = allMesses.filter(mess => {
        const name = (mess.mess_name || "").trim().toLowerCase();
        const location = (mess.location || "").trim().toLowerCase();
        const food = (mess.food_type || "").trim().toLowerCase();
        const messType = (mess.mess_type || "").trim().toLowerCase();
        const price = Number(mess.price);
        const rating = Number(mess.rating);
        const distance = Number(mess.distance_km);

        const isOpen = mess.open_now === true || mess.open_now === "true";
        const homemade = mess.homemade === true || mess.homemade === "true";
        const hotelThali = mess.hotel_thali === true || mess.hotel_thali === "true";

        let searchMatch = true;

        if (search !== "") {
            if (search === "veg") {
                searchMatch = food === "veg" || food === "veg + non-veg";
            } else if (search === "non-veg" || search === "non veg") {
                searchMatch = food === "non-veg" || food === "veg + non-veg";
            } else {
                searchMatch =
                    name.includes(search) ||
                    location.includes(search) ||
                    food.includes(search) ||
                    messType.includes(search);
            }
        }

        let foodMatch = true;

        if (selectedFilter === "Veg") {
            foodMatch = food === "veg" || food === "veg + non-veg";
        } else if (selectedFilter === "Non-Veg") {
            foodMatch = food === "non-veg" || food === "veg + non-veg";
        } else if (selectedFilter === "Veg + Non-Veg") {
            foodMatch = food === "veg + non-veg";
        }

        let messTypeMatch = true;

        if (selectedFilter === "Homemade") {
            messTypeMatch = messType === "homemade" || homemade;
        } else if (selectedFilter === "Hotel Thali") {
            messTypeMatch = messType === "hotel thali" || hotelThali;
        } else if (selectedFilter === "Regular Mess") {
            messTypeMatch = messType === "regular mess";
        } else if (selectedFilter === "Tiffin Service") {
            messTypeMatch = messType === "tiffin service";
        }

        let availabilityMatch = true;

        if (selectedFilter === "Open Now") {
            availabilityMatch = isOpen;
        }

        let distanceMatch = true;

        if (selectedFilter === "1 km") {
            distanceMatch = distance <= 1;
        } else if (selectedFilter === "3 km") {
            distanceMatch = distance <= 3;
        } else if (selectedFilter === "5 km") {
            distanceMatch = distance <= 5;
        }

        let priceMatch = true;

        if (selectedFilter === "₹50 - ₹80") {
            priceMatch = price >= 50 && price <= 80;
        } else if (selectedFilter === "₹81 - ₹100") {
            priceMatch = price >= 81 && price <= 100;
        } else if (selectedFilter === "₹101 - ₹150") {
            priceMatch = price >= 101 && price <= 150;
        } else if (selectedFilter === "₹150+") {
            priceMatch = price > 150;
        }

        let ratingMatch = true;

        if (selectedFilter === "4.5+") {
            ratingMatch = rating >= 4.5;
        } else if (selectedFilter === "4.0+") {
            ratingMatch = rating >= 4.0;
        } else if (selectedFilter === "3.5+") {
            ratingMatch = rating >= 3.5;
        }

        return (
            searchMatch &&
            foodMatch &&
            messTypeMatch &&
            availabilityMatch &&
            distanceMatch &&
            priceMatch &&
            ratingMatch
        );
    });

    displayMesses(result);
}

function viewDetails(id) {
    window.location.href = "details.html?id=" + id;
}

showSelectedLocation();
checkLogin();
loadMesses();
