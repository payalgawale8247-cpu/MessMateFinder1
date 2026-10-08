const paymentMessage = document.getElementById("paymentMessage");
const paymentsList = document.getElementById("paymentsList");


// Get logged-in user ID
const userId = localStorage.getItem("user_id");


// Load Payment History
async function loadPayments() {

    if (!userId) {
        paymentMessage.textContent = "Please login first.";
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/payments/user/" + userId
        );

        const payments = await response.json();

        if (!response.ok) {
            paymentMessage.textContent =
                payments.message || payments.error || "Unable to load payments.";
            return;
        }


        // No payments found
        if (payments.length === 0) {

            paymentMessage.textContent =
                "No payment history found.";

            return;
        }


        // Clear loading message
        paymentMessage.textContent = "";

        paymentsList.innerHTML = "";


        // Display payments
        payments.forEach(function (payment) {

            const paymentCard = document.createElement("div");

            paymentCard.className = "payment-card";


            const statusClass =
                payment.payment_status === "Success"
                    ? "success"
                    : "failed";


            paymentCard.innerHTML = `
                <h3>💳 Payment #${payment.payment_id}</h3>

                <p>
                    <strong>Booking ID:</strong>
                    ${payment.booking_id}
                </p>

                <p class="amount">
                    Amount: ₹${payment.amount}
                </p>

                <p>
                    <strong>Payment Method:</strong>
                    ${payment.payment_method}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="${statusClass}">
                        ${payment.payment_status}
                    </span>
                </p>

                <p>
                    <strong>Date:</strong>
                    ${payment.payment_date}
                </p>
            `;


            paymentsList.appendChild(paymentCard);

        });

    } catch (error) {

        console.error("Payment History Error:", error);

        paymentMessage.textContent =
            "Unable to connect to server.";

    }
}


// Start
loadPayments();