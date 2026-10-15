
const bookingIdElement=document.getElementById("bookingId");
const messNameElement=document.getElementById("messName");
const amountElement=document.getElementById("amount");
const paymentForm=document.getElementById("paymentForm");
const paymentMessage=document.getElementById("paymentMessage");
const bookingId=new URLSearchParams(window.location.search).get("booking_id");
let currentBooking=null;

function getDemoBookings(){
const bookings=JSON.parse(localStorage.getItem("demoBookings")||"[]");
return Array.isArray(bookings)?bookings:[];
}

function loadBookingDetails(){
bookingIdElement.textContent=bookingId||"Not available";
messNameElement.textContent="Not available";
amountElement.textContent="0";
if(!bookingId){
paymentMessage.textContent="Booking ID is missing.";
return;
}
const bookings=getDemoBookings();
currentBooking=bookings.find(booking=>String(booking.booking_id)===bookingId);
if(!currentBooking){
paymentMessage.textContent="Demo booking not found. Please create a new booking.";
return;
}
messNameElement.textContent=currentBooking.mess_name||"Mess ID: "+currentBooking.mess_id;
const amount=Number(currentBooking.amount);
if(Number.isFinite(amount)&&amount>0){
amountElement.textContent=amount.toFixed(2);
}else{
amountElement.textContent="Not available";
paymentMessage.textContent="Booking amount is not available. Payment simulation cannot continue.";
}
if(currentBooking.status==="Paid"){
paymentMessage.textContent="This demo booking is already marked as paid.";
paymentForm.querySelector('button[type="submit"]').disabled=true;
}
}

paymentForm.addEventListener("submit",function(event){
event.preventDefault();
const selectedMethod=document.querySelector('input[name="paymentMethod"]:checked');
if(!selectedMethod){
paymentMessage.textContent="Please select a payment method.";
return;
}
if(!currentBooking){
paymentMessage.textContent="Demo booking not found.";
return;
}
const amount=Number(currentBooking.amount);
if(!Number.isFinite(amount)||amount<=0){
paymentMessage.textContent="Valid booking amount is required. Payment cannot continue.";
return;
}
if(currentBooking.status==="Paid"){
paymentMessage.textContent="This booking is already marked as paid.";
return;
}
try{
const bookings=getDemoBookings();
const index=bookings.findIndex(booking=>String(booking.booking_id)===bookingId);
if(index===-1){
paymentMessage.textContent="Booking not found.";
return;
}
bookings[index]={
...bookings[index],
status:"Paid",
payment_status:"Demo Paid",
payment_method:selectedMethod.value,
payment_id:"DEMO-PAY-"+Date.now(),
paid_at:new Date().toISOString()
};
localStorage.setItem("demoBookings",JSON.stringify(bookings));
localStorage.setItem("bookingData",JSON.stringify(bookings[index]));
currentBooking=bookings[index];
paymentMessage.textContent="Demo payment successful! No real money was charged. ✅";
paymentForm.querySelector('button[type="submit"]').disabled=true;
}catch(error){
console.error("Demo Payment Error:",error);
paymentMessage.textContent="Unable to save demo payment.";
}
});

loadBookingDetails();
