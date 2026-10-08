const API_URL = "http://127.0.0.1:5000/api/messes";

let allMesses = [];

async function loadFavorites() {

    const container =
        document.getElementById("favoritesContainer");

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API error");
        }

        allMesses = await response.json();

        displayFavorites();

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p class='no-favorites'>Unable to load mess data.</p>";
    }
}


function getFavorites() {

    return JSON.parse(
        localStorage.getItem("favoriteMesses") || "[]"
    );

}


function displayFavorites() {

    const container =
        document.getElementById("favoritesContainer");

    const favoriteIds =
        getFavorites();

    const favorites =
        allMesses.filter(mess =>
            favoriteIds.includes(mess.mess_id)
        );


    container.innerHTML = "";


    if (favorites.length === 0) {

        container.innerHTML = `
            <p class="no-favorites">
                ❤️ You have no favorite messes yet.
                <br><br>
                Go to Home and add your favorite mess.
            </p>
        `;

        return;
    }


    favorites.forEach(mess => {

        container.innerHTML += `

            <div class="favorite-card">

                <h2>
                    ${mess.mess_name}
                </h2>

                <p>
                    📍 ${mess.location}
                </p>

                <p>
                    🍴 ${mess.food_type}
                </p>

                <p>
                    💰 ₹${mess.price}
                </p>

                <p class="favorite-rating">
                    ⭐ ${mess.rating}
                </p>


                <div class="favorite-buttons">

                    <button
                        class="view-btn"
                        onclick="viewDetails(${mess.mess_id})">

                        View Details

                    </button>


                    <button
                        class="remove-btn"
                        onclick="removeFavorite(${mess.mess_id})">

                        Remove ❤️

                    </button>

                </div>

            </div>

        `;
    });
}


function removeFavorite(id) {

    let favorites =
        getFavorites();


    favorites =
        favorites.filter(
            favoriteId => favoriteId !== id
        );


    localStorage.setItem(
        "favoriteMesses",
        JSON.stringify(favorites)
    );


    displayFavorites();
}


function viewDetails(id) {

    window.location.href =
        "details.html?id=" + id;
}


loadFavorites();