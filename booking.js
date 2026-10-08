const API_URL = https://messmatefinder.onrender.com/api/messes/;
const messId = new URLSearchParams(window.location.search).get("id");

const bookingForm = document.getElementById("bookingForm");
const confirmationPopup = document.getElementById("confirmationPopup");
const backButton = document.getElementById("backButton");
const confirmButton = document.getElementById("confirmButton");

const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const mealInput = document.getElementById("meal");
const bookingDateInput = document.getElementById("bookingDate");
const bookingTimeInput = document.getElementById("bookingTime");
const peopleInput = document.getElementById("people");

let bookingData = null;

const today = new Date().toISOString().split("T")[0];
bookingDateInput.min = today;

bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const meal = mealInput.value;
    const bookingDate = bookingDateInput.value;
    const bookingTime = bookingTimeInput.value;
    const people = parseInt(peopleInput.value);

    if (!messId) {
        alert("Mess information not available.");
        return;
    }

    if (name.length < 3) {
        alert("Please enter a valid full name.");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    if (!meal) {
        alert("Please select a meal.");
        return;
    }

    if (!bookingDate || !bookingTime) {
        alert("Please select booking date and time.");
        return;
    }

    if (people < 1) {
        alert("Number of people must be at least 1.");
        return;
    }

    const selectedDateTime = new Date(
        bookingDate + "T" + bookingTime
    );

    if (selectedDateTime < new Date()) {
        alert("Please select a future date and time.");
        return;
    }

    bookingData = {
        mess_id: parseInt(messId),
        name: name,
        mobile: mobile,
        meal: meal,
        booking_date: bookingDate,
        booking_time: bookingTime,
        people: people
    };

    confirmationPopup.style.display = "flex";
});

backButton.addEventListener("click", function() {
    confirmationPopup.style.display = "none";
});

confirmButton.addEventListener("click", async function() {
    if (!bookingData) {
        alert("Booking information is missing.");
        return;
    }

    confirmButton.disabled = true;
    confirmButton.textContent = "Processing...";

    try {
        const response = await fetch(API_URL + "/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Booking failed.");
        }

        if (result.booking_id) {
            localStorage.setItem(
                "booking_id",
                result.booking_id
            );
        }

        localStorage.setItem(
            "bookingData",
            JSON.stringify(result)
        );

        alert("Booking confirmed successfully!");

        window.location.href =
            "payment.html?booking_id=" +
            (result.booking_id || "");

    } catch (error) {
        console.error("Booking Error:", error);
        alert(error.message || "Unable to confirm booking.");
        confirmButton.disabled = false;
        confirmButton.textContent = "Confirm";
    }
});
