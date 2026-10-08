const bookingIdElement = document.getElementById("bookingId");
const messNameElement = document.getElementById("messName");
const amountElement = document.getElementById("amount");

const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");


// Get Booking ID from URL
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get("booking_id");


// Load Booking Details
async function loadBookingDetails() {

    if (!bookingId) {
        bookingIdElement.textContent = "Not available";
        messNameElement.textContent = "Not available";
        amountElement.textContent = "0";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/bookings/" + bookingId
        );

        const data = await response.json();

        if (!response.ok) {
            bookingIdElement.textContent = bookingId;
            messNameElement.textContent = "Unable to load";
            amountElement.textContent = "0";
            return;
        }

        bookingIdElement.textContent = data.booking_id;
        messNameElement.textContent = data.mess_name;
        amountElement.textContent = data.amount;

    } catch (error) {

        console.error(error);

        bookingIdElement.textContent = bookingId;
        messNameElement.textContent = "Unable to connect";
        amountElement.textContent = "0";
    }
}


// Payment Submit
paymentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const selectedMethod = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    if (!selectedMethod) {
        paymentMessage.textContent =
            "Please select a payment method.";
        return;
    }

    const paymentMethod = selectedMethod.value;

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        paymentMessage.textContent =
            "Please login first.";
        return;
    }

    const amount = Number(amountElement.textContent);

    if (!bookingId || !amount) {
        paymentMessage.textContent =
            "Booking details are missing.";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/payments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    booking_id: Number(bookingId),
                    user_id: Number(userId),
                    amount: amount,
                    payment_method: paymentMethod
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            paymentMessage.textContent =
                data.message || data.error || "Payment failed.";
            return;
        }

        paymentMessage.textContent =
            "Payment successful! ✅";

        console.log("Payment ID:", data.payment_id);

    } catch (error) {

        console.error(error);

        paymentMessage.textContent =
            "Unable to connect to server.";
    }
});


// Start
loadBookingDetails();