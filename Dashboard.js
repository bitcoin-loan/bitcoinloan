// Load loan data once
const data = JSON.parse(localStorage.getItem("loanData")) || {};
const name = data.name || "User";
const loanAmount = parseFloat(data.loan) || 100;
const collateral = parseFloat(data.collateral) || loanAmount * 0.10;
const collateralVerified = data.collateralVerified || false;

document.getElementById("userName").innerText = name;

// Update all sections
function updateDashboard() {
  document.getElementById("loanSummaryAmount").innerText = loanAmount.toFixed(2);
  document.getElementById("loanSummaryCollateral").innerText = collateral.toFixed(2);
  document.getElementById("loanSummaryRemaining").innerText = (loanAmount - collateral).toFixed(2);
  document.getElementById("loanSummaryBTC").innerText = data.btc || "0";

  document.getElementById("cardCollateralPaid").innerText = collateral.toFixed(2);
  document.getElementById("cardRemainingLoan").innerText = (loanAmount - collateral).toFixed(2);
  document.getElementById("cardBTCEquivalent").innerText = data.btc || "0";
  document.getElementById("cardRepaymentDue").innerText = getFormattedDueDate();

  document.getElementById("tableLoanAmount").innerText = loanAmount.toFixed(2);
  document.getElementById("tableCollateralPaid").innerText = collateral.toFixed(2);

  document.getElementById("balanceLoanAmount").innerText = (loanAmount - collateral).toFixed(2);

  // Withdraw button status
  const btn = document.getElementById("withdrawBtn");
  const status = document.getElementById("withdrawStatus");
  if (collateralVerified) {
    status.innerText = "✅ Collateral verified. Loan can be withdrawn.";
    btn.disabled = false;
  } else {
    status.innerText = "⏳ Collateral verification pending.";
    btn.disabled = false;
  }
}
updateDashboard();

// Repayment due date
function getFormattedDueDate() {
  const today = new Date();
  const dueDate = new Date(today.setFullYear(today.getFullYear() + 1));
  return dueDate.toLocaleDateString(undefined, {year:'numeric', month:'long', day:'numeric'});
}

// Countdown
function startRepaymentCountdown() {
  const countdownElem = document.getElementById("repaymentCountdown");
  if (!countdownElem) return;

  const interval = setInterval(() => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setFullYear(dueDate.getFullYear() + 1);

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

// Withdraw loan
function withdrawLoan(){
  const btn = document.getElementById("withdrawBtn");
  const status = document.getElementById("withdrawStatus");

  if (data.collateralVerified) {
    status.innerText = "✅ Collateral verified. Processing withdrawal...";
    alert("Your loan is being processed.");
    btn.disabled = true;
  } else {
    status.innerText = "⏳ Collateral is being verified.";
    alert("Please wait while we verify your collateral.");
  }
}

// BTC Price
async function loadBTCPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const json = await res.json();
    const btcPrice = json.bitcoin.usd;
    if (btcPrice) {
      document.getElementById("loanSummaryBTC").innerText = (loanAmount / btcPrice).toFixed(6);
      document.getElementById("btcPrice").innerText = `$${btcPrice.toLocaleString()}`;
    }
  } catch (err) {
    document.getElementById("btcPrice").innerText = "Error fetching price";
  }
}
loadBTCPrice();
