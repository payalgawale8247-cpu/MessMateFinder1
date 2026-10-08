const reviewForm = document.getElementById("reviewForm");
const ratingInput = document.getElementById("rating");
const reviewTextInput = document.getElementById("reviewText");
const message = document.getElementById("message");
const reviewsContainer = document.getElementById("reviewsContainer");
const messName = document.getElementById("messName");

const userId = localStorage.getItem("user_id");

// Get Mess ID from URL
const urlParams = new URLSearchParams(window.location.search);
const messId = urlParams.get("id");


// Load selected mess details
async function loadMessDetails() {

    if (!messId) {
        messName.textContent = "Mess not selected.";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/messes/" + messId
        );

        const data = await response.json();

        if (!response.ok) {
            messName.textContent = "Unable to load mess details.";
            return;
        }

        messName.textContent =
            "🍴 " + data.mess_name;

    } catch (error) {

        console.error(error);

        messName.textContent =
            "Unable to connect to server.";
    }
}


// Submit Review
reviewForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!userId) {
        message.textContent =
            "Please login to submit a review.";
        return;
    }

    if (!messId) {
        message.textContent =
            "Mess not selected.";
        return;
    }

    const rating = ratingInput.value;
    const reviewText = reviewTextInput.value.trim();

    if (!rating || !reviewText) {
        message.textContent =
            "Please fill all fields.";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/reviews",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: Number(userId),
                    mess_id: Number(messId),
                    rating: Number(rating),
                    review_text: reviewText
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message ||
                data.error ||
                "Unable to add review.";

            return;
        }

        message.textContent =
            "Review added successfully! ⭐";

        reviewForm.reset();

        loadReviews(messId);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";
    }
});


// Load Reviews
async function loadReviews(messId) {

    if (!messId) {
        return;
    }

    reviewsContainer.innerHTML =
        '<p class="loading">Loading reviews...</p>';

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/reviews/" + messId
        );

        const data = await response.json();

        if (!response.ok) {

            reviewsContainer.innerHTML =
                '<p class="no-reviews">Unable to load reviews.</p>';

            return;
        }

        if (data.length === 0) {

            reviewsContainer.innerHTML =
                '<p class="no-reviews">No reviews available.</p>';

            return;
        }

        reviewsContainer.innerHTML = "";

        data.forEach(function (review) {

            const card = document.createElement("div");

            card.className = "review-card";

            const stars =
                "⭐".repeat(review.rating);

            card.innerHTML = `
                <h3>👤 ${review.user_name}</h3>

                <p class="review-rating">
                    ${stars}
                </p>

                <p class="review-text">
                    ${review.review_text}
                </p>

                <p class="review-date">
                    ${review.created_at}
                </p>
            `;

            reviewsContainer.appendChild(card);
        });

    } catch (error) {

        console.error(error);

        reviewsContainer.innerHTML =
            '<p class="no-reviews">Unable to connect to server.</p>';
    }
}


// Start
loadMessDetails();
loadReviews(messId);