let btcPrice = 40000; // Static price simulation

function showLogin() {
    document.getElementById("loginBox").style.display = "block";
}

function login(){

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email && u.password === password);

    if(user){
        localStorage.setItem("currentUser", email);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid login details");
    }
}

let btcPrice = 0;

async function fetchBTCPrice() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        let data = await response.json();
        btcPrice = data.bitcoin.usd;
        document.getElementById("btcPrice").innerText = "BTC Price: $" + btcPrice;
    } catch (error) {
        document.getElementById("btcPrice").innerText = "BTC Price: $40,000";
        btcPrice = 40000;
    }
}

fetchBTCPrice();

let btcPrice = 0;

async function fetchBTCPrice() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        let data = await response.json();
        btcPrice = data.bitcoin.usd;

        let priceElement = document.getElementById("btcPrice");
        if(priceElement){
            priceElement.innerText = "BTC Price: $" + btcPrice;
        }

    } catch (error) {
        btcPrice = 40000;
        let priceElement = document.getElementById("btcPrice");
        if(priceElement){
            priceElement.innerText = "BTC Price: $40,000";
        }
    }
}

fetchBTCPrice();

function generateWallet(){
    let chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let address = "1";
    for(let i=0;i<33;i++){
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    alert("Deposit BTC to this address:\n\n" + address);
}

function toggleTheme(){
    document.body.classList.toggle("light-mode");
}

function showRegister(){
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

    let existingUser = users.find(user => user.email === email);
    if(existingUser){
        alert("User already exists");
        return;
    }

    users.push({
        name: name,
        email: email,
        password: password,
        btcBalance: 0,
        loan: 0,
        transactions: []
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully!");
}
users[userIndex].loan = loan;
localStorage.setItem("users", JSON.stringify(users));

function confirmLoan(){

    if(btcBalance < requiredBTC){
        alert("Insufficient BTC collateral. Please deposit required amount.");
        return;
    }

    let duration = document.getElementById("loanDuration").value;

    let interestRate = 0;
    if(duration == 7) interestRate = 0.05;
    if(duration == 14) interestRate = 0.08;
    if(duration == 30) interestRate = 0.12;

    let totalLoan = requestedLoan + (requestedLoan * interestRate);

    loan = totalLoan;

    users[userIndex].loan = loan;
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("activeLoan").innerText =
    "$" + totalLoan.toFixed(2);

    startLoanTimer(duration);

    alert("Loan Approved Successfully!");
}

function copyWallet(){
    let copyText = document.getElementById("walletAddress");
    copyText.select();
    document.execCommand("copy");
    alert("Wallet Address Copied!");
}