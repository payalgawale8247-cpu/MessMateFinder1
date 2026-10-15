
const FAVORITES_KEY="favoriteMesses";
const API_URL="https://messmatefinder.onrender.com/api/messes";
const demoMesses=[
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
function getFavorites(){
try{
const data=JSON.parse(localStorage.getItem(FAVORITES_KEY)||"[]");
return Array.isArray(data)?data:[];
}catch(error){
return [];
}
}
function getFavoriteIds(){
return getFavorites().map(item=>String(typeof item==="object"?(item.mess_id??item.id):item));
}
function removeFavorite(id){
const updated=getFavorites().filter(item=>String(typeof item==="object"?(item.mess_id??item.id):item)!==String(id));
localStorage.setItem(FAVORITES_KEY,JSON.stringify(updated));
loadFavorites();
}
function createFavoriteCard(mess){
const card=document.createElement("div");
card.className="mess-card";
const image=document.createElement("img");
image.src="images/mess"+mess.mess_id+".jpg";
image.alt=mess.mess_name;
image.style.cssText="width:150px;max-width:100%;height:100px;object-fit:cover;border-radius:8px;display:block;margin:0 auto 12px";
const title=document.createElement("h3");
title.textContent=mess.mess_name;
const location=document.createElement("p");
location.textContent="📍 "+(mess.location||"Not available");
const price=document.createElement("p");
price.textContent="💰 ₹"+(mess.price??"N/A");
const rating=document.createElement("p");
rating.textContent="⭐ "+(mess.rating??"N/A");
const details=document.createElement("a");
details.href="details.html?id="+encodeURIComponent(mess.mess_id);
details.textContent="View Details";
const remove=document.createElement("button");
remove.type="button";
remove.textContent="❤️ Remove";
remove.onclick=()=>removeFavorite(mess.mess_id);
card.append(image,title,location,price,rating,details,remove);
return card;
}
async function loadFavorites(){
const container=document.getElementById("favoritesContainer");
if(!container)return;
container.textContent="Loading favorites...";
const ids=getFavoriteIds();
if(ids.length===0){
container.textContent="No favorite messes added yet.";
return;
}
let messes=demoMesses;
try{
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),3000);
try{
const response=await fetch(API_URL,{signal:controller.signal});
if(!response.ok)throw new Error("API unavailable");
const data=await response.json();
if(Array.isArray(data)&&data.length)messes=data;
}finally{
clearTimeout(timeout);
}
}catch(error){
console.log("Favorites running in Demo Mode");
}
const saved=getFavorites();
container.innerHTML="";
ids.forEach(id=>{
let mess=messes.find(item=>String(item.mess_id)===id);
if(!mess){
const stored=saved.find(item=>typeof item==="object"&&String(item.mess_id??item.id)===id);
mess=stored?{...stored,mess_id:id}:null;
}
if(mess)container.appendChild(createFavoriteCard(mess));
});
if(!container.children.length)container.textContent="No favorite messes found.";
}
document.addEventListener("DOMContentLoaded",loadFavorites);

