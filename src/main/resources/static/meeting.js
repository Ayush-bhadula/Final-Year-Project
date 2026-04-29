const params = new URLSearchParams(window.location.search);

const roomId = params.get("room");
const userId = params.get("user");

if (!roomId || !userId) {
    alert("Invalid meeting link");
    window.location.href = "Dashboard.html";
}


const roomCodeText = document.getElementById("roomCodeText");
const videoContainer = document.getElementById("videoContainer");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const leaveBtn = document.getElementById("leaveBtn");
const logoutBtn = document.getElementById("logoutBtn");

const micIcon = document.getElementById("micIcon");
const camIcon = document.getElementById("camIcon");

roomCodeText.innerText = "Room: " + roomId;

let localStream = null;
let peers = {};
let socket = null;

const micOnSVG = `
<path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
<line x1="12" y1="19" x2="12" y2="23"/>
<line x1="8" y1="23" x2="16" y2="23"/>
`;

const micOffSVG = `
<line x1="1" y1="1" x2="23" y2="23"/>
<path d="M9 9v3a3 3 0 0 0 5 2"/>
`;

const camOnSVG = `
<rect x="3" y="7" width="15" height="10" rx="2"/>
<polygon points="16 7 22 12 16 17 16 7"/>
`;

const camOffSVG = `
<line x1="1" y1="1" x2="23" y2="23"/>
<rect x="3" y="7" width="15" height="10" rx="2"/>
`;

micIcon.innerHTML = micOnSVG;
camIcon.innerHTML = camOnSVG;

async function startMedia() {
    try {
        videoContainer.innerHTML = "<p style='color:white'>Starting camera...</p>";

        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        videoContainer.innerHTML = "";
        addVideo(localStream, "local");

    } catch (err) {
        alert("Camera/Mic permission denied");
    }
}

startMedia();

function addVideo(stream, id) {
    
    if (document.getElementById(id)) return;

    const video = document.createElement("video");

    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = id === "local"; 
    video.id = id;

    videoContainer.appendChild(video);
}

micBtn.onclick = () => {
    if (!localStream) return;

    const track = localStream.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    micIcon.innerHTML = track.enabled ? micOnSVG : micOffSVG;
};

camBtn.onclick = () => {
    if (!localStream) return;

    const track = localStream.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    camIcon.innerHTML = track.enabled ? camOnSVG : camOffSVG;
};

function stopMedia() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
}

leaveBtn.onclick = () => {
    stopMedia();
    window.location.href = "Dashboard.html";
};

logoutBtn.onclick = () => {
    stopMedia();
    window.location.href = "Dashboard.html";
};

function connectToBackend() {
    console.log("Ready to connect to backend...");
}

function joinRoom() {
    console.log("Joining room:", roomId, "User:", userId);
}

connectToBackend();
joinRoom();