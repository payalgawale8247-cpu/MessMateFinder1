
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
confirmButton.addEventListener("click",function(){
if(!bookingData){
alert("Booking information is missing.");
return;
}
confirmButton.disabled=true;
confirmButton.textContent="Processing...";
try{
const bookingId="DEMO-"+Date.now();
const savedBooking={
...bookingData,
booking_id:bookingId,
status:"Pending Payment",
demo:true,
created_at:new Date().toISOString()
};
const existingBookings=JSON.parse(localStorage.getItem("demoBookings")||"[]");
if(!Array.isArray(existingBookings)){
throw new Error("Invalid saved bookings.");
}
existingBookings.push(savedBooking);
localStorage.setItem("demoBookings",JSON.stringify(existingBookings));
localStorage.setItem("booking_id",bookingId);
localStorage.setItem("bookingData",JSON.stringify(savedBooking));
alert("Demo booking created successfully! Proceed to payment.");
window.location.href="payment.html?booking_id="+encodeURIComponent(bookingId);
}catch(error){
console.error("Demo Booking Error:",error);
alert("Unable to save demo booking: "+error.message);
confirmButton.disabled=false;
confirmButton.textContent="Confirm";
}
});
