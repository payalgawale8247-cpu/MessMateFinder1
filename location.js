const stateSelect = document.getElementById("stateSelect");
const districtSelect = document.getElementById("districtSelect");
const areaSelect = document.getElementById("areaSelect");
const locationMessage = document.getElementById("locationMessage");
const nearbyMesses = document.getElementById("nearbyMesses");

let allMesses = [];

const locationData = {
    Maharashtra: {
        Nashik: ["College Road", "Panchavati"],
        Pune: ["Kothrud", "Shivajinagar", "Deccan"],
        Mumbai: ["Andheri West"]
    },
    Gujarat: {
        Ahmedabad: ["Navrangpura"]
    },
    Karnataka: {
        Bengaluru: ["Koramangala"]
    },
    Delhi: {
        "New Delhi": ["Laxmi Nagar"]
    },
    "Tamil Nadu": {
        Chennai: ["T. Nagar"]
    }
};

async function loadAllMesses() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/messes");

        if (!response.ok) {
            throw new Error("Failed to load mess data");
        }

        allMesses = await response.json();

        console.log("Database Messes:", allMesses);

        loadStates();
    } catch (error) {
        console.error("Location Error:", error);

        locationMessage.textContent = "⚠️ Unable to load location data.";

        nearbyMesses.innerHTML = `
            <p>⚠️ Unable to connect to database.</p>
        `;
    }
}

function getLocationData(location) {
    if (!location) {
        return {
            area: "",
            city: "",
            state: ""
        };
    }

    const parts = location
        .split(",")
        .map(part => part.trim())
        .filter(part => part !== "");

    let area = "";
    let city = "";
    let state = "";

    const knownStates = [
        "Maharashtra",
        "Gujarat",
        "Karnataka",
        "Delhi",
        "Tamil Nadu"
    ];

    const foundState = parts.find(part =>
        knownStates.some(
            knownState =>
                part.toLowerCase() === knownState.toLowerCase()
        )
    );

    if (foundState) {
        state = foundState;

        const stateIndex = parts.findIndex(
            part =>
                part.toLowerCase() === foundState.toLowerCase()
        );

        if (stateIndex > 0) {
            city = parts[stateIndex - 1];
        }

        if (stateIndex > 1) {
            area = parts[stateIndex - 2];
        }
    } else {
        if (parts.length >= 3) {
            area = parts[parts.length - 3];
            city = parts[parts.length - 2];
            state = parts[parts.length - 1];
        } else if (parts.length === 2) {
            city = parts[0];
            state = parts[1];
        } else if (parts.length === 1) {
            city = parts[0];
        }
    }

    return {
        area: area,
        city: city,
        state: state
    };
}

function getUniqueStates() {
    const states = Object.keys(locationData);
    return states.sort();
}

function loadStates() {
    stateSelect.innerHTML = `
        <option value="">Select State</option>
    `;

    const states = getUniqueStates();

    states.forEach(state => {
        const option = document.createElement("option");

        option.value = state;
        option.textContent = state;

        stateSelect.appendChild(option);
    });

    districtSelect.innerHTML = `
        <option value="">Select District</option>
    `;

    areaSelect.innerHTML = `
        <option value="">Select Area</option>
    `;

    districtSelect.disabled = true;
    areaSelect.disabled = true;

    nearbyMesses.innerHTML = "";
    locationMessage.textContent = "";
}

stateSelect.addEventListener("change", function() {
    const selectedState = stateSelect.value;

    districtSelect.innerHTML = `
        <option value="">Select District</option>
    `;

    areaSelect.innerHTML = `
        <option value="">Select Area</option>
    `;

    districtSelect.disabled = true;
    areaSelect.disabled = true;

    nearbyMesses.innerHTML = "";
    locationMessage.textContent = "";

    if (selectedState === "") {
        return;
    }

    const cities = Object.keys(locationData[selectedState] || {});

    cities.sort();

    cities.forEach(city => {
        const option = document.createElement("option");

        option.value = city;
        option.textContent = city;

        districtSelect.appendChild(option);
    });

    districtSelect.disabled = cities.length === 0;

    if (cities.length === 0) {
        locationMessage.textContent =
            "❌ No districts found for this state.";
    } else {
        locationMessage.textContent =
            "📍 Select a district.";
    }
});

districtSelect.addEventListener("change", function() {
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;

    areaSelect.innerHTML = `
        <option value="">Select Area</option>
    `;

    areaSelect.disabled = true;

    nearbyMesses.innerHTML = "";
    locationMessage.textContent = "";

    if (selectedDistrict === "") {
        return;
    }

    const areas =
        locationData[selectedState]?.[selectedDistrict] || [];

    areas.forEach(area => {
        const option = document.createElement("option");

        option.value = area;
        option.textContent = area;

        areaSelect.appendChild(option);
    });

    areaSelect.disabled = areas.length === 0;

    localStorage.setItem(
        "selectedState",
        selectedState
    );

    localStorage.setItem(
        "selectedDistrict",
        selectedDistrict
    );

    if (areas.length === 0) {
        locationMessage.textContent =
            "❌ No areas found for this district.";
    } else {
        locationMessage.textContent =
            "📍 Select an area.";
    }
});

areaSelect.addEventListener("change", function() {
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;
    const selectedArea = areaSelect.value;

    nearbyMesses.innerHTML = "";

    if (selectedArea === "") {
        locationMessage.textContent =
            "📍 Select an area to find messes.";

        return;
    }

    localStorage.setItem(
        "selectedState",
        selectedState
    );

    localStorage.setItem(
        "selectedDistrict",
        selectedDistrict
    );

    localStorage.setItem(
        "selectedArea",
        selectedArea
    );

    locationMessage.textContent =
        "📍 Location selected: " +
        selectedArea +
        ", " +
        selectedDistrict +
        ", " +
        selectedState;

    loadMesses(
        selectedDistrict,
        selectedState,
        selectedArea
    );
});

async function loadMesses(
    selectedDistrict,
    selectedState,
    selectedArea
) {
    nearbyMesses.innerHTML = `
        <p>🔍 Finding messes...</p>
    `;

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/messes"
        );

        if (!response.ok) {
            throw new Error("Failed to load mess data");
        }

        const messes = await response.json();

        const filteredMesses = messes.filter(mess => {
            const location = getLocationData(
                mess.location
            );

            return (
                location.city.toLowerCase() ===
                selectedDistrict.toLowerCase() &&
                location.state.toLowerCase() ===
                selectedState.toLowerCase() &&
                (
                    location.area.toLowerCase() ===
                    selectedArea.toLowerCase()
                )
            );
        });

        displayMesses(
            filteredMesses,
            selectedArea,
            selectedDistrict
        );
    } catch (error) {
        console.error("Location Error:", error);

        locationMessage.textContent =
            "⚠️ Unable to load messes.";

        nearbyMesses.innerHTML = `
            <p>⚠️ Unable to connect to database.</p>
        `;
    }
}

function displayMesses(
    messes,
    area,
    district
) {
    nearbyMesses.innerHTML = "";

    if (!messes || messes.length === 0) {
        nearbyMesses.innerHTML = `
            <h2>🍽️ Nearby Messes</h2>
            <p>❌ No messes found in ${area}, ${district}.</p>
        `;

        return;
    }

    const title = document.createElement("h2");

    title.textContent =
        "🍽️ Messes in " + area;

    nearbyMesses.appendChild(title);

    const list = document.createElement("div");

    list.className = "mess-results";

    messes.forEach(mess => {
        createMessCard(
            mess,
            list
        );
    });

    nearbyMesses.appendChild(list);
}

function createMessCard(
    mess,
    list
) {
    const card = document.createElement("div");

    card.className = "mess-result-card";

    card.innerHTML = `
        <h3>🍽️ ${mess.mess_name}</h3>
        <p>📍 ${mess.location || "Location not available"}</p>
        <p>🍴 Food Type: ${mess.food_type || "Not available"}</p>
        <p>💰 Price: ₹${mess.price || "0"}</p>
        <p>⭐ Rating: ${mess.rating || "No rating"}</p>
        <button class="details-btn">👁️ View Details</button>
    `;

    const detailsButton =
        card.querySelector(".details-btn");

    detailsButton.addEventListener(
        "click",
        function() {
            window.location.href =
                "details.html?id=" +
                mess.mess_id;
        }
    );

    list.appendChild(card);
}

loadAllMesses();