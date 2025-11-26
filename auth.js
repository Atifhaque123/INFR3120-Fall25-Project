async function updateNav() {
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");

  if (!loginLink || !registerLink || !logoutLink) return;

  try {
    const res = await fetch("/session-status", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      loginLink.style.display = "none";
      registerLink.style.display = "none";
      logoutLink.style.display = "inline";
    } else {
      loginLink.style.display = "inline";
      registerLink.style.display = "inline";
      logoutLink.style.display = "none";
    }
  } catch (err) {
    console.log("nav error:", err);
  }
}

async function loginUser() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!username || !password) {
    msg.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Login failed.";
      return;
    }

    alert("Login successful.");
    window.location.href = "index.html";
  } catch (err) {
    console.log("login error:", err);
  }
}

async function registerUser() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const msg = document.getElementById("regMsg");

  if (!username || !password) {
    msg.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Error registering.";
      return;
    }

    alert("Registered successfully! Please log in.");
    window.location.href = "login.html";
  } catch (err) {
    console.log("register error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNav();

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch("/logout", { credentials: "include" });
      window.location.href = "login.html";
    });
  }

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", loginUser);
  }

  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", registerUser);
  }
});
