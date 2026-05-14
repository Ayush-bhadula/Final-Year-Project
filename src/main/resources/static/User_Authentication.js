document.getElementById("login").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("https://final-year-project-3-pn8n.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include" // Session cookie ke liye zaruri
    });

    if (res.ok) {
      // Ab /me se username lo
      const meRes = await fetch("https://final-year-project-3-pn8n.onrender.com/api/auth/me", {
        credentials: "include"
      });
      const meData = await meRes.json();
      localStorage.setItem("username", meData.userName || email);

      alert("Login successful");
      window.location.href = "Dashboard.html";
    } else {
      const result = await res.text();
      alert(result || "Invalid credentials");
    }

  } catch (error) {
    console.error(error);
    alert("Server error or CORS issue");
  }
});