// ================= BTC PRICE =================
let btcPrice = 40000;

async function fetchBTCPrice() {
    try {
        let response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        let data = await response.json();
        btcPrice = data.bitcoin.usd;

        let priceElement = document.getElementById("btcPrice");
        if(priceElement){
            priceElement.innerText = "BTC Price: $" + btcPrice;
        }

    } catch (error) {
        btcPrice = 40000;
    }
}

fetchBTCPrice();


// ================= LOGIN =================
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


// ================= REGISTER =================
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


// ================= WALLET =================
function generateWallet(){
    let chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let address = "1";
    for(let i=0;i<33;i++){
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    alert("Deposit BTC to this address:\n\n" + address);
}

function copyWallet(){
    let copyText = document.getElementById("walletAddress");
    copyText.select();
    document.execCommand("copy");
    alert("Wallet Address Copied!");
}


// ================= THEME =================
function toggleTheme(){
    document.body.classList.toggle("light-mode");
}