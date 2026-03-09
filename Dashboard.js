// Load user info from localStorage
const name = localStorage.getItem("name") || "User";
const loanAmount = parseFloat(localStorage.getItem("loanAmount")) || 100;
const collateral = loanAmount * 0.10;

document.getElementById("userName").innerText = name;
document.getElementById("loanAmount").innerText = loanAmount.toFixed(2);
document.getElementById("collateralPaid").innerText = collateral.toFixed(2);
document.getElementById("remainingLoan").innerText = (loanAmount).toFixed(2);

// Set repayment due date 1 year from today
  const today = new Date();
  const dueDate = new Date(today.setFullYear(today.getFullYear() + 1));

  // Format the date nicely for display
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dueDate.toLocaleDateString(undefined, options);

  document.getElementById("repaymentDue").innerText = formattedDate;

  // Start countdown timer
  startRepaymentCountdown(dueDate);
}

// Countdown function
function startRepaymentCountdown(dueDate) {
  const countdownElem = document.createElement("p");
  countdownElem.id = "repaymentCountdown";
  countdownElem.style.fontWeight = "bold";
  countdownElem.style.color = "#f7931a";
  document.querySelector(".loan-summary").appendChild(countdownElem);

  const interval = setInterval(() => {
    const now = new Date();
    const diff = dueDate - now;

    if (diff <= 0) {
      countdownElem.innerText = "⚠️ Repayment Due Today!";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownElem.innerText = `⏳ Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

// Call this when dashboard loads
setRepaymentDue();

// Repayment progress
const repaymentProgress = document.getElementById("repaymentProgress");
let amountPaid = 0; // Initially 0

function updateRepaymentProgress() {
  const percent = (amountPaid / loanAmount) * 100;
  repaymentProgress.style.width = percent + "%";
  document.getElementById("remainingLoan").innerText = (loanAmount - amountPaid).toFixed(2);
}

// Open payment modal
function openPaymentModal() {
  document.getElementById("paymentModal").style.display = "flex";
}

// Close modal
function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none";
}

// Copy BTC address
function copyRepayAddress() {
  const address = document.getElementById("repayBtcAddress").innerText;
  navigator.clipboard.writeText(address);
  alert("✅ Address copied to clipboard!");
}

async function loadBTCPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const data = await res.json();
    const btcPrice = data.bitcoin.usd;
    document.getElementById("btcEquivalent").innerText = (loanAmount / btcPrice).toFixed(6);
    document.getElementById("btcPrice").innerText = `$${btcPrice.toLocaleString()}`;
  } catch (err) {
    document.getElementById("btcPrice").innerText = "Error fetching price";
    console.error(err);
  }
}
loadBTCPrice();

// Load loan data
const data = JSON.parse(localStorage.getItem("loanData"));

if (data) {
  document.getElementById("userName").innerText = data.name;
  document.getElementById("loanAmount").innerText = data.loan;
  document.getElementById("collateralPaid").innerText = data.collateral;
  document.getElementById("remainingLoan").innerText = data.loan - data.collateral;
  document.getElementById("btcEquivalent").innerText = data.btc;
}

// Withdrawal request
function requestWithdrawal() {

  const status = document.getElementById("withdrawStatus");
  const btn = document.getElementById("withdrawBtn");

  status.innerText = "⏳ Collateral payment is being verified...";
  btn.disabled = true;
  btn.innerText = "Verification in progress";

  // simulate verification delay
  setTimeout(() => {

    status.innerText = "✅ Collateral verified. Loan will be released shortly.";

    btn.innerText = "Processing Loan";

  }, 5000);

}
