document.addEventListener("DOMContentLoaded", function () {

    const createBtn = document.querySelector("#createMeetingBtn");
    const joinBtn = document.querySelector("#joinMeetingBtn");

    const createModal = document.querySelector("#createModal");
    const joinModal = document.querySelector("#joinModal");

    const createInput = document.querySelector("#createMeetingName");
    const joinInput = document.querySelector("#joinMeetingCode");

    const startMeetingBtn = document.querySelector("#startMeetingBtn");
    const joinNowBtn = document.querySelector("#joinNowBtn");

    function generateMeetingId() {
        return Math.random().toString(36).substring(2, 8);
    }

    createBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const meetingId = generateMeetingId();
        createInput.value = meetingId;
        createModal.classList.add("show");
    });

    joinBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        joinModal.classList.add("show");
    });

    startMeetingBtn.addEventListener("click", function () {
        const code = createInput.value.trim();
        if (!code) return;
        window.location.href = "MeetScribe.html";
    });

    joinNowBtn.addEventListener("click", function () {
        const code = joinInput.value.trim();
        if (!code) {
            alert("Please enter a meeting code");
            return;
        }
        window.location.href = "MeetScribe.html";
    });

    document.addEventListener("click", function (e) {
        if (e.target === createModal) createModal.classList.remove("show");
        if (e.target === joinModal) joinModal.classList.remove("show");
    });

});