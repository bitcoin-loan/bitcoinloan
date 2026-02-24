// ================= BTC PRICE =================
let btcPrice = 40000; // fallback
let btcBalance = 0;
let loan = 0;
let requiredBTC = 0;
let requestedLoan = 0;

// Fetch BTC price from CoinGecko every 30s
async function fetchBTCPrice() {
    try {
        let response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        let data = await response.json();
        btcPrice = data.bitcoin.usd;
    } catch (err) {
        btcPrice = 40000; // fallback
    }

    const btcElement = document.getElementById("btcPrice");
    if(btcElement){
        btcElement.innerText = "BTC Price: $" + btcPrice.toLocaleString();
    }
    updateLTV();
}
setInterval(fetchBTCPrice, 30000);
fetchBTCPrice();

// ================= LOGIN & REGISTER =================
function showRegister(){
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function register(){
    let name = document.getElementById("regName").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if(!name || !email || !password){
        alert("Fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if(users.find(u => u.email === email)){
        alert("User already exists");
        return;
    }

    users.push({
        name, email, password,
        btcBalance: 0,
        loan: 0,
        transactions: []
    });

    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created successfully!");
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email && u.password === password);
    if(!user){
        alert("Invalid login details");
        return;
    }

    localStorage.setItem("currentUser", email);
    window.location.href = "dashboard.html";
}

// ================= DASHBOARD DATA =================
function loadDashboard(){
    let currentEmail = localStorage.getItem("currentUser");
    if(!currentEmail) {
        window.location.href = "index.html";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentEmail);
    if(userIndex < 0){
        window.location.href = "index.html";
        return;
    }

    let currentUser = users[userIndex];
    btcBalance = currentUser.btcBalance || 0;
    loan = currentUser.loan || 0;

    const balanceEl = document.getElementById("btcBalance");
    if(balanceEl) balanceEl.innerText = btcBalance + " BTC";

    const loanEl = document.getElementById("activeLoan");
    if(loanEl) loanEl.innerText = "$" + loan.toFixed(2);

    updateLTV();
    startLoanTimerFromStorage();
}

// ================= WALLET =================
function copyWallet() {
    const copyText = document.getElementById("walletAddress");
    copyText.select();
    document.execCommand("copy");
    alert("Wallet Address Copied!");
}

// ================= DEPOSIT =================
function deposit(){
    let currentEmail = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentEmail);

    let input = parseFloat(document.getElementById("btcInput").value);
    if(!input) return alert("Enter BTC amount");

    btcBalance += input;
    users[userIndex].btcBalance = btcBalance;
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("btcBalance").innerText = btcBalance + " BTC";

    let eligible = (btcBalance * btcPrice) * 0.5;
    const eligibleEl = document.getElementById("loanEligible");
    if(eligibleEl) eligibleEl.innerText = "$" + eligible.toFixed(2);

    // ✅ Log transaction
    users[userIndex].transactions = users[userIndex].transactions || [];
    users[userIndex].transactions.push({
        type: "Deposit",
        amount: input + " BTC",
        date: new Date().toLocaleString()
    });
    localStorage.setItem("users", JSON.stringify(users));
}

// ================= LOAN =================
function calculateRequiredBTC(){
    requestedLoan = parseFloat(document.getElementById("loanRequest").value);
    if(!requestedLoan || requestedLoan <= 0) return alert("Enter loan amount");

    requiredBTC = (requestedLoan / 0.5) / btcPrice;
    document.getElementById("requiredBTC").innerText = "Required Collateral: " + requiredBTC.toFixed(6) + " BTC";
}

function confirmLoan(){
    if(!requestedLoan || requestedLoan <= 0) return alert("Enter loan amount first");
    if(btcBalance < requiredBTC) return alert("Insufficient BTC collateral. Deposit more BTC.");

    let duration = parseInt(document.getElementById("loanDuration").value);
    let interestRate = duration === 7 ? 0.05 : duration === 14 ? 0.08 : 0.12;

    loan = requestedLoan + (requestedLoan * interestRate);

    let currentEmail = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentEmail);

    users[userIndex].loan = loan;
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    startLoanTimer(duration);
    updateLTV();
    alert("Loan Approved! ✅");

    // ✅ Log transaction
    users[userIndex].transactions = users[userIndex].transactions || [];
    users[userIndex].transactions.push({
        type: "Loan Borrowed",
        amount: requestedLoan + " USD",
        date: new Date().toLocaleString()
    });
    localStorage.setItem("users", JSON.stringify(users));
}

// ================= REPAY =================
function repayLoan(){
    let currentEmail = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let userIndex = users.findIndex(u => u.email === currentEmail);

    let repay = parseFloat(document.getElementById("repayAmount").value);
    if(!repay || repay <= 0) return alert("Enter repayment amount");

    loan -= repay;

    // ✅ Log every repayment
    users[userIndex].transactions = users[userIndex].transactions || [];
    users[userIndex].transactions.push({
        type: "Loan Repaid",
        amount: repay + " USD",
        date: new Date().toLocaleString()
    });

    if(loan <= 0){
        loan = 0;
        document.getElementById("loanTimer").innerText = "";
        localStorage.removeItem("loanEndTime");
        alert("Loan Fully Repaid! 🎉");
    }

    users[userIndex].loan = loan;
    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    updateLTV();
}

// ================= LTV =================
function updateLTV(){
    if(!btcBalance || btcBalance <=0){
        document.getElementById("ltvPercent").innerText = "0%";
        document.getElementById("ltvWarning").innerText = "";
        return;
    }
    let ltv = (loan / (btcBalance * btcPrice)) * 100;
    document.getElementById("ltvPercent").innerText = ltv.toFixed(2) + "%";
    document.getElementById("ltvWarning").innerText = ltv > 70 ? "⚠ High Risk: Add BTC or repay loan!" : "";
}

// ================= LOAN TIMER =================
function startLoanTimer(durationDays){
    let now = new Date().getTime();
    let loanEndTime = now + durationDays * 24*60*60*1000;
    localStorage.setItem("loanEndTime", loanEndTime);
    updateTimer();
    setInterval(updateTimer, 60000);
}

function startLoanTimerFromStorage(){
    let loanEndTime = parseInt(localStorage.getItem("loanEndTime"));
    if(!loanEndTime) return;
    updateTimer();
    setInterval(updateTimer, 60000);
}

function updateTimer(){
    let loanEndTime = parseInt(localStorage.getItem("loanEndTime"));
    if(!loanEndTime) return;

    let now = new Date().getTime();
    let distance = loanEndTime - now;
    if(distance <= 0){
        document.getElementById("loanTimer").innerText = "Loan Expired!";
        return;
    }

    let days = Math.floor(distance / (1000*60*60*24));
    let hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
    document.getElementById("loanTimer").innerText = `Time Remaining: ${days}d ${hours}h`;
}

// ================= THEME =================
function toggleTheme(){
    document.body.classList.toggle("light-mode");
}

// ================= LOGOUT =================
function logout(){
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ================= INIT =================
if(window.location.href.includes("dashboard.html")){
    loadDashboard();
}
