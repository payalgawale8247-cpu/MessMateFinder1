from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port="5432",
        database="messmatefinder",
        user="postgres",
        password="payal1722"
    )


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return "MessMateFinder Backend is Running!"


# ============================================================
# REGISTER USER
# ============================================================

@app.route("/api/register", methods=["POST"])
def register_user():

    conn = None
    cur = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No registration data received"
            }), 400

        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")
        password = data.get("password")

        if not name or not email or not mobile or not password:
            return jsonify({
                "error": "All fields are required"
            }), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO users
            (name, email, mobile, password)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id;
        """, (
            name,
            email,
            mobile,
            password
        ))

        user_id = cur.fetchone()[0]

        conn.commit()

        return jsonify({
            "message": "Registration successful!",
            "user_id": user_id
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print("Registration Error:", e)

        return jsonify({
            "error": "Registration failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# LOGIN USER
# ============================================================

@app.route("/api/login", methods=["POST"])
def login_user():

    conn = None
    cur = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No login data received"
            }), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT user_id, name, email
            FROM users
            WHERE email = %s AND password = %s;
        """, (
            email,
            password
        ))

        user = cur.fetchone()

        if user is None:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        return jsonify({
            "message": "Login successful!",
            "user_id": user[0],
            "name": user[1],
            "email": user[2]
        }), 200

    except Exception as e:

        print("Login Error:", e)

        return jsonify({
            "error": "Login failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET USER PROFILE
# ============================================================

@app.route("/api/users/<int:user_id>")
def get_user_profile(user_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT user_id, name, email, mobile
            FROM users
            WHERE user_id = %s;
        """, (user_id,))

        user = cur.fetchone()

        if user is None:
            return jsonify({
                "error": "User not found"
            }), 404

        return jsonify({
            "user_id": user[0],
            "name": user[1],
            "email": user[2],
            "mobile": user[3]
        }), 200

    except Exception as e:

        print("Profile Error:", e)

        return jsonify({
            "error": "Unable to load profile",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()
# ============================================================
# GET ALL MESSES
# ============================================================

@app.route("/api/messes")
def get_messes():

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                mess_id,
                mess_name,
                location,
                food_type,
                price,
                rating,
                distance_km,
                is_open,
                homemade,
                hotel_thali,
                mess_type
            FROM messes
            ORDER BY mess_id;
        """)

        rows = cur.fetchall()

        messes = []

        for row in rows:

            messes.append({
                "mess_id": row[0],
                "mess_name": row[1],
                "location": row[2],
                "food_type": row[3],
                "price": float(row[4]),
                "rating": float(row[5]),
                "distance_km": float(row[6]),
                "open_now": row[7],
                "homemade": row[8],
                "hotel_thali": row[9],
                "mess_type": row[10]
            })

        return jsonify(messes), 200

    except Exception as e:

        print("Messes Error:", e)

        return jsonify({
            "error": "Database connection failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()

# ============================================================
# GET SINGLE MESS DETAILS
# ============================================================

@app.route("/api/messes/<int:mess_id>")
def get_mess_details(mess_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                mess_id,
                mess_name,
                location,
                food_type,
                price,
                rating,
                description,
                opening_time,
                closing_time
            FROM messes
            WHERE mess_id = %s;
        """, (mess_id,))

        row = cur.fetchone()

        if row is None:
            return jsonify({
                "error": "Mess not found"
            }), 404

        mess = {
            "mess_id": row[0],
            "mess_name": row[1],
            "location": row[2],
            "food_type": row[3],
            "price": float(row[4]),
            "rating": float(row[5]),
            "description": row[6] or "",
            "opening_time": str(row[7]),
            "closing_time": str(row[8])
        }

        return jsonify(mess), 200

    except Exception as e:

        print("Details Error:", e)

        return jsonify({
            "error": "Database error",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CREATE BOOKING
# ============================================================

@app.route("/api/bookings", methods=["POST"])
def create_booking():

    conn = None
    cur = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No booking data received"
            }), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO bookings
            (
                user_id,
                mess_id,
                booking_date,
                booking_time,
                meal,
                people,
                amount,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING booking_id;
        """, (
            data["user_id"],
            data["mess_id"],
            data["booking_date"],
            data["booking_time"],
            data["meal"],
            data["people"],
            data["amount"],
            "Confirmed"
        ))

        booking_id = cur.fetchone()[0]

        conn.commit()

        return jsonify({
            "message": "Booking confirmed successfully!",
            "booking_id": booking_id
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print("Booking Error:", e)

        return jsonify({
            "error": "Booking failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET SINGLE BOOKING DETAILS
# ============================================================

@app.route("/api/bookings/<int:booking_id>")
def get_single_booking(booking_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                b.booking_id,
                m.mess_name,
                b.amount
            FROM bookings b
            JOIN messes m
            ON b.mess_id = m.mess_id
            WHERE b.booking_id = %s;
        """, (booking_id,))

        row = cur.fetchone()

        if row is None:
            return jsonify({
                "error": "Booking not found"
            }), 404

        return jsonify({
            "booking_id": row[0],
            "mess_name": row[1],
            "amount": float(row[2])
        }), 200

    except Exception as e:

        print("Single Booking Error:", e)

        return jsonify({
            "error": "Unable to load booking details",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CREATE PAYMENT
# ============================================================

@app.route("/api/payments", methods=["POST"])
def create_payment():

    conn = None
    cur = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No payment data received"
            }), 400

        booking_id = data.get("booking_id")
        user_id = data.get("user_id")
        amount = data.get("amount")
        payment_method = data.get("payment_method")

        if not booking_id or not user_id or not amount or not payment_method:
            return jsonify({
                "error": "All payment details are required"
            }), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO payments
            (
                booking_id,
                user_id,
                amount,
                payment_method,
                payment_status
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING payment_id;
        """, (
            booking_id,
            user_id,
            amount,
            payment_method,
            "Success"
        ))

        payment_id = cur.fetchone()[0]

        conn.commit()

        return jsonify({
            "message": "Payment successful!",
            "payment_id": payment_id,
            "booking_id": booking_id,
            "amount": float(amount),
            "payment_method": payment_method,
            "payment_status": "Success"
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print("Payment Error:", e)

        return jsonify({
            "error": "Payment failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET USER PAYMENTS
# ============================================================

@app.route("/api/payments/user/<int:user_id>")
def get_user_payments(user_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                payment_id,
                booking_id,
                amount,
                payment_method,
                payment_status,
                payment_date
            FROM payments
            WHERE user_id = %s
            ORDER BY payment_date DESC;
        """, (user_id,))

        rows = cur.fetchall()

        payments = []

        for row in rows:

            payments.append({
                "payment_id": row[0],
                "booking_id": row[1],
                "amount": float(row[2]),
                "payment_method": row[3],
                "payment_status": row[4],
                "payment_date": row[5].strftime("%d-%m-%Y %I:%M %p")
            })

        return jsonify(payments), 200

    except Exception as e:

        print("Payment History Error:", e)

        return jsonify({
            "error": "Unable to load payment history",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET USER BOOKINGS
# ============================================================

@app.route("/api/bookings/user/<int:user_id>")
def get_user_bookings(user_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                b.booking_id,
                m.mess_name,
                m.location,
                b.meal,
                b.people,
                b.amount,
                b.booking_date,
                b.booking_time,
                b.status
            FROM bookings b
            JOIN messes m
            ON b.mess_id = m.mess_id
            WHERE b.user_id = %s
            ORDER BY b.booking_id DESC;
        """, (user_id,))

        rows = cur.fetchall()

        bookings = []

        for row in rows:

            bookings.append({
                "booking_id": row[0],
                "mess_name": row[1],
                "location": row[2],
                "meal": row[3],
                "people": row[4],
                "amount": float(row[5]),
                "booking_date": str(row[6]),
                "booking_time": str(row[7]),
                "status": row[8]
            })

        return jsonify(bookings), 200

    except Exception as e:

        print("Bookings Error:", e)

        return jsonify({
            "error": "Unable to load bookings",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CANCEL BOOKING
# ============================================================

@app.route("/api/bookings/<int:booking_id>/cancel", methods=["PUT"])
def cancel_booking(booking_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        # Check booking
        cur.execute("""
            SELECT booking_id, status
            FROM bookings
            WHERE booking_id = %s;
        """, (booking_id,))

        booking = cur.fetchone()

        if booking is None:
            return jsonify({
                "error": "Booking not found"
            }), 404

        current_status = booking[1]

        # Already cancelled
        if current_status == "Cancelled":
            return jsonify({
                "error": "Booking is already cancelled"
            }), 400

        # Update booking status
        cur.execute("""
            UPDATE bookings
            SET status = %s
            WHERE booking_id = %s;
        """, (
            "Cancelled",
            booking_id
        ))

        conn.commit()

        return jsonify({
            "message": "Booking cancelled successfully!",
            "booking_id": booking_id,
            "status": "Cancelled"
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        print("Cancel Booking Error:", e)

        return jsonify({
            "error": "Unable to cancel booking",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET REFUND STATUS
# ============================================================

@app.route("/api/refund/<int:booking_id>")
def get_refund_status(booking_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        # Check booking status
        cur.execute("""
            SELECT status
            FROM bookings
            WHERE booking_id = %s;
        """, (booking_id,))

        booking = cur.fetchone()

        if booking is None:
            return jsonify({
                "error": "Booking not found"
            }), 404

        booking_status = booking[0]

        # Get latest payment information
        cur.execute("""
            SELECT
                payment_id,
                amount,
                payment_method,
                payment_status,
                payment_date
            FROM payments
            WHERE booking_id = %s
            ORDER BY payment_id DESC
            LIMIT 1;
        """, (booking_id,))

        payment = cur.fetchone()

        if payment is None:
            return jsonify({
                "error": "Payment not found"
            }), 404

        payment_status = payment[3]

        # If booking is cancelled and payment was successful
        if booking_status == "Cancelled" and payment_status == "Success":

            cur.execute("""
                UPDATE payments
                SET payment_status = %s
                WHERE payment_id = %s;
            """, (
                "Refund Pending",
                payment[0]
            ))

            conn.commit()

            payment_status = "Refund Pending"

        return jsonify({
            "booking_id": booking_id,
            "payment_id": payment[0],
            "amount": float(payment[1]),
            "payment_method": payment[2],
            "payment_status": payment_status,
            "payment_date": payment[4].strftime("%d-%m-%Y %I:%M %p")
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        print("Refund Status Error:", e)

        return jsonify({
            "error": "Unable to load refund status",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# COMPLETE REFUND - DEMO
# ============================================================

@app.route("/api/refund/<int:booking_id>/complete", methods=["PUT"])
def complete_refund(booking_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE payments
            SET payment_status = %s
            WHERE payment_id = (
                SELECT payment_id
                FROM payments
                WHERE booking_id = %s
                ORDER BY payment_id DESC
                LIMIT 1
            )
            AND payment_status = %s
            RETURNING payment_id;
        """, (
            "Refunded",
            booking_id,
            "Refund Pending"
        ))

        result = cur.fetchone()

        if result is None:
            return jsonify({
                "error": "Refund is not pending"
            }), 400

        conn.commit()

        return jsonify({
            "message": "Refund processed successfully.",
            "booking_id": booking_id,
            "payment_status": "Refunded"
        }), 200

    except Exception as e:

        if conn:
            conn.rollback()

        print("Complete Refund Error:", e)

        return jsonify({
            "error": "Unable to complete refund",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# ADD REVIEW
# ============================================================

@app.route("/api/reviews", methods=["POST"])
def add_review():

    conn = None
    cur = None

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No review data received"
            }), 400

        user_id = data.get("user_id")
        mess_id = data.get("mess_id")
        rating = data.get("rating")
        review_text = data.get("review_text")

        if not user_id or not mess_id or not rating:
            return jsonify({
                "error": "User, mess and rating are required"
            }), 400

        if int(rating) < 1 or int(rating) > 5:
            return jsonify({
                "error": "Rating must be between 1 and 5"
            }), 400

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO reviews
            (
                user_id,
                mess_id,
                rating,
                review_text
            )
            VALUES (%s, %s, %s, %s)
            RETURNING review_id;
        """, (
            user_id,
            mess_id,
            rating,
            review_text
        ))

        review_id = cur.fetchone()[0]

        conn.commit()

        return jsonify({
            "message": "Review added successfully!",
            "review_id": review_id
        }), 201

    except Exception as e:

        if conn:
            conn.rollback()

        print("Review Error:", e)

        return jsonify({
            "error": "Review failed",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET REVIEWS FOR A MESS
# ============================================================

@app.route("/api/reviews/<int:mess_id>")
def get_reviews(mess_id):

    conn = None
    cur = None

    try:

        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                r.review_id,
                r.user_id,
                u.name,
                r.rating,
                r.review_text,
                r.created_at
            FROM reviews r
            JOIN users u
            ON r.user_id = u.user_id
            WHERE r.mess_id = %s
            ORDER BY r.created_at DESC;
        """, (mess_id,))

        rows = cur.fetchall()

        reviews = []

        for row in rows:

            reviews.append({
                "review_id": row[0],
                "user_id": row[1],
                "user_name": row[2],
                "rating": row[3],
                "review_text": row[4] or "",
                "created_at": str(row[5])
            })

        return jsonify(reviews), 200

    except Exception as e:

        print("Reviews Error:", e)

        return jsonify({
            "error": "Unable to load reviews",
            "message": str(e)
        }), 500

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()

# ============================================================
# GET WEEKLY MENU FOR A MESS
# ============================================================

@app.route("/api/menu/weekly/<int:mess_id>")
def get_weekly_menu(mess_id):
    conn = None
    cur = None

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                menu_id,
                mess_id,
                menu_date,
                breakfast,
                lunch,
                dinner
            FROM menus
            WHERE mess_id = %s
            ORDER BY menu_date DESC, menu_id DESC
            LIMIT 7;
        """, (mess_id,))

        rows = cur.fetchall()
        rows.reverse()

        weekly_menu = []

        for row in rows:
            weekly_menu.append({
                "menu_id": row[0],
                "mess_id": row[1],
                "menu_date": str(row[2]),
                "day": row[2].strftime("%A"),
                "breakfast": row[3] or "Not available",
                "lunch": row[4] or "Not available",
                "dinner": row[5] or "Not available"
            })

        if len(weekly_menu) == 0:
            return jsonify({
                "error": "Weekly menu not found"
            }), 404

        return jsonify(weekly_menu), 200

    except Exception as e:
        print("Weekly Menu Error:", e)

        return jsonify({
            "error": "Unable to load weekly menu",
            "message": str(e)
        }), 500

    finally:
        if cur:
            cur.close()

        if conn:
            conn.close()

# ============================================================
# GET DAILY MENU FOR A MESS
# ============================================================

@app.route("/api/menu/<int:mess_id>")
def get_daily_menu(mess_id):
    conn = None
    cur = None

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                menu_id,
                mess_id,
                menu_date,
                breakfast,
                lunch,
                dinner
            FROM menus
            WHERE mess_id = %s
            ORDER BY menu_date DESC, menu_id DESC
            LIMIT 1;
        """, (mess_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({
                "error": "Daily menu not found"
            }), 404

        return jsonify({
            "menu_id": row[0],
            "mess_id": row[1],
            "menu_date": str(row[2]),
            "breakfast": row[3] or "Not available",
            "lunch": row[4] or "Not available",
            "dinner": row[5] or "Not available"
        }), 200

    except Exception as e:
        print("Daily Menu Error:", e)

        return jsonify({
            "error": "Unable to load daily menu",
            "message": str(e)
        }), 500

    finally:
        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# START FLASK
# ============================================================

if __name__ == "__main__":
    app.run(debug=True)
