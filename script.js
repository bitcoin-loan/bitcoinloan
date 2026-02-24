// ================= SUPABASE CONFIG =================
const SUPABASE_URL = "https://owulgpdukueqduvlurks.supabase.co";
const SUPABASE_KEY = "sb_publishable_2RI-unk9wI_AIEOlSUsbtA_Rwk6Tqdk";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= GLOBAL VARIABLES =================
let btcPrice = 40000; // fallback BTC price
let btcBalance = 0;
let loan = 0;
let requiredBTC = 0;
let requestedLoan = 0;

// ================= FETCH BTC PRICE =================
async function fetchBTCPrice() {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await response.json();
        btcPrice = data.bitcoin.usd;
    } catch (err) {
        btcPrice = 40000;
    }

    const btcEl = document.getElementById("btcPrice");
    if (btcEl) btcEl.innerText = "BTC Price: $" + btcPrice.toLocaleString();

    updateMaxBorrow();
    updateLTV();
}

// Fetch every 10 seconds
fetchBTCPrice();
setInterval(fetchBTCPrice, 30000);
function updateMaxBorrowDisplay() {
    // Max borrowable in BTC
    let maxBorrowBTC = 10; // change to your platform limit
    // USD approximation
    let maxBorrowUSD = maxBorrowBTC * btcPrice;

    const maxBorrowEl = document.getElementById("maxBorrow");
    if(maxBorrowEl){
        maxBorrowEl.innerText = `You can borrow up to ${maxBorrowBTC} BTC ~ $${maxBorrowUSD.toLocaleString()}`;
    }
}

// Call it whenever BTC price updates
setInterval(updateMaxBorrowDisplay, 5000);
updateMaxBorrowDisplay();
// ================= AUTH =================
function showRegister() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("registerBox").style.display = "none";
}

// Register a new user in Supabase
async function register() {
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!email || !password) return alert("Fill all fields");

    const { data, error } = await supabase
        .from("users")
        .insert([{ email, password, btc_balance: 0, loan: 0 }]);

    if (error) return alert("Registration failed: " + error.message);

    alert("Registration successful! ✅");
    showLogin();
}

// Login user (check Supabase table)
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password);

    if (error || !data || data.length === 0) return alert("Invalid login details");

    localStorage.setItem("currentUser", email);
    window.location.href = "dashboard.html";
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const currentEmail = localStorage.getItem("currentUser");
    if (!currentEmail) return window.location.href = "index.html";

    const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentEmail);

    if (error || !users || users.length === 0) return window.location.href = "index.html";

    const user = users[0];
    btcBalance = parseFloat(user.btc_balance) || 0;
    loan = parseFloat(user.loan) || 0;

    const balanceEl = document.getElementById("btcBalance");
    if (balanceEl) balanceEl.innerText = btcBalance.toFixed(6) + " BTC";

    const loanEl = document.getElementById("activeLoan");
    if (loanEl) loanEl.innerText = "$" + loan.toFixed(2);

    updateMaxBorrow();
    updateLTV();
    startLoanTimerFromStorage();

    loadTransactions();
}

// ================= TRANSACTIONS =================
async function loadTransactions() {
    const currentEmail = localStorage.getItem("currentUser");
    const { data: user } = await supabase
        .from("users")
        .select("transactions")
        .eq("email", currentEmail)
        .single();

    const container = document.getElementById("transactionList");
    if (!container) return;

    const transactions = user?.transactions || [];
    if (transactions.length === 0) {
        container.innerHTML = "<p>No transactions yet</p>";
        return;
    }

    container.innerHTML = "";
    transactions.forEach(tx => {
        container.innerHTML += `
        <div class="premium-card">
            <p>${tx.date} - ${tx.type} - ${tx.amount}</p>
        </div>`;
    });
}

// ================= DEPOSIT =================
async function deposit() {
    const input = parseFloat(document.getElementById("btcInput").value);
    if (!input || input <= 0) return alert("Enter BTC amount");

    const currentEmail = localStorage.getItem("currentUser");

    // Update Supabase
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentEmail)
        .single();

    if (error) return alert("Error fetching user: " + error.message);

    btcBalance += input;

    // Log transaction
    const transactions = user.transactions || [];
    transactions.push({
        type: "Deposit",
        amount: input + " BTC",
        date: new Date().toLocaleString()
    });

    const { error: updateErr } = await supabase
        .from("users")
        .update({ btc_balance: btcBalance, transactions })
        .eq("email", currentEmail);

    if (updateErr) return alert("Deposit failed: " + updateErr.message);

    document.getElementById("btcBalance").innerText = btcBalance.toFixed(6) + " BTC";

    updateMaxBorrow();
    updateLTV();
    loadTransactions();
}

// ================= MAX BORROW DISPLAY =================
function updateMaxBorrow() {
    const maxBTC = btcBalance * 0.5; // 50% LTV
    const maxBorrowEl = document.getElementById("maxBorrow");
    if (maxBorrowEl) maxBorrowEl.innerText = maxBTC.toFixed(6) + " BTC (~$" + (maxBTC * btcPrice).toFixed(2) + ")";
}

// ================= LOAN FUNCTIONS =================
function calculateRequiredBTC() {
    requestedLoan = parseFloat(document.getElementById("loanRequest").value);
    if (!requestedLoan || requestedLoan <= 0) return alert("Enter loan amount");

    requiredBTC = requestedLoan / 0.5 / btcPrice;
    document.getElementById("requiredBTC").innerText = "Required Collateral: " + requiredBTC.toFixed(6) + " BTC";
}

async function confirmLoan() {
    if (!requestedLoan || requestedLoan <= 0) return alert("Enter loan first");
    if (btcBalance < requiredBTC) return alert("Insufficient BTC collateral");

    const duration = parseInt(document.getElementById("loanDuration").value);
    const interestRate = duration === 7 ? 0.05 : duration === 14 ? 0.08 : 0.12;
    loan = requestedLoan + requestedLoan * interestRate;

    const currentEmail = localStorage.getItem("currentUser");

    // Fetch user to update
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentEmail)
        .single();

    if (error) return alert("Error fetching user: " + error.message);

    // Update loan and transactions
    const transactions = user.transactions || [];
    transactions.push({
        type: "Loan Borrowed",
        amount: requestedLoan + " USD",
        date: new Date().toLocaleString()
    });

    const { error: updateErr } = await supabase
        .from("users")
        .update({ loan, transactions })
        .eq("email", currentEmail);

    if (updateErr) return alert("Loan approval failed: " + updateErr.message);

    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    startLoanTimer(duration);
    updateLTV();
    loadTransactions();

    alert("Loan approved! ✅");
}

// ================= REPAY LOAN =================
async function repayLoan() {
    const repay = parseFloat(document.getElementById("repayAmount").value);
    if (!repay || repay <= 0) return alert("Enter repayment amount");

    const currentEmail = localStorage.getItem("currentUser");
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", currentEmail)
        .single();

    if (error) return alert("Error fetching user: " + error.message);

    loan -= repay;
    const transactions = user.transactions || [];
    transactions.push({
        type: "Loan Repaid",
        amount: repay + " USD",
        date: new Date().toLocaleString()
    });

    const { error: updateErr } = await supabase
        .from("users")
        .update({ loan, transactions })
        .eq("email", currentEmail);

    if (updateErr) return alert("Repayment failed: " + updateErr.message);

    document.getElementById("activeLoan").innerText = "$" + loan.toFixed(2);
    updateLTV();
    loadTransactions();

    if (loan <= 0) {
        document.getElementById("loanTimer").innerText = "";
        alert("Loan fully repaid! 🎉");
        localStorage.removeItem("loanEndTime");
    }
}

// ================= LTV =================
function updateLTV() {
    if (!btcBalance || btcBalance <= 0) {
        document.getElementById("ltvPercent").innerText = "0%";
        document.getElementById("ltvWarning").innerText = "";
        return;
    }
    const ltv = (loan / (btcBalance * btcPrice)) * 100;
    document.getElementById("ltvPercent").innerText = ltv.toFixed(2) + "%";
    document.getElementById("ltvWarning").innerText = ltv > 70 ? "⚠ High Risk: Add BTC or repay loan!" : "";
}

// ================= LOAN TIMER =================
function startLoanTimer(durationDays) {
    const now = new Date().getTime();
    const loanEndTime = now + durationDays * 24 * 60 * 60 * 1000;
    localStorage.setItem("loanEndTime", loanEndTime);
    updateTimer();
    setInterval(updateTimer, 60000);
}

function startLoanTimerFromStorage() {
    if (!localStorage.getItem("loanEndTime")) return;
    updateTimer();
    setInterval(updateTimer, 60000);
}

function updateTimer() {
    const loanEndTime = parseInt(localStorage.getItem("loanEndTime"));
    if (!loanEndTime) return;

    const distance = loanEndTime - new Date().getTime();
    if (distance <= 0) {
        document.getElementById("loanTimer").innerText = "Loan Expired!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById("loanTimer").innerText = `Time Remaining: ${days}d ${hours}h`;
}

// ================= THEME =================
function toggleTheme() {
    document.body.classList.toggle("light-mode");
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ================= INIT =================
if (window.location.href.includes("dashboard.html")) loadDashboard();
if (window.location.href.includes("transactions.html")) loadDashboard();
