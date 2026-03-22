document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("login").addEventListener("click", async function () {

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("pass").value.trim();

        if (!email || !password) {
            alert("Please fill all fields!");
            return;
        }

        const data = { email, password };

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.text();

            if (result === "Login successful") {
                localStorage.setItem("userEmail", email);
                alert("Login successful!");
                window.location.href = "/Dashboard.html";
            } else {
                alert(result);
            }

        } catch (error) {
            alert("Server se connect nahi ho pa raha! Backend chalu hai?");
            console.error(error);
        }
    });
});