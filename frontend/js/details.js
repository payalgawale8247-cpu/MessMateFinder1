
const API_URL = "https://messmatefinder.onrender.com/api/messes";
const messId = Number(new URLSearchParams(window.location.search).get("id"));
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

function setText(id,value) {
const element = document.getElementById(id);
if (element) element.textContent = value ?? "Not available";
}

function showMessDetails(mess) {
setText("messName",mess.mess_name);
setText("location",mess.location);
setText("foodType",mess.food_type);
setText("price",mess.price);
setText("rating",mess.rating);
setText("description",mess.description || "Fresh and affordable food.");
setText("openingTime",mess.opening_time || "Not available");
setText("closingTime",mess.closing_time || "Not available");
showGallery(mess);
}

function showGallery(mess) {
const gallery = document.getElementById("messGallery");
if (!gallery) return;
gallery.innerHTML = "";
const id = Number(mess.mess_id);
const image = document.createElement("img");
image.src = "images/mess" + (id >= 1 && id <= 11 ? id : 1) + ".jpg";
image.alt = mess.mess_name;
image.loading = "lazy";
image.style.width = "100%";
image.style.height = "190px";
image.style.objectFit = "cover";
image.style.borderRadius = "12px";
image.style.cursor = "pointer";
image.onerror = function() {
this.onerror = null;
this.src = "images/mess1.jpg";
};
image.addEventListener("click",() => openGallery(image.src));
gallery.appendChild(image);
}

function openGallery(src) {
const lightbox = document.getElementById("galleryLightbox");
const largeImage = document.getElementById("galleryLargeImage");
if (!lightbox || !largeImage) return;
largeImage.src = src;
lightbox.hidden = false;
document.body.style.overflow = "hidden";
}

function closeGallery() {
const lightbox = document.getElementById("galleryLightbox");
if (lightbox) lightbox.hidden = true;
document.body.style.overflow = "";
}

function goBack() {
window.location.href = "index.html";
}

function bookMess() {
if (!Number.isInteger(messId) || messId < 1) return;
window.location.href = "booking.html?id=" + encodeURIComponent(messId);
}

function openMenu() {
if (!Number.isInteger(messId) || messId < 1) return;
window.location.href = "menu.html?id=" + encodeURIComponent(messId);
}

async function loadMessDetails() {
if (!Number.isInteger(messId) || messId < 1) {
setText("messName","Invalid Mess ID");
return;
}
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(),5000);
let mess = null;
try {
const response = await fetch(API_URL,{signal:controller.signal});
if (!response.ok) throw new Error("API error");
const data = await response.json();
if (!Array.isArray(data)) throw new Error("Invalid data");
mess = data.find(item => Number(item.mess_id) === messId);
} catch (error) {
console.warn("Demo Mode: Backend unavailable",error);
} finally {
clearTimeout(timeout);
}
if (!mess) mess = demoMesses.find(item => item.mess_id === messId);
if (!mess) {
setText("messName","Mess Not Found");
return;
}
showMessDetails(mess);
}

function setupGallery() {
const closeButton = document.getElementById("galleryClose");
const lightbox = document.getElementById("galleryLightbox");
if (closeButton) closeButton.addEventListener("click",closeGallery);
if (lightbox) {
lightbox.addEventListener("click",event => {
if (event.target === lightbox) closeGallery();
});
}
document.addEventListener("keydown",event => {
if (event.key === "Escape") closeGallery();
});
}

function setupReviews() {
const reviews = document.getElementById("reviewsContainer");
if (reviews) reviews.innerHTML = "<p>Reviews are not available in Demo Mode.</p>";
const button = document.getElementById("writeReviewBtn");
if (button) button.href = "reviews.html?id=" + encodeURIComponent(messId);
}

setupGallery();
setupReviews();
loadMessDetails();
