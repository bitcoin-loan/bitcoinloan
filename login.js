const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", function(e){
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    message.innerText = "❌ Invalid email or password";
    return;
  }

  // Save current user to localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));

  message.innerText = "✅ Login successful! Redirecting...";
  
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1200);
});

