
const API_URL = "https://messmatefinder.onrender.com/api/messes";
let allMesses = [];
let selectedFilter = "All";

const demoMesses = [
{mess_id:1,mess_name:"Shree Ganesh Mess",location:"Nashik",food_type:"Veg",price:80,rating:4.5},
{mess_id:2,mess_name:"Maharashtra Food",location:"Nashik",food_type:"Veg",price:100,rating:4.3},
{mess_id:3,mess_name:"Student Food Point",location:"Nashik",food_type:"Veg",price:70,rating:4.2},
{mess_id:4,mess_name:"Sai Bhojan",location:"Pune",food_type:"Veg",price:90,rating:4.4},
{mess_id:5,mess_name:"Food Corner",location:"Pune",food_type:"Veg & Non-Veg",price:120,rating:4.1},
{mess_id:6,mess_name:"Demo Mess 6",location:"Mumbai",food_type:"Veg",price:100,rating:4.0},
{mess_id:7,mess_name:"Demo Mess 7",location:"Mumbai",food_type:"Non-Veg",price:150,rating:4.3},
{mess_id:8,mess_name:"Demo Mess 8",location:"Ahmedabad",food_type:"Veg",price:80,rating:4.2},
{mess_id:9,mess_name:"Demo Mess 9",location:"Bengaluru",food_type:"Veg",price:110,rating:4.5},
{mess_id:10,mess_name:"Demo Mess 10",location:"Delhi",food_type:"Veg & Non-Veg",price:130,rating:4.1},
{mess_id:11,mess_name:"Demo Mess 11",location:"Chennai",food_type:"Veg",price:90,rating:4.4}
];

function toggleAdvancedOptions() {
const options = document.getElementById("advancedOptions");
const arrow = document.getElementById("advancedArrow");
if (!options) return;
options.classList.toggle("show");
if (arrow) arrow.textContent = options.classList.contains("show") ? "▲" : "▼";
}

function showSelectedLocation() {
const state = localStorage.getItem("selectedState");
const district = localStorage.getItem("selectedDistrict");
const element = document.getElementById("selectedLocationText");
if (state && district && element) {
element.textContent = "📍 " + district + ", " + state;
}
}

function logout() {
localStorage.removeItem("user_id");
sessionStorage.removeItem("loggedIn");
window.location.href = "login.html";
}

function getMessImage(id) {
const number = Number(id);
return "images/mess" + (number >= 1 && number <= 11 ? number : 1) + ".jpg";
}

function getFavorites() {
try {
const data = JSON.parse(localStorage.getItem("favoriteMesses") || "[]");
return Array.isArray(data) ? data.map(Number) : [];
} catch {
return [];
}
}

function isFavorite(id) {
return getFavorites().includes(Number(id));
}

function toggleFavorite(id) {
const messId = Number(id);
let favorites = getFavorites();
favorites = favorites.includes(messId)
? favorites.filter(item => item !== messId)
: [...favorites, messId];
localStorage.setItem("favoriteMesses", JSON.stringify(favorites));
filterMesses();
}

async function loadMesses() {
const container = document.getElementById("messContainer");
if (container) container.innerHTML = "<p class='no-result'>Loading messes...</p>";
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
try {
const response = await fetch(API_URL,{signal:controller.signal});
if (!response.ok) throw new Error("API error: " + response.status);
const data = await response.json();
if (!Array.isArray(data)) throw new Error("Invalid mess data");
allMesses = data;
} catch (error) {
console.warn("Demo Mode: Backend unavailable",error);
allMesses = demoMesses;
} finally {
clearTimeout(timeout);
}
filterMesses();
}

function displayMesses(messes) {
const container = document.getElementById("messContainer");
if (!container) return;
container.innerHTML = "";
if (!messes.length) {
container.innerHTML = "<p class='no-result'>No mess found. Try another search or filter.</p>";
return;
}
messes.forEach(mess => {
const id = Number(mess.mess_id);
const card = document.createElement("div");
card.className = "mess-card";
const imageContainer = document.createElement("div");
imageContainer.className = "image-container";
const image = document.createElement("img");
image.src = getMessImage(id);
image.alt = mess.mess_name || "Mess";
image.className = "mess-image";
image.onerror = function() {
this.onerror = null;
this.src = "images/mess1.jpg";
};
const favoriteButton = document.createElement("button");
favoriteButton.type = "button";
favoriteButton.className = "favorite-btn" + (isFavorite(id) ? " active" : "");
favoriteButton.textContent = isFavorite(id) ? "❤️" : "♡";
favoriteButton.title = isFavorite(id) ? "Remove from Favorites" : "Add to Favorites";
favoriteButton.addEventListener("click", () => toggleFavorite(id));
imageContainer.append(image, favoriteButton);
const content = document.createElement("div");
content.className = "mess-card-content";
const title = document.createElement("h2");
title.textContent = mess.mess_name || "Unnamed Mess";
const location = document.createElement("p");
location.textContent = "📍 " + (mess.location || "Location not available");
const food = document.createElement("p");
food.textContent = "🍴 " + (mess.food_type || "Food type not available");
const price = document.createElement("p");
price.textContent = "💰 ₹" + (mess.price ?? "N/A");
const rating = document.createElement("p");
rating.className = "rating";
rating.textContent = "⭐ " + (mess.rating ?? "N/A");
const detailsButton = document.createElement("button");
detailsButton.type = "button";
detailsButton.className = "details-btn";
detailsButton.textContent = "View Details";
detailsButton.addEventListener("click", () => {
window.location.href = "details.html?id=" + encodeURIComponent(id);
});
content.append(title, location, food, price, rating, detailsButton);
card.append(imageContainer, content);
container.appendChild(card);
});
}

function setFilter(type) {
selectedFilter = type;
filterMesses();
}

function filterMesses() {
const searchBox = document.getElementById("searchBox");
const search = searchBox ? searchBox.value.trim().toLowerCase() : "";
const result = allMesses.filter(mess => {
const name = String(mess.mess_name || "").toLowerCase();
const location = String(mess.location || "").toLowerCase();
const food = String(mess.food_type || "").toLowerCase();
const messType = String(mess.mess_type || "").toLowerCase();
const price = Number(mess.price);
const rating = Number(mess.rating);
const distance = Number(mess.distance_km);
const isOpen = mess.open_now === true || String(mess.open_now).toLowerCase() === "true";
const homemade = mess.homemade === true || String(mess.homemade).toLowerCase() === "true";
const hotelThali = mess.hotel_thali === true || String(mess.hotel_thali).toLowerCase() === "true";
const searchMatch = !search || name.includes(search) || location.includes(search) || food.includes(search) || messType.includes(search);
let foodMatch = true;
if (selectedFilter === "Veg") foodMatch = food.includes("veg") && !food.includes("non-veg") && !food.includes("non veg");
if (selectedFilter === "Non-Veg") foodMatch = food.includes("non-veg") || food.includes("non veg");
let typeMatch = true;
if (selectedFilter === "Homemade") typeMatch = messType === "homemade" || homemade;
if (selectedFilter === "Hotel Thali") typeMatch = messType === "hotel thali" || hotelThali;
const availabilityMatch = selectedFilter !== "Open Now" || isOpen;
let distanceMatch = true;
if (selectedFilter === "1 km") distanceMatch = Number.isFinite(distance) && distance <= 1;
if (selectedFilter === "3 km") distanceMatch = Number.isFinite(distance) && distance <= 3;
if (selectedFilter === "5 km") distanceMatch = Number.isFinite(distance) && distance <= 5;
let priceMatch = true;
if (selectedFilter === "₹50 - ₹80") priceMatch = price >= 50 && price <= 80;
if (selectedFilter === "₹81 - ₹100") priceMatch = price >= 81 && price <= 100;
if (selectedFilter === "₹101 - ₹150") priceMatch = price >= 101 && price <= 150;
if (selectedFilter === "₹150+") priceMatch = price > 150;
let ratingMatch = true;
if (selectedFilter === "4.5+") ratingMatch = rating >= 4.5;
if (selectedFilter === "4.0+") ratingMatch = rating >= 4.0;
if (selectedFilter === "3.5+") ratingMatch = rating >= 3.5;
return searchMatch && foodMatch && typeMatch && availabilityMatch && distanceMatch && priceMatch && ratingMatch;
});
displayMesses(result);
}

showSelectedLocation();
loadMesses();
