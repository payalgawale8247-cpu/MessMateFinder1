/* ============================= */
/* GET ELEMENTS */
/* ============================= */

const bookingsContainer =
    document.getElementById("bookingsContainer");

const userId =
    localStorage.getItem("user_id");



/* ============================= */
/* GET BOOKING DATE & TIME */
/* ============================= */

function getBookingDateTime(booking) {

    if (
        !booking.booking_date ||
        !booking.booking_time ||
        booking.booking_time === "None"
    ) {
        return null;
    }

    try {

        const bookingDateTime =
            new Date(
                booking.booking_date +
                "T" +
                booking.booking_time
            );

        if (isNaN(bookingDateTime.getTime())) {

            return null;
        }

        return bookingDateTime;

    } catch (error) {

        console.error(
            "Booking Date Time Error:",
            error
        );

        return null;
    }
}



/* ============================= */
/* GET CANCELLATION DEADLINE */
/* ============================= */

function getCancellationDeadline(booking) {

    const bookingDateTime =
        getBookingDateTime(booking);

    if (!bookingDateTime) {

        return null;
    }

    return new Date(
        bookingDateTime.getTime() +
        (30 * 60 * 1000)
    );
}



/* ============================= */
/* CHECK CANCELLATION TIME */
/* ============================= */

function canCancelBooking(booking) {

    const cancellationDeadline =
        getCancellationDeadline(booking);

    if (!cancellationDeadline) {

        return false;
    }

    const currentTime =
        new Date();

    return currentTime <= cancellationDeadline;
}



/* ============================= */
/* FORMAT TIME */
/* ============================= */

function formatTime(date) {

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}



/* ============================= */
/* LOAD BOOKINGS */
/* ============================= */

async function loadBookings() {

    if (!userId) {

        bookingsContainer.innerHTML =
            '<p class="no-bookings">' +
            'Please login to view your bookings.' +
            '</p>';

        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/bookings/user/" +
                userId
            );


        const data =
            await response.json();


        if (!response.ok) {

            bookingsContainer.innerHTML =
                '<p class="no-bookings">' +
                'Unable to load bookings.' +
                '</p>';

            return;
        }


        if (data.length === 0) {

            bookingsContainer.innerHTML =
                '<p class="no-bookings">' +
                'No bookings found.' +
                '</p>';

            return;
        }


        bookingsContainer.innerHTML = "";


        data.forEach(function (booking) {

            const card =
                document.createElement("div");


            card.className =
                "booking-card";


            let cancelButton = "";

            let refundBox = "";

            let cancellationInfo = "";



            /* ============================= */
            /* CANCELLATION SECTION */
            /* ============================= */

            if (booking.status === "Confirmed") {

                const deadline =
                    getCancellationDeadline(booking);


                /* ============================= */
                /* VALID DEADLINE */
                /* ============================= */

                if (deadline) {

                    const canCancel =
                        canCancelBooking(booking);


                    /* ============================= */
                    /* CANCELLATION DEADLINE */
                    /* ============================= */

                    if (canCancel) {

                        cancellationInfo = `
                            <p class="cancellation-info">
                                ⏰ Cancellation allowed until
                                <strong>
                                    ${formatTime(deadline)}
                                </strong>
                            </p>
                        `;

                    } else {

                        cancellationInfo = `
                            <p class="cancellation-expired">
                                ❌ Cancellation time expired
                                <br>
                                <strong>
                                    Cancellation was allowed until
                                    ${formatTime(deadline)}
                                </strong>
                            </p>
                        `;
                    }



                    /* ============================= */
                    /* CANCEL BUTTON */
                    /* ============================= */

                    /*
                     * Button is shown even after
                     * cancellation time expires.
                     *
                     * The click function will check
                     * whether cancellation is allowed.
                     */

                    cancelButton = `
                        <button
                            class="cancel-btn"
                            onclick="handleCancelClick(
                                ${booking.booking_id}
                            )">

                            ❌ Cancel Booking

                        </button>
                    `;

                } else {

                    cancellationInfo = `
                        <p class="cancellation-expired">
                            ⚠️ Cancellation time unavailable
                        </p>
                    `;


                    cancelButton = `
                        <button
                            class="cancel-btn"
                            onclick="handleCancelClick(
                                ${booking.booking_id}
                            )">

                            ❌ Cancel Booking

                        </button>
                    `;
                }
            }



            /* ============================= */
            /* REFUND SECTION */
            /* ============================= */

            if (booking.status === "Cancelled") {

                refundBox = `
                    <div class="refund-box">

                        <h3>💰 Refund Status</h3>

                        <div class="refund-line completed">
                            ● Payment Successful
                        </div>

                        <div class="refund-arrow">
                            ↓
                        </div>

                        <div class="refund-line completed">
                            ● Booking Cancelled
                        </div>

                        <div class="refund-arrow">
                            ↓
                        </div>

                        <div
                            class="refund-line pending"
                            id="refund-status-${booking.booking_id}">

                            ⏳ Checking Refund Status...

                        </div>

                        <p
                            class="refund-amount"
                            id="refund-amount-${booking.booking_id}">
                        </p>

                        <div
                            class="refund-message"
                            id="refund-message-${booking.booking_id}"
                            style="display: none;">

                            ✅ Refund processed successfully.

                        </div>

                    </div>
                `;
            }



            /* ============================= */
            /* BOOKING TIME */
            /* ============================= */

            const bookingTime =
                booking.booking_time &&
                booking.booking_time !== "None"

                    ? booking.booking_time

                    : "Not specified";



            /* ============================= */
            /* BOOKING DETAILS */
            /* ============================= */

            card.innerHTML = `

                <h2>
                    🍴 ${booking.mess_name}
                </h2>

                <p>
                    📍 Location:
                    ${booking.location}
                </p>

                <p>
                    🍽️ Meal:
                    ${booking.meal}
                </p>

                <p>
                    👥 People:
                    ${booking.people}
                </p>

                <p>
                    💰 Amount:
                    ₹${booking.amount}
                </p>

                <p>
                    📅 Booking Date:
                    ${booking.booking_date}
                </p>

                <p>
                    🕐 Booking Time:
                    ${bookingTime}
                </p>

                <p class="status">

                    ${
                        booking.status === "Confirmed"
                            ? "✅"
                            : "❌"
                    }

                    Status:
                    ${booking.status}

                </p>

                ${cancellationInfo}

                ${refundBox}

                ${cancelButton}

            `;


            bookingsContainer.appendChild(card);



            /* ============================= */
            /* LOAD REFUND STATUS */
            /* ============================= */

            if (booking.status === "Cancelled") {

                loadRefundStatus(
                    booking.booking_id
                );
            }

        });

    } catch (error) {

        console.error(
            "Booking Error:",
            error
        );

        bookingsContainer.innerHTML =
            '<p class="no-bookings">' +
            'Unable to connect to server.' +
            '</p>';
    }
}



/* ============================= */
/* HANDLE CANCEL BUTTON CLICK */
/* ============================= */

async function handleCancelClick(bookingId) {

    try {

        /* ============================= */
        /* GET CURRENT BOOKING */
        /* ============================= */

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/bookings/user/" +
                userId
            );


        const bookings =
            await response.json();


        if (!response.ok) {

            alert(
                "Unable to check booking details."
            );

            return;
        }


        const booking =
            bookings.find(
                function (item) {

                    return Number(item.booking_id) ===
                        Number(bookingId);
                }
            );


        if (!booking) {

            alert(
                "Booking not found."
            );

            return;
        }



        /* ============================= */
        /* CHECK BOOKING STATUS */
        /* ============================= */

        if (booking.status !== "Confirmed") {

            alert(
                "This booking is already cancelled."
            );

            loadBookings();

            return;
        }



        /* ============================= */
        /* GET DEADLINE */
        /* ============================= */

        const deadline =
            getCancellationDeadline(booking);


        if (!deadline) {

            showExpiredPopup(
                "Cancellation time is unavailable."
            );

            return;
        }



        /* ============================= */
        /* CHECK CANCELLATION TIME */
        /* ============================= */

        if (!canCancelBooking(booking)) {

            showExpiredPopup(
                "Cancellation was allowed until " +
                formatTime(deadline) +
                "."
            );

            return;
        }



        /* ============================= */
        /* SHOW CONFIRMATION POPUP */
        /* ============================= */

        cancelBooking(bookingId);

    } catch (error) {

        console.error(
            "Cancel Check Error:",
            error
        );

        alert(
            "Unable to check cancellation time."
        );
    }
}



/* ============================= */
/* EXPIRED CANCELLATION POPUP */
/* ============================= */

function showExpiredPopup(message) {

    const oldModal =
        document.getElementById(
            "expiredCancelModal"
        );


    if (oldModal) {

        oldModal.remove();
    }



    const modal =
        document.createElement("div");


    modal.id =
        "expiredCancelModal";



    modal.innerHTML = `

        <div class="cancel-modal-overlay">

            <div class="cancel-modal">

                <button
                    class="close-modal"
                    onclick="closeExpiredPopup()">

                    ×

                </button>


                <div class="cancel-icon">

                    ❌

                </div>


                <h2>
                    Cancellation Time Expired
                </h2>


                <p>
                    This booking can no longer
                    be cancelled.
                </p>


                <p>
                    ${message}
                </p>


                <div class="cancel-modal-buttons">

                    <button
                        class="keep-booking-btn"
                        onclick="closeExpiredPopup()">

                        OK

                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}



/* ============================= */
/* CLOSE EXPIRED POPUP */
/* ============================= */

function closeExpiredPopup() {

    const modal =
        document.getElementById(
            "expiredCancelModal"
        );


    if (modal) {

        modal.remove();
    }
}



/* ============================= */
/* LOAD REFUND STATUS */
/* ============================= */

async function loadRefundStatus(bookingId) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/refund/" +
                bookingId
            );


        const data =
            await response.json();


        const statusElement =
            document.getElementById(
                "refund-status-" +
                bookingId
            );


        const amountElement =
            document.getElementById(
                "refund-amount-" +
                bookingId
            );


        const messageElement =
            document.getElementById(
                "refund-message-" +
                bookingId
            );



        /* ============================= */
        /* REFUND INFORMATION UNAVAILABLE */
        /* ============================= */

        if (!response.ok) {

            if (statusElement) {

                statusElement.innerHTML =
                    "⚠️ Refund information unavailable";

                statusElement.className =
                    "refund-line pending";
            }


            if (messageElement) {

                messageElement.style.display =
                    "none";
            }

            return;
        }



        /* ============================= */
        /* REFUND PENDING */
        /* ============================= */

        if (
            data.payment_status ===
            "Refund Pending"
        ) {

            if (statusElement) {

                statusElement.innerHTML =
                    "⏳ Refund Pending";

                statusElement.className =
                    "refund-line pending";
            }


            if (messageElement) {

                messageElement.style.display =
                    "none";
            }
        }



        /* ============================= */
        /* REFUND COMPLETED */
        /* ============================= */

        else if (
            data.payment_status ===
            "Refunded"
        ) {

            if (statusElement) {

                statusElement.innerHTML =
                    "✅ Refund Completed";

                statusElement.className =
                    "refund-line completed";
            }


            if (messageElement) {

                messageElement.style.display =
                    "block";
            }
        }



        /* ============================= */
        /* OTHER PAYMENT STATUS */
        /* ============================= */

        else {

            if (statusElement) {

                statusElement.innerHTML =
                    "ℹ️ " +
                    data.payment_status;

                statusElement.className =
                    "refund-line pending";
            }


            if (messageElement) {

                messageElement.style.display =
                    "none";
            }
        }



        /* ============================= */
        /* REFUND AMOUNT */
        /* ============================= */

        if (amountElement) {

            amountElement.innerHTML =
                "Refund Amount: ₹" +
                data.amount;
        }

    } catch (error) {

        console.error(
            "Refund Status Error:",
            error
        );


        const statusElement =
            document.getElementById(
                "refund-status-" +
                bookingId
            );


        if (statusElement) {

            statusElement.innerHTML =
                "⚠️ Unable to load refund status";

            statusElement.className =
                "refund-line pending";
        }
    }
}



/* ============================= */
/* CANCEL BOOKING POPUP */
/* ============================= */

function cancelBooking(bookingId) {

    const oldModal =
        document.getElementById(
            "cancelModal"
        );


    if (oldModal) {

        oldModal.remove();
    }



    const modal =
        document.createElement("div");


    modal.id =
        "cancelModal";



    modal.innerHTML = `

        <div class="cancel-modal-overlay">

            <div class="cancel-modal">

                <button
                    class="close-modal"
                    onclick="closeCancelModal()">

                    ×

                </button>


                <div class="cancel-icon">

                    🗑️

                </div>


                <h2>
                    Cancel Booking?
                </h2>


                <p>
                    Are you sure you want to
                    cancel this booking?
                </p>


                <div class="cancel-modal-buttons">

                    <button
                        class="keep-booking-btn"
                        onclick="closeCancelModal()">

                        Back

                    </button>


                    <button
                        class="confirm-cancel-btn"
                        onclick="confirmCancelBooking(
                            ${bookingId}
                        )">

                        Confirm

                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}



/* ============================= */
/* CLOSE POPUP */
/* ============================= */

function closeCancelModal() {

    const modal =
        document.getElementById(
            "cancelModal"
        );


    if (modal) {

        modal.remove();
    }
}



/* ============================= */
/* CONFIRM CANCELLATION */
/* ============================= */

async function confirmCancelBooking(bookingId) {

    try {

        /* ============================= */
        /* SEND CANCEL REQUEST */
        /* ============================= */

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/bookings/" +
                bookingId +
                "/cancel",
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();



        /* ============================= */
        /* BOOKING FAILED */
        /* ============================= */

        if (!response.ok) {

            alert(
                data.error ||
                data.message ||
                "Unable to cancel booking."
            );


            closeCancelModal();

            return;
        }



        /* ============================= */
        /* CLOSE POPUP */
        /* ============================= */

        closeCancelModal();



        /* ============================= */
        /* SUCCESS MESSAGE */
        /* ============================= */

        alert(
            "Booking cancelled successfully!"
        );



        /* ============================= */
        /* SHOW CANCELLED BOOKING */
        /* ============================= */

        loadBookings();



        /* ============================= */
        /* COMPLETE REFUND AFTER 5 SEC */
        /* ============================= */

        setTimeout(
            async function () {

                try {

                    const refundResponse =
                        await fetch(
                            "http://127.0.0.1:5000/api/refund/" +
                            bookingId +
                            "/complete",
                            {
                                method: "PUT"
                            }
                        );


                    const refundData =
                        await refundResponse.json();



                    if (!refundResponse.ok) {

                        console.error(
                            "Refund Completion Error:",
                            refundData.error
                        );

                        return;
                    }



                    /* ============================= */
                    /* RELOAD BOOKING */
                    /* ============================= */

                    loadBookings();

                } catch (error) {

                    console.error(
                        "Complete Refund Error:",
                        error
                    );
                }

            },
            5000
        );

    } catch (error) {

        console.error(
            "Cancel Booking Error:",
            error
        );


        closeCancelModal();


        alert(
            "Unable to connect to server."
        );
    }
}



/* ============================= */
/* START */
/* ============================= */

loadBookings();