const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

form.addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const wallet = document.getElementById("wallet").value.trim();

  // Simple validation
  if (wallet.length < 26 || wallet.length > 62) {
    message.innerText = "❌ Invalid Bitcoin wallet address";
    return;
  }

  // Save user to localStorage (simulate database)
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    message.innerText = "❌ Email already registered";
    return;
  }

  users.push({ name, email, password, wallet, loans: [] });
  localStorage.setItem("users", JSON.stringify(users));

  message.innerText = "✅ Sign up successful! Redirecting...";
  
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});

