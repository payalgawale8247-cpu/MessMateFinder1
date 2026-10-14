const id = new URLSearchParams(window.location.search).get("id");
const messName = document.getElementById("messName");
const locationElement = document.getElementById("location");
const foodType = document.getElementById("foodType");
const price = document.getElementById("price");
const rating = document.getElementById("rating");
const description = document.getElementById("description");
const openingTime = document.getElementById("openingTime");
const closingTime = document.getElementById("closingTime");
const writeReviewBtn = document.getElementById("writeReviewBtn");
const gallery = document.getElementById("messGallery");
const lightbox = document.getElementById("galleryLightbox");
const largeImage = document.getElementById("galleryLargeImage");
const galleryClose = document.getElementById("galleryClose");
async function loadMessDetails() {
    if (!id) {
        messName.innerText = "Mess not found";
        return;
    }
    try {
        const response = await fetch("http://127.0.0.1:5000/api/messes/" + id);
        if (!response.ok) throw new Error("Unable to fetch mess details");
        const mess = await response.json();
        if (mess.error) {
            messName.innerText = "Mess not found";
            return;
        }
        messName.innerText = mess.mess_name;
        locationElement.textContent = mess.location;
        foodType.textContent = mess.food_type;
        price.textContent = mess.price;
        rating.textContent = mess.rating;
        description.textContent = mess.description || "No description available";
        openingTime.textContent = mess.opening_time || "Not available";
        closingTime.textContent = mess.closing_time || "Not available";
        if (writeReviewBtn) writeReviewBtn.href = "reviews.html?id=" + id;
        loadMessGallery(mess);
    } catch (error) {
        console.error("Mess Details Error:", error);
        messName.innerText = "Unable to load mess details";
    }
}
function loadMessGallery(mess) {
    if (!gallery) return;
    gallery.replaceChildren();
    const messId = String(mess.id || id);
    const imageNames = ["mess" + messId + ".jpg", "mess" + messId + "_food.jpg", "mess" + messId + "_interior.jpg", "mess" + messId + "_exterior.jpg"];
    const message = document.createElement("p");
    message.className = "gallery-empty";
    message.textContent = "No gallery photos available yet.";
    gallery.appendChild(message);
    imageNames.forEach((fileName) => {
        const image = document.createElement("img");
        image.src = "images/" + fileName;
        image.alt = (mess.mess_name || "Mess") + " photo";
        image.loading = "lazy";
        image.onerror = () => image.remove();
        image.onload = () => {
            message.remove();
            image.className = "gallery-photo";
            image.tabIndex = 0;
            image.setAttribute("role", "button");
            image.addEventListener("click", () => openGalleryImage(image.src, image.alt));
            image.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openGalleryImage(image.src, image.alt);
                }
            });
            gallery.appendChild(image);
        };
    });
}
function openGalleryImage(src, alt) {
    largeImage.src = src;
    largeImage.alt = alt;
    lightbox.hidden = false;
    galleryClose.focus();
}
function closeGalleryImage() {
    lightbox.hidden = true;
    largeImage.removeAttribute("src");
}
galleryClose.addEventListener("click", closeGalleryImage);
lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeGalleryImage();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeGalleryImage();
});
function goBack() { window.location.href = "index.html"; }
function bookMess() { window.location.href = "booking.html?id=" + id; }
function openMenu() {
    if (!id) {
        alert("Mess information not available.");
        return;
    }
    window.location.href = "menu.html?id=" + id;
}
loadMessDetails();
