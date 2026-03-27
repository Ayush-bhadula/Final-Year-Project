document.getElementById("login").addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;

  // ✅ Basic validation
  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  const data = {
    email: email,
    password: password
  };

  try {
    const res = await fetch("https://final-year-project-production-a8ea.up.railway.app/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.text(); // or res.json()

    console.log(result);
    alert(result);

  } catch (error) {
    console.error(error);
    alert("Login failed");
  }
});