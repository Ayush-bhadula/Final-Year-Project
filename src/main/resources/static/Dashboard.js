document.addEventListener("DOMContentLoaded", () => {

    const createBtn = document.getElementById("createMeetingBtn");
    const joinBtn = document.getElementById("joinMeetingBtn");

    const createModal = document.getElementById("createModal");
    const joinModal = document.getElementById("joinModal");

    createBtn.addEventListener("click", () => {
        createModal.classList.add("show");
    });

    joinBtn.addEventListener("click", () => {
        joinModal.classList.add("show");
    });

    window.addEventListener("click", (e) => {
        if (e.target === createModal) {
            createModal.classList.remove("show");
        }
        if (e.target === joinModal) {
            joinModal.classList.remove("show");
        }
    });

});