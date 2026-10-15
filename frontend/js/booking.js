
const API_URL="https://messmatefinder.onrender.com/api";
const messId=new URLSearchParams(window.location.search).get("id");
const bookingForm=document.getElementById("bookingForm");
const confirmationPopup=document.getElementById("confirmationPopup");
const backButton=document.getElementById("backButton");
const confirmButton=document.getElementById("confirmButton");
const nameInput=document.getElementById("name");
const mobileInput=document.getElementById("mobile");
const mealInput=document.getElementById("meal");
const bookingDateInput=document.getElementById("bookingDate");
const bookingTimeInput=document.getElementById("bookingTime");
const peopleInput=document.getElementById("people");
let bookingData=null;
function getLocalDate(){
const now=new Date();
const year=now.getFullYear();
const month=String(now.getMonth()+1).padStart(2,"0");
const day=String(now.getDate()).padStart(2,"0");
return year+"-"+month+"-"+day;
}
bookingDateInput.min=getLocalDate();
bookingForm.addEventListener("submit",function(event){
event.preventDefault();
const name=nameInput.value.trim();
const mobile=mobileInput.value.trim();
const meal=mealInput.value;
const bookingDate=bookingDateInput.value;
const bookingTime=bookingTimeInput.value;
const people=Number(peopleInput.value);
if(!messId||!Number.isInteger(Number(messId))||Number(messId)<1){
alert("Mess information not available.");
return;
}
if(name.length<3){
alert("Please enter a valid full name.");
return;
}
if(!/^[0-9]{10}$/.test(mobile)){
alert("Please enter a valid 10-digit mobile number.");
return;
}
if(!meal){
alert("Please select a meal.");
return;
}
if(!bookingDate||!bookingTime){
alert("Please select booking date and time.");
return;
}
if(!Number.isInteger(people)||people<1){
alert("Number of people must be at least 1.");
return;
}
const selectedDateTime=new Date(bookingDate+"T"+bookingTime);
if(Number.isNaN(selectedDateTime.getTime())||selectedDateTime<=new Date()){
alert("Please select a future date and time.");
return;
}
bookingData={
mess_id:Number(messId),
name:name,
mobile:mobile,
meal:meal,
booking_date:bookingDate,
booking_time:bookingTime,
people:people
};
confirmationPopup.style.display="flex";
});
backButton.addEventListener("click",function(){
confirmationPopup.style.display="none";
});
confirmButton.addEventListener("click",async function(){
if(!bookingData){
alert("Booking information is missing.");
return;
}
confirmButton.disabled=true;
confirmButton.textContent="Processing...";
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),15000);
try{
const response=await fetch(API_URL+"/bookings",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(bookingData),
signal:controller.signal
});
const result=await response.json();
if(!response.ok){
throw new Error(result.error||"Booking failed.");
}
if(!result.booking_id){
throw new Error("Booking ID not received from server.");
}
localStorage.setItem("booking_id",String(result.booking_id));
localStorage.setItem("bookingData",JSON.stringify(result));
alert("Booking confirmed successfully!");
window.location.href="payment.html?booking_id="+encodeURIComponent(result.booking_id);
}catch(error){
console.error("Booking Error:",error);
if(error.name==="AbortError"){
alert("Server response timed out. Please check booking status before trying again.");
}else{
alert("Unable to confirm booking: "+error.message);
}
}finally{
clearTimeout(timeout);
confirmButton.disabled=false;
confirmButton.textContent="Confirm";
}
});

