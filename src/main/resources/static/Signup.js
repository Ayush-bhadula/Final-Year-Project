document.addEventListener("DOMContentLoaded",()=>{
    const selectdrop = document.querySelector('#countries');
    fetch('https://restcountries.com/v3.1/all?fields=name').then(res=>{
        return res.json();
    }).then(data=>{
        let output = `<option value="" disabled selected>Select Country</option>`;
        data.forEach(country => {
            output += `<option>${country.name.common}</option>`
        });
        selectdrop.innerHTML = output;
    }).catch(err=>{
        console.log(err);
    })
})

document.getElementById("signupBtn").addEventListener("click", async () => {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;
    const country = document.getElementById("countries").value;

    if (!name || !email || !username || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const data = { name, email, username, password, country };

    try {
        const res = await fetch("http://localhost:8080/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.text();

        if (result === "Signup successful!") {
            alert("✅ Signup successful! Please login.");
            window.location.href = "login.html"; // ✅ Login page pe bhejo
        } else {
            alert(result); // Email already exists etc.
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Is your server running?");
    }
});