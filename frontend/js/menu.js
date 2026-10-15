
const API_BASE="https://messmatefinder.onrender.com";
const params=new URLSearchParams(window.location.search);
const messId=params.get("id")||params.get("mess_id");
const messName=document.getElementById("messName");
const messLocation=document.getElementById("messLocation");
const menuContainer=document.getElementById("menuContainer");
const demoMesses=[
{mess_id:1,mess_name:"Shree Ganesh Mess",location:"Nashik"},
{mess_id:2,mess_name:"Maharashtra Food",location:"Nashik"},
{mess_id:3,mess_name:"Student Food Point",location:"Nashik"},
{mess_id:4,mess_name:"Sai Bhojan",location:"Pune"},
{mess_id:5,mess_name:"Food Corner",location:"Pune"},
{mess_id:6,mess_name:"Demo Mess 6",location:"Mumbai"},
{mess_id:7,mess_name:"Demo Mess 7",location:"Mumbai"},
{mess_id:8,mess_name:"Demo Mess 8",location:"Ahmedabad"},
{mess_id:9,mess_name:"Demo Mess 9",location:"Bengaluru"},
{mess_id:10,mess_name:"Demo Mess 10",location:"Delhi"},
{mess_id:11,mess_name:"Demo Mess 11",location:"Chennai"}
];
const demoDaily={
breakfast:"Poha, Tea",
lunch:"Chapati, Seasonal Vegetable, Dal, Rice",
dinner:"Jowar Bhakri, Seasonal Vegetable, Dal, Rice"
};
const demoWeekly=[
{day:"Monday",breakfast:"Poha",lunch:"Chapati, Dal, Rice",dinner:"Jowar Bhakri, Vegetable"},
{day:"Tuesday",breakfast:"Upma",lunch:"Chapati, Vegetable, Rice",dinner:"Bajri Bhakri, Dal, Rice"},
{day:"Wednesday",breakfast:"Idli",lunch:"Chapati, Dal, Rice",dinner:"Rice Bhakri, Vegetable"},
{day:"Thursday",breakfast:"Poha",lunch:"Chapati, Vegetable, Rice",dinner:"Nachni Bhakri, Dal, Rice"},
{day:"Friday",breakfast:"Upma",lunch:"Chapati, Dal, Rice",dinner:"Jowar Bhakri, Vegetable"},
{day:"Saturday",breakfast:"Idli",lunch:"Chapati, Vegetable, Rice",dinner:"Bajri Bhakri, Dal, Rice"},
{day:"Sunday",breakfast:"Poha",lunch:"Chapati, Special Vegetable, Rice",dinner:"Chapati, Dal, Rice"}
];
function goBack(){
window.location.href="details.html?id="+encodeURIComponent(messId||1);
}
async function fetchData(path){
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),3000);
try{
const response=await fetch(API_BASE+path,{signal:controller.signal});
if(!response.ok)throw new Error("API unavailable");
return await response.json();
}finally{
clearTimeout(timeout);
}
}
async function loadMessDetails(){
if(!messId){
messName.textContent="Mess not selected";
messLocation.textContent="";
return;
}
const demo=demoMesses.find(m=>String(m.mess_id)===String(messId));
if(demo){
messName.textContent=demo.mess_name;
messLocation.textContent="📍 "+demo.location;
}else{
messName.textContent="Mess Details";
messLocation.textContent="";
}
try{
const mess=await fetchData("/api/messes/"+encodeURIComponent(messId));
if(mess&&mess.mess_name){
messName.textContent=mess.mess_name;
messLocation.textContent="📍 "+(mess.location||"");
}
}catch(error){
console.log("Mess details running in Demo Mode");
}
}
function displayMenu(daily,weekly){
menuContainer.innerHTML="";
const todayHeading=document.createElement("h2");
todayHeading.textContent="📅 Today's Menu";
menuContainer.appendChild(todayHeading);
if(daily){
const todayGrid=document.createElement("div");
todayGrid.className="today-menu-grid";
[["🌅","Breakfast",daily.breakfast],["☀️","Lunch",daily.lunch],["🌙","Dinner",daily.dinner]].forEach(([emoji,label,food])=>{
const card=document.createElement("div");
card.className="today-meal-card";
const icon=document.createElement("div");
icon.className="meal-icon";
icon.textContent=emoji;
const title=document.createElement("h3");
title.textContent=label;
const description=document.createElement("p");
description.textContent=food||"Not available";
card.append(icon,title,description);
todayGrid.appendChild(card);
});
menuContainer.appendChild(todayGrid);
}else{
const p=document.createElement("p");
p.textContent="Today's menu is not available.";
menuContainer.appendChild(p);
}
const weeklyHeading=document.createElement("h2");
weeklyHeading.textContent="📆 Weekly Menu";
menuContainer.appendChild(weeklyHeading);
if(!Array.isArray(weekly)||!weekly.length){
const p=document.createElement("p");
p.textContent="Weekly menu is not available.";
menuContainer.appendChild(p);
return;
}
const dayBar=document.createElement("div");
dayBar.className="weekly-day-bar";
const dayContent=document.createElement("div");
dayContent.className="weekly-day-content";
weekly.forEach(day=>{
const button=document.createElement("button");
button.type="button";
button.className="weekly-day-btn";
button.textContent=day.day||"Day";
button.onclick=()=>{
dayBar.querySelectorAll("button").forEach(btn=>btn.classList.remove("active"));
button.classList.add("active");
dayContent.innerHTML="";
const card=document.createElement("div");
card.className="selected-day-card";
const heading=document.createElement("h3");
heading.textContent="📅 "+(day.day||"Day");
card.appendChild(heading);
[["🌅","Breakfast",day.breakfast],["☀️","Lunch",day.lunch],["🌙","Dinner",day.dinner]].forEach(([emoji,label,food])=>{
const row=document.createElement("div");
row.className="day-meal-row";
const name=document.createElement("strong");
name.textContent=emoji+" "+label;
const value=document.createElement("span");
value.textContent=food||"Not available";
row.append(name,value);
card.appendChild(row);
});
dayContent.appendChild(card);
};
dayBar.appendChild(button);
});
menuContainer.append(dayBar,dayContent);
const todayName=new Date().toLocaleDateString("en-US",{weekday:"long"});
const todayButton=[...dayBar.children].find(button=>button.textContent.toLowerCase()===todayName.toLowerCase());
(todayButton||dayBar.firstElementChild).click();
}
async function loadMenu(){
if(!messId){
menuContainer.textContent="Please select a mess from the Home Page.";
return;
}
displayMenu(demoDaily,demoWeekly);
const results=await Promise.allSettled([
fetchData("/api/menu/"+encodeURIComponent(messId)),
fetchData("/api/menu/weekly/"+encodeURIComponent(messId))
]);
const daily=results[0].status==="fulfilled"?results[0].value:null;
const weekly=results[1].status==="fulfilled"?results[1].value:null;
if(daily||Array.isArray(weekly)){
displayMenu(daily&&typeof daily==="object"&&!Array.isArray(daily)?daily:null,Array.isArray(weekly)?weekly:[]);
}
}
loadMessDetails();
loadMenu();
