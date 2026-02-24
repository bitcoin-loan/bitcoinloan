// ================= SUPABASE CONFIG =================
const SUPABASE_URL = "https://owulgpdukueqduvlurks.supabase.co";
const SUPABASE_KEY = "sb_publishable_2RI-unk9wI_AIEOlSUsbtA_Rwk6Tqdk";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= BTC PRICE =================
let btcPrice = 40000; // fallback
let btcBalance = 0;
let loan = 0;
let requiredBTC = 0;
let requestedLoan = 0;

// Fetch BTC price from CoinGecko
async function fetchBTCPrice() {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await response.json();
        btcPrice = data.bitcoin.usd;
    } catch {
        btcPrice = 40000;
    }
    const btcElement = document.getElementById("btcPrice");
    if(btcElement) btcElement.innerText = "BTC Price: $" + btcPrice.toLocaleString();
    updateLTV();
    updateMaxBorrow();
}
setInterval(fetchBTCPrice, 30000);
fetchBTCPrice();

// ================= LOGIN & REGISTER =================
async function register() {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if(!email || !password) return alert("Fill all fields");

    const { data, error } = await supabase
        .from("users")
        .insert([{ email, password, btc_balance: 0, loan: 0 }]);

    if(error) return alert("Registration failed: " + error.message);
    alert("Registration successful ✅");
    window.location.href = "index.html";
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(!email || !password) return alert("Enter email & password");

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if(error || !data) return alert("Invalid login details");

    localStorage.setItem("currentUser", JSON.stringify(data));
    window.location.href = "dashboard.html";
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser) return window.location.href = "index.html";

    // Get fresh data
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentUser.email)
        .single();

    if(error || !data) return alert("Failed to load dashboard");

    btcBalance = data.btc_balance || 0;
    loan = data.loan || 0;

    document.getElementById("btcBalance").innerText = btcBalance + " BTC";
    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);

    updateLTV();
    updateMaxBorrow();
    startLoanTimerFromStorage();
}

// ================= MAX BORROWABLE =================
function updateMaxBorrow() {
    const maxBorrowBTC = btcBalance * 0.5; // 50% LTV
    const maxBorrowEl = document.getElementById("maxBorrow");
    if(maxBorrowEl) maxBorrowEl.innerText = maxBorrowBTC.toFixed(6) + " BTC";
}

// ================= DEPOSIT =================
async function deposit() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let input = parseFloat(document.getElementById("btcInput").value);
    if(!input) return alert("Enter BTC amount");

    btcBalance += input;

    // Update Supabase
    const { error } = await supabase
        .from("users")
        .update({ btc_balance: btcBalance })
        .eq("email", currentUser.email);

    if(error) return alert("Deposit failed: " + error.message);

    document.getElementById("btcBalance").innerText = btcBalance + " BTC";
    updateMaxBorrow();
}

// ================= LOAN =================
function calculateRequiredBTC() {
    requestedLoan = parseFloat(document.getElementById("loanRequest").value);
    if(!requestedLoan || requestedLoan <= 0) return alert("Enter loan amount");

    requiredBTC = (requestedLoan / 0.5) / btcPrice;
    document.getElementById("requiredBTC").innerText =
        "Required Collateral: " + requiredBTC.toFixed(6) + " BTC";
}

async function confirmLoan() {
    if(!requestedLoan || requestedLoan <= 0) return alert("Enter loan amount first");
    if(btcBalance < requiredBTC) return alert("Insufficient BTC collateral");

    const duration = parseInt(document.getElementById("loanDuration").value);
    const interestRate = duration === 7 ? 0.05 : duration === 14 ? 0.08 : 0.12;

    loan = requestedLoan + (requestedLoan * interestRate);

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const { error } = await supabase
        .from("users")
        .update({ loan })
        .eq("email", currentUser.email);

    if(error) return alert("Loan approval failed");

    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    startLoanTimer(duration);
    updateLTV();
    updateMaxBorrow();
    alert("Loan Approved ✅");
}

// ================= REPAY =================
async function repayLoan() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let repay = parseFloat(document.getElementById("repayAmount").value);
    if(!repay || repay <= 0) return alert("Enter repayment amount");

    loan -= repay;
    if(loan < 0) loan = 0;

    const { error } = await supabase
        .from("users")
        .update({ loan })
        .eq("email", currentUser.email);

    if(error) return alert("Repayment failed");

    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    updateLTV();
    updateMaxBorrow();

    if(loan === 0){
        localStorage.removeItem("loanEndTime");
        document.getElementById("loanTimer").innerText = "";
        alert("Loan Fully Repaid 🎉");
    }
}

// ================= LTV =================
function updateLTV() {
    if(!btcBalance || btcBalance <= 0){
        document.getElementById("ltvPercent").innerText = "0%";
        document.getElementById("ltvWarning").innerText = "";
        return;
    }

    const ltv = (loan / (btcBalance * btcPrice)) * 100;
    document.getElementById("ltvPercent").innerText = ltv.toFixed(2) + "%";
    document.getElementById("ltvWarning").innerText = ltv > 70 ? "⚠ High Risk!" : "";
}

// ================= LOAN TIMER =================
function startLoanTimer(durationDays){
    const now = new Date().getTime();
    const loanEndTime = now + durationDays*24*60*60*1000;
    localStorage.setItem("loanEndTime", loanEndTime);
    updateTimer();
    setInterval(updateTimer, 60000);
}

function startLoanTimerFromStorage(){
    if(localStorage.getItem("loanEndTime")){
        updateTimer();
        setInterval(updateTimer, 60000);
    }
}

function updateTimer(){
    const loanEndTime = parseInt(localStorage.getItem("loanEndTime"));
    if(!loanEndTime) return;

    const distance = loanEndTime - new Date().getTime();
    if(distance <= 0){
        document.getElementById("loanTimer").innerText = "Loan Expired!";
        return;
    }

    const days = Math.floor(distance / (1000*60*60*24));
    const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
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
