document.getElementById("login").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  const data = { email, password };

  try {
    const res = await fetch("https://thirdlast.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.text();

    console.log("Response:", result);

    if (res.ok) {
      
      alert("Login successful");
      window.location.href = "Dashboard.html";
    } else {
     
      alert(result || "Invalid credentials");
    }

  } catch (error) {
    console.error(error);
    alert("Server error or CORS issue");
  }
});