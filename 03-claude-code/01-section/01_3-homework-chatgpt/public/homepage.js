const hour = new Date().getHours();
let greeting = "Good evening";
if (hour < 12) greeting = "Good morning";
else if (hour < 18) greeting = "Good afternoon";

document.querySelector(".hero-text h1").textContent = `${greeting}! Welcome to our little website`;
