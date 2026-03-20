document.addEventListener("DOMContentLoaded",()=>{
    const selectdrop = document.querySelector('#countries');
    fetch('https://restcountries.com/v3.1/all?fields=name').then(res=>{
        return res.json();
    }).then(data=>{
        
        let output = `<option value="" disabled selected>Select Country</option>`;
        data.forEach(country => {
            output = output + `<option>${country.name.common}</option>`
            
        });
        selectdrop.innerHTML = output;
    }).catch(err=>{

        console.log(err);
    })
})