
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
function createMenuCard(title,menu){
const card=document.createElement("div");
card.className="menu-card";
const heading=document.createElement("h3");
heading.textContent=title;
card.appendChild(heading);
[["🌅 Breakfast",menu.breakfast],["☀️ Lunch",menu.lunch],["🌙 Dinner",menu.dinner]].forEach(([label,value])=>{
const p=document.createElement("p");
const strong=document.createElement("strong");
strong.textContent=label+": ";
p.append(strong,document.createTextNode(value||"Not available"));
card.appendChild(p);
});
return card;
}
function displayMenu(daily,weekly,isDemo){
menuContainer.innerHTML="";
if(isDemo){
const note=document.createElement("p");
note.textContent="Sample Menu (Demo Mode)";
menuContainer.appendChild(note);
}
const todayHeading=document.createElement("h2");
todayHeading.textContent="📅 Today's Menu";
menuContainer.appendChild(todayHeading);
if(daily){
menuContainer.appendChild(createMenuCard("Today's Meals",daily));
}else{
const p=document.createElement("p");
p.textContent="Today's menu is not available.";
menuContainer.appendChild(p);
}
const weekHeading=document.createElement("h2");
weekHeading.textContent="📆 Weekly Menu";
menuContainer.appendChild(weekHeading);
if(Array.isArray(weekly)&&weekly.length){
const wrapper=document.createElement("div");
wrapper.className="weekly-menu";
weekly.forEach(day=>wrapper.appendChild(createMenuCard("📅 "+(day.day||"Day"),day)));
menuContainer.appendChild(wrapper);
}else{
const p=document.createElement("p");
p.textContent="Weekly menu is not available.";
menuContainer.appendChild(p);
}
}
async function loadMenu(){
if(!messId){
menuContainer.textContent="Please select a mess from the Home Page.";
return;
}
displayMenu(demoDaily,demoWeekly,true);
const results=await Promise.allSettled([
fetchData("/api/menu/"+encodeURIComponent(messId)),
fetchData("/api/menu/weekly/"+encodeURIComponent(messId))
]);
const daily=results[0].status==="fulfilled"?results[0].value:null;
const weekly=results[1].status==="fulfilled"?results[1].value:null;
if(daily||Array.isArray(weekly)){
displayMenu(daily&&typeof daily==="object"&&!Array.isArray(daily)?daily:null,Array.isArray(weekly)?weekly:[],false);
}
}
loadMessDetails();
loadMenu();
