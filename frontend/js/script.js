
async function loadMesses() {
const container = document.getElementById("messContainer");
if (container) container.innerHTML = "<p class='no-result'>Loading messes...</p>";
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
