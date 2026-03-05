function scrollToForm() {
  document.getElementById("loanForm").scrollIntoView({
    behavior: "smooth"
  });
}

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const wallet = document.getElementById("wallet").value;

  if (wallet.length < 26 || wallet.length > 62) {
    document.getElementById("message").innerText =
      "❌ Invalid Bitcoin wallet address";
    return;
  }
  
  document.getElementById("message").innerText =
    "✅ Request received! Check your email shortly.";
});

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

  // Pick random message
  const randomMsg = liveMessages[Math.floor(Math.random() * liveMessages.length)];
  text.innerText = randomMsg;

  // Show
  box.style.display = "block";

  // Hide after 4 seconds
  setTimeout(() => {
    box.style.display = "none";
  }, 4000);
}

// Repeat every few seconds
setInterval(() => {
  showLivePopup();
}, 8000);

// Elements
const loanSlider = document.getElementById("loanSlider");
const loanAmountDisplay = document.getElementById("loanAmountDisplay");
const collateralResult = document.getElementById("collateralResult");

// Function to fetch BTC price
async function getBTCPrice() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error("Failed to fetch BTC price:", error);
    return null;
  }
}

// Update collateral display
async function updateCollateral() {
  const btcPrice = await getBTCPrice();
  const loanAmount = parseFloat(loanSlider.value);
  loanAmountDisplay.innerText = loanAmount;

  if (!btcPrice) {
    collateralResult.innerText = `💰 Collateral: $${(loanAmount * 0.10).toFixed(2)} (~BTC price unavailable)`;
    return;
  }

  const collateralUSD = loanAmount * 0.10;
  const collateralBTC = collateralUSD / btcPrice;

  collateralResult.innerText = `💰 Collateral: $${collateralUSD.toFixed(2)} (~${collateralBTC.toFixed(6)} BTC)`;
}

// Initial update
updateCollateral();

// Update whenever slider moves
loanSlider.addEventListener("input", updateCollateral);

const testimonials = document.querySelectorAll(".testimonial");
let currentTestimonial = 0;

function showTestimonial(index) {
  testimonials.forEach((t, i) => {
    t.classList.remove("active");
    if (i === index) t.classList.add("active");
  });
}

// Initial display
showTestimonial(currentTestimonial);

// Auto rotate every 5 seconds
setInterval(() => {
  currentTestimonial++;
  if (currentTestimonial >= testimonials.length) currentTestimonial = 0;
  showTestimonial(currentTestimonial);
}, 5000);

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    const isVisible = answer.style.display === "block";

    // Hide all answers first
    document.querySelectorAll(".faq-answer").forEach(a => a.style.display = "none");

    // Toggle current
    answer.style.display = isVisible ? "none" : "block";
  });
});

function goToPayment() {
  window.location.href = "payment.html";
}

function saveAndGoToPayment() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  // 👉 USE SLIDER VALUE (not input)
  const loanAmount = document.getElementById("loanSlider").value;

  const wallet = document.getElementById("wallet").value;

  if (!loanAmount || loanAmount <= 0) {
    alert("Please select a loan amount");
    return;
  }

  // Save
  localStorage.setItem("name", name);
  localStorage.setItem("email", email);
  localStorage.setItem("loanAmount", loanAmount);
  localStorage.setItem("wallet", wallet);

  // Go to payment page
  window.location.href = "payment.html";
}

function toggleChat() {
  const chat = document.getElementById("chatBox");
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
  const input = document.getElementById("userMessage");
  const chatBody = document.getElementById("chatBody");

  const message = input.value.trim();
  if (!message) return;

  // Show user message
  const userMsg = document.createElement("p");
  userMsg.className = "user";
  userMsg.innerText = message;
  chatBody.appendChild(userMsg);

  input.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;

  // Typing indicator
  const typing = document.createElement("p");
  typing.className = "bot typing";
  typing.innerText = "Typing...";
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Smart reply
  setTimeout(() => {
    typing.remove();

    const botMsg = document.createElement("p");
    botMsg.className = "bot";

    const msg = message.toLowerCase();

    if (msg.includes("loan") || msg.includes("borrow")) {
      botMsg.innerText = "To get a Bitcoin loan, simply fill the form, choose your amount, and proceed to pay the 10% collateral.";
    } 
    else if (msg.includes("collateral")) {
      botMsg.innerText = "Collateral is 10% of your loan. It ensures fast approval and is required before receiving your Bitcoin.";
    } 
    else if (msg.includes("payment") || msg.includes("pay")) {
      botMsg.innerText = "After clicking Pay Collateral, send BTC to the provided address and upload your receipt.";
    } 
    else if (msg.includes("time") || msg.includes("how long")) {
      botMsg.innerText = "Most loans are processed within a few minutes after payment confirmation.";
    } 
    else if (msg.includes("safe") || msg.includes("trust")) {
      botMsg.innerText = "Yes, all transactions are secured and encrypted for your safety.";
    } 
    else if (msg.includes("wallet")) {
      botMsg.innerText = "Make sure you enter the correct Bitcoin wallet address. That’s where your loan will be sent.";
    } 
    else {
      botMsg.innerText = "I can help you with loans, payments, or collateral. You can also chat with us on WhatsApp for faster support.";
    }

    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 1200);
}

document.getElementById("userMessage").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function quickMsg(text) {
  document.getElementById("userMessage").value = text;
  sendMessage();
}