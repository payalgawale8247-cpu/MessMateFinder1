-- MessMateFinder Database

-- 1. Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. Messes
CREATE TABLE messes (
    mess_id SERIAL PRIMARY KEY,
    mess_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    food_type VARCHAR(30) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    description TEXT,
    opening_time TIME,
    closing_time TIME,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 3. Menu Items
CREATE TABLE menu_items (
    menu_id SERIAL PRIMARY KEY,
    mess_id INTEGER NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    meal_type VARCHAR(30) NOT NULL,
    price DECIMAL(10, 2),
    available BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_menu_mess
        FOREIGN KEY (mess_id)
        REFERENCES messes(mess_id)
        ON DELETE CASCADE
);


-- 4. Bookings
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mess_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    meal VARCHAR(30) NOT NULL,
    people INTEGER NOT NULL CHECK (people > 0),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_mess
        FOREIGN KEY (mess_id)
        REFERENCES messes(mess_id)
        ON DELETE CASCADE
);


-- 5. Payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    payment_status VARCHAR(30) DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE CASCADE
);


-- 6. Reviews
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mess_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_mess
        FOREIGN KEY (mess_id)
        REFERENCES messes(mess_id)
        ON DELETE CASCADE
);


-- 7. Favorites
CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mess_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorite_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_mess
        FOREIGN KEY (mess_id)
        REFERENCES messes(mess_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_mess
        UNIQUE (user_id, mess_id)
);