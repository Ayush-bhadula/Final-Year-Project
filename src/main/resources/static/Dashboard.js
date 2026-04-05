document.addEventListener("DOMContentLoaded", function () {


    const createBtn = document.querySelector("#createMeetingBtn");
    const joinBtn = document.querySelector("#joinMeetingBtn");

    const createModal = document.querySelector("#createModal");
    const joinModal = document.querySelector("#joinModal");

    console.log("Buttons:", createBtn, joinBtn);

    
    if (!createBtn || !joinBtn) {
        console.error("Buttons not found. Check IDs.");
        return;
    }

    
    createBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        createModal.classList.add("show");
    });

    joinBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        joinModal.classList.add("show");
    });

   
    document.addEventListener("click", function (e) {
        if (e.target === createModal) {
            createModal.classList.remove("show");
        }
        if (e.target === joinModal) {
            joinModal.classList.remove("show");
        }
    });

});