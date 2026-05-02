// const params = new URLSearchParams(window.location.search);

// const roomId = params.get("room");
// const userId = params.get("user");

// if (!roomId || !userId) {
//     alert("Invalid meeting link");
//     window.location.href = "Dashboard.html";
// }


// const roomCodeText = document.getElementById("roomCodeText");
// const videoContainer = document.getElementById("videoContainer");

// const micBtn = document.getElementById("micBtn");
// const camBtn = document.getElementById("camBtn");
// const leaveBtn = document.getElementById("leaveBtn");
// const logoutBtn = document.getElementById("logoutBtn");

// const micIcon = document.getElementById("micIcon");
// const camIcon = document.getElementById("camIcon");

// roomCodeText.innerText = "Room: " + roomId;

// let localStream = null;
// let peers = {};
// let socket = null;

// const micOnSVG = `
// <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
// <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
// <line x1="12" y1="19" x2="12" y2="23"/>
// <line x1="8" y1="23" x2="16" y2="23"/>
// `;

// const micOffSVG = `
// <line x1="1" y1="1" x2="23" y2="23"/>
// <path d="M9 9v3a3 3 0 0 0 5 2"/>
// `;

// const camOnSVG = `
// <rect x="3" y="7" width="15" height="10" rx="2"/>
// <polygon points="16 7 22 12 16 17 16 7"/>
// `;

// const camOffSVG = `
// <line x1="1" y1="1" x2="23" y2="23"/>
// <rect x="3" y="7" width="15" height="10" rx="2"/>
// `;

// micIcon.innerHTML = micOnSVG;
// camIcon.innerHTML = camOnSVG;

// async function startMedia() {
//     try {
//         videoContainer.innerHTML = "<p style='color:white'>Starting camera...</p>";

//         localStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });

//         videoContainer.innerHTML = "";
//         addVideo(localStream, "local");

//     } catch (err) {
//         alert("Camera/Mic permission denied");
//     }
// }

// startMedia();

// function addVideo(stream, id) {
    
//     if (document.getElementById(id)) return;

//     const video = document.createElement("video");

//     video.srcObject = stream;
//     video.autoplay = true;
//     video.playsInline = true;
//     video.muted = id === "local"; 
//     video.id = id;

//     videoContainer.appendChild(video);
// }

// micBtn.onclick = () => {
//     if (!localStream) return;

//     const track = localStream.getAudioTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     micIcon.innerHTML = track.enabled ? micOnSVG : micOffSVG;
// };

// camBtn.onclick = () => {
//     if (!localStream) return;

//     const track = localStream.getVideoTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     camIcon.innerHTML = track.enabled ? camOnSVG : camOffSVG;
// };

// function stopMedia() {
//     if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//     }
// }

// leaveBtn.onclick = () => {
//     stopMedia();
//     window.location.href = "Dashboard.html";
// };

// logoutBtn.onclick = () => {
//     stopMedia();
//     window.location.href = "Dashboard.html";
// };

// function connectToBackend() {
//     console.log("Ready to connect to backend...");
// }

// function joinRoom() {
//     console.log("Joining room:", roomId, "User:", userId);
// }

// connectToBackend();
// joinRoom();

// let socket;

// function connectToBackend() {
//     socket = new WebSocket("wss://final-year-project-3-pn8n.onrender.com/signal");

//     socket.onopen = () => {
//         console.log("Connected to backend");

//         // join room
//         socket.send(JSON.stringify({
//             type: "join-room",
//             roomId,
//             userId
//         }));
//     };

//     socket.onmessage = handleMessage;
// }
// function handleMessage(event) {
//     const data = JSON.parse(event.data);
//     console.log("Message:", data);

//     if (data.type === "user-joined") {
//         handleUserJoined(data.userId);
//     }

//     if (data.type === "offer") {
//         handleOffer(data);
//     }

//     if (data.type === "answer") {
//         handleAnswer(data);
//     }

//     if (data.type === "ice-candidate") {
//         handleIceCandidate(data);
//     }
// }
// function createPeer(otherUserId) {
//     const peer = new RTCPeerConnection({
//         iceServers: [
//             { urls: "stun:stun.l.google.com:19302" }
//         ]
//     });

//     // send ICE candidates
//     peer.onicecandidate = (event) => {
//         if (event.candidate) {
//             socket.send(JSON.stringify({
//                 type: "ice-candidate",
//                 to: otherUserId,
//                 from: userId,
//                 candidate: event.candidate
//             }));
//         }
//     };

//     // receive video
//     peer.ontrack = (event) => {
//         addVideo(event.streams[0], otherUserId);
//     };

//     // send local stream
//     localStream.getTracks().forEach(track => {
//         peer.addTrack(track, localStream);
//     });

//     return peer;
// }
// async function handleUserJoined(otherUserId) {
//     const peer = createPeer(otherUserId);
//     peers[otherUserId] = peer;

//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     socket.send(JSON.stringify({
//         type: "offer",
//         to: otherUserId,
//         from: userId,
//         offer
//     }));
// }

// async function handleOffer(data) {
//     const peer = createPeer(data.from);
//     peers[data.from] = peer;

//     await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);

//     socket.send(JSON.stringify({
//         type: "answer",
//         to: data.from,
//         from: userId,
//         answer
//     }));
// }

// async function handleAnswer(data) {
//     const peer = peers[data.from];
//     await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
// }

// async function handleIceCandidate(data) {
//     const peer = peers[data.from];
//     if (peer) {
//         await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
// }
// connectToBackend();
// const params = new URLSearchParams(window.location.search);

// const roomId = params.get("room");
// const userId = params.get("user");

// // Safety check
// if (!roomId || !userId) {
//     alert("Invalid meeting link");
//     window.location.href = "Dashboard.html";
// }

// // DOM
// const roomCodeText = document.getElementById("roomCodeText");
// const videoContainer = document.getElementById("videoContainer");

// const micBtn = document.getElementById("micBtn");
// const camBtn = document.getElementById("camBtn");
// const leaveBtn = document.getElementById("leaveBtn");
// const logoutBtn = document.getElementById("logoutBtn");

// const micIcon = document.getElementById("micIcon");
// const camIcon = document.getElementById("camIcon");

// roomCodeText.innerText = "Room: " + roomId;

// // State
// let localStream = null;
// let peers = {};
// let socket;

// // SVGs
// const micOnSVG = `
// <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/>
// <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
// <line x1="12" y1="19" x2="12" y2="23"/>
// <line x1="8" y1="23" x2="16" y2="23"/>
// `;

// const micOffSVG = `
// <line x1="1" y1="1" x2="23" y2="23"/>
// <path d="M9 9v3a3 3 0 0 0 5 2"/>
// `;

// const camOnSVG = `
// <rect x="3" y="7" width="15" height="10" rx="2"/>
// <polygon points="16 7 22 12 16 17 16 7"/>
// `;

// const camOffSVG = `
// <line x1="1" y1="1" x2="23" y2="23"/>
// <rect x="3" y="7" width="15" height="10" rx="2"/>
// `;

// // Init icons
// micIcon.innerHTML = micOnSVG;
// camIcon.innerHTML = camOnSVG;

// // Start media
// async function startMedia() {
//     try {
//         videoContainer.innerHTML = "<p style='color:white'>Starting camera...</p>";

//         localStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });

//         videoContainer.innerHTML = "";
//         addVideo(localStream, "local");

//     } catch (err) {
//         alert("Camera/Mic permission denied");
//     }
// }

// startMedia();

// // Add video
// function addVideo(stream, id) {
//     if (document.getElementById(id)) return;

//     const video = document.createElement("video");
//     video.srcObject = stream;
//     video.autoplay = true;
//     video.playsInline = true;
//     video.muted = id === "local";
//     video.id = id;

//     videoContainer.appendChild(video);
// }

// // Mic toggle
// micBtn.onclick = () => {
//     if (!localStream) return;

//     const track = localStream.getAudioTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     micIcon.innerHTML = track.enabled ? micOnSVG : micOffSVG;
// };

// // Cam toggle
// camBtn.onclick = () => {
//     if (!localStream) return;

//     const track = localStream.getVideoTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     camIcon.innerHTML = track.enabled ? camOnSVG : camOffSVG;
// };

// // Stop media
// function stopMedia() {
//     if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//     }
// }

// // Leave
// leaveBtn.onclick = () => {
//     stopMedia();
//     window.location.href = "Dashboard.html";
// };

// // Logout
// logoutBtn.onclick = () => {
//     stopMedia();
//     window.location.href = "Dashboard.html";
// };

// // ==========================
// // 🔌 BACKEND CONNECTION
// // ==========================

// function connectToBackend() {
//     socket = new WebSocket("wss://final-year-project-3-pn8n.onrender.com/signal");

//     socket.onopen = () => {
//         console.log("Connected to backend");

//         socket.send(JSON.stringify({
//             type: "join-room",
//             roomId,
//             userId
//         }));
//     };

//     socket.onmessage = handleMessage;
// }

// // Handle incoming messages
// function handleMessage(event) {
//     const data = JSON.parse(event.data);
//     console.log("Message:", data);

//     if (data.type === "user-joined") {
//         handleUserJoined(data.userId);
//     }

//     if (data.type === "offer") {
//         handleOffer(data);
//     }

//     if (data.type === "answer") {
//         handleAnswer(data);
//     }

//     if (data.type === "ice-candidate") {
//         handleIceCandidate(data);
//     }
// }

// // Create peer
// function createPeer(otherUserId) {
//     const peer = new RTCPeerConnection({
//         iceServers: [
//             { urls: "stun:stun.l.google.com:19302" }
//         ]
//     });

//     peer.onicecandidate = (event) => {
//         if (event.candidate) {
//             socket.send(JSON.stringify({
//                 type: "ice-candidate",
//                 to: otherUserId,
//                 from: userId,
//                 candidate: event.candidate
//             }));
//         }
//     };

//     peer.ontrack = (event) => {
//         addVideo(event.streams[0], otherUserId);
//     };

//     localStream.getTracks().forEach(track => {
//         peer.addTrack(track, localStream);
//     });

//     return peer;
// }

// // When new user joins
// async function handleUserJoined(otherUserId) {
//     const peer = createPeer(otherUserId);
//     peers[otherUserId] = peer;

//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     socket.send(JSON.stringify({
//         type: "offer",
//         to: otherUserId,
//         from: userId,
//         offer
//     }));
// }

// // Handle offer
// async function handleOffer(data) {
//     const peer = createPeer(data.from);
//     peers[data.from] = peer;

//     await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);

//     socket.send(JSON.stringify({
//         type: "answer",
//         to: data.from,
//         from: userId,
//         answer
//     }));
// }

// // Handle answer
// async function handleAnswer(data) {
//     const peer = peers[data.from];
//     if (peer) {
//         await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
//     }
// }

// // Handle ICE
// async function handleIceCandidate(data) {
//     const peer = peers[data.from];
//     if (peer) {
//         await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
// }

// // Start connection
// connectToBackend();

// // ================== PARAMS ==================
// const params = new URLSearchParams(window.location.search);
// const roomId = params.get("room");
// const userId = params.get("user");

// if (!roomId || !userId) {
//     alert("Invalid meeting link");
//     window.location.href = "Dashboard.html";
// }

// // ================== DOM ==================
// const videoContainer = document.getElementById("videoContainer");
// const roomCodeText = document.getElementById("roomCodeText");

// roomCodeText.innerText = "Room: " + roomId;

// // ================== STATE ==================
// let localStream = null;
// let peers = {};
// let socket;

// // ================== START MEDIA ==================
// async function startMedia() {
//     try {
//         localStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true
//         });

//         createVideoBox("local", true);
//         attachStream("local", localStream);

//     } catch (err) {
//         console.warn("No camera, joining without video");
//         createVideoBox("local", false);
//     }
// }

// startMedia();

// // ================== VIDEO BOX ==================
// function createVideoBox(id, hasVideo) {
//     if (document.getElementById(id)) return;

//     const wrapper = document.createElement("div");
//     wrapper.className = "video-box";
//     wrapper.id = id;

//     const video = document.createElement("video");
//     video.autoplay = true;
//     video.playsInline = true;
//     video.muted = id === "local";

//     const name = document.createElement("p");
//     name.innerText = id === "local" ? "You" : id;

//     const mic = document.createElement("span");
//     mic.className = "mic-status";
//     mic.innerText = "🎤";

//     if (!hasVideo) {
//         video.style.display = "none";
//         wrapper.style.background = "#222";
//     }

//     wrapper.appendChild(video);
//     wrapper.appendChild(name);
//     wrapper.appendChild(mic);

//     videoContainer.appendChild(wrapper);
// }

// function attachStream(id, stream) {
//     const box = document.getElementById(id);
//     if (!box) return;

//     const video = box.querySelector("video");
//     video.srcObject = stream;
// }

// // ================== BACKEND ==================
// function connectToBackend() {
//     socket = new WebSocket("wss://final-year-project-3-pn8n.onrender.com/signal");

//     socket.onopen = () => {
//         console.log("Connected");

//         socket.send(JSON.stringify({
//             type: "join-room",
//             roomId,
//             userId
//         }));
//     };

//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log("DATA:", data);

//         const type = data.type;

//         if (type === "user-joined" || type === "user_joined") {
//             const id = data.userId || data.id;
//             createVideoBox(id, false);
//             startCall(id);
//         }

//         if (type === "offer") {
//             handleOffer(data);
//         }

//         if (type === "answer") {
//             handleAnswer(data);
//         }

//         if (type === "ice-candidate" || type === "ice_candidate") {
//             handleIce(data);
//         }
//     };
// }

// connectToBackend();

// // ================== PEER ==================
// function createPeer(id) {
//     const peer = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//     });

//     peer.ontrack = (e) => {
//         createVideoBox(id, true);
//         attachStream(id, e.streams[0]);
//     };

//     peer.onicecandidate = (e) => {
//         if (e.candidate) {
//             socket.send(JSON.stringify({
//                 type: "ice-candidate",
//                 to: id,
//                 from: userId,
//                 candidate: e.candidate
//             }));
//         }
//     };

//     if (localStream) {
//         localStream.getTracks().forEach(track => {
//             peer.addTrack(track, localStream);
//         });
//     }

//     return peer;
// }

// // ================== CALL FLOW ==================
// async function startCall(id) {
//     const peer = createPeer(id);
//     peers[id] = peer;

//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     socket.send(JSON.stringify({
//         type: "offer",
//         to: id,
//         from: userId,
//         offer
//     }));
// }

// async function handleOffer(data) {
//     const from = data.from || data.sender;

//     const peer = createPeer(from);
//     peers[from] = peer;

//     await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);

//     socket.send(JSON.stringify({
//         type: "answer",
//         to: from,
//         from: userId,
//         answer
//     }));
// }

// async function handleAnswer(data) {
//     const from = data.from || data.sender;
//     const peer = peers[from];

//     if (peer) {
//         await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
//     }
// }

// async function handleIce(data) {
//     const from = data.from || data.sender;
//     const peer = peers[from];

//     if (peer) {
//         await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
// }


const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");
const userId = params.get("user");

if (!roomId || !userId) {
    alert("Invalid meeting link");
    window.location.href = "Dashboard.html";
}


const videoContainer = document.getElementById("videoContainer");
const roomCodeText = document.getElementById("roomCodeText");
roomCodeText.innerText = "Room: " + roomId;


let localStream = null;
let peers = {};
let socket;
let micOn = true;
let camOn = true;


const MIC_ON_SVG = `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`;
const MIC_OFF_SVG = `<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`;
const CAM_ON_SVG = `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`;
const CAM_OFF_SVG = `<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/><polyline points="23 7 16 12 23 17 23 7"/>`;


async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
        console.warn("No camera/mic:", err);
        micOn = false;
        camOn = false;
    }

    createVideoCard("local", userId, localStream);
    updateControlIcons();
    connectToBackend();
}

startMedia();

// ================== VIDEO CARD ==================
function createVideoCard(peerId, displayName, stream) {
    if (document.getElementById("card-" + peerId)) return;

    const card = document.createElement("div");
    card.className = "video-card";
    card.id = "card-" + peerId;

    // Video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    if (peerId === "local") video.muted = true;

    if (stream) {
        video.srcObject = stream;
    } else {
        video.style.display = "none";
    }

    // Avatar fallback (shown when no video)
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.id = "avatar-" + peerId;
    const initials = (displayName || "U").toString().substring(0, 2).toUpperCase();
    avatar.innerText = initials;
    if (stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled) {
        avatar.style.display = "none";
    }

    // Name tag
    const nameTag = document.createElement("div");
    nameTag.className = "name-tag";
    nameTag.innerText = peerId === "local" ? "You" : displayName;

    // Status bar (mic + cam icons)
    const statusBar = document.createElement("div");
    statusBar.className = "status-bar";

    const micIcon = document.createElement("span");
    micIcon.className = "status-icon";
    micIcon.id = "mic-icon-" + peerId;
    micIcon.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${MIC_ON_SVG}</svg>`;

    const camIcon = document.createElement("span");
    camIcon.className = "status-icon";
    camIcon.id = "cam-icon-" + peerId;
    camIcon.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${CAM_ON_SVG}</svg>`;

    statusBar.appendChild(micIcon);
    statusBar.appendChild(camIcon);

    card.appendChild(video);
    card.appendChild(avatar);
    card.appendChild(nameTag);
    card.appendChild(statusBar);

    videoContainer.appendChild(card);
    updateGridLayout();
}

function updateGridLayout() {
    const count = videoContainer.querySelectorAll(".video-card").length;
    videoContainer.setAttribute("data-count", count);
}

function attachStream(peerId, stream) {
    const card = document.getElementById("card-" + peerId);
    if (!card) return;

    const video = card.querySelector("video");
    const avatar = document.getElementById("avatar-" + peerId);

    video.srcObject = stream;
    video.style.display = "block";

    const hasVideo = stream.getVideoTracks().length > 0;
    if (avatar) avatar.style.display = hasVideo ? "none" : "flex";

    updateRemoteStatus(peerId, stream);
}

function updateRemoteStatus(peerId, stream) {
    const micEnabled = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;
    const camEnabled = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

    setStatusIcon("mic-icon-" + peerId, micEnabled, MIC_ON_SVG, MIC_OFF_SVG);
    setStatusIcon("cam-icon-" + peerId, camEnabled, CAM_ON_SVG, CAM_OFF_SVG);
}

function setStatusIcon(elementId, isOn, onSvg, offSvg) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${isOn ? onSvg : offSvg}</svg>`;
    el.classList.toggle("off", !isOn);
}

function removeVideoCard(peerId) {
    const card = document.getElementById("card-" + peerId);
    if (card) card.remove();
    updateGridLayout();
}

// ================== CONTROLS ==================
const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const leaveBtn = document.getElementById("leaveBtn");
const micIconEl = document.getElementById("micIcon");
const camIconEl = document.getElementById("camIcon");

function updateControlIcons() {
    micIconEl.innerHTML = micOn ? MIC_ON_SVG : MIC_OFF_SVG;
    camIconEl.innerHTML = camOn ? CAM_ON_SVG : CAM_OFF_SVG;
    micBtn.classList.toggle("off", !micOn);
    camBtn.classList.toggle("off", !camOn);

    // Update local card status icons too
    setStatusIcon("mic-icon-local", micOn, MIC_ON_SVG, MIC_OFF_SVG);
    setStatusIcon("cam-icon-local", camOn, CAM_ON_SVG, CAM_OFF_SVG);

    // Update local avatar visibility
    const avatar = document.getElementById("avatar-local");
    const card = document.getElementById("card-local");
    if (card && avatar) {
        avatar.style.display = camOn ? "none" : "flex";
        const video = card.querySelector("video");
        if (video) video.style.display = camOn ? "block" : "none";
    }
}

micBtn.addEventListener("click", () => {
    if (!localStream) return;
    micOn = !micOn;
    localStream.getAudioTracks().forEach(t => t.enabled = micOn);
    updateControlIcons();
});

camBtn.addEventListener("click", () => {
    if (!localStream) return;
    camOn = !camOn;
    localStream.getVideoTracks().forEach(t => t.enabled = camOn);
    updateControlIcons();
});

leaveBtn.addEventListener("click", () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (socket) socket.close();
    window.location.href = "Dashboard.html";
});

// ================== WEBSOCKET ==================
function connectToBackend() {
    socket = new WebSocket("wss://final-year-project-3-pn8n.onrender.com/signal");

    socket.onopen = () => {
        console.log("Connected to signaling server");
        socket.send(JSON.stringify({ type: "join-room", roomId, userId }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const type = data.type;

        if (type === "user-joined" || type === "user_joined") {
            const id = data.userId || data.id;
            if (id === userId) return; // ignore self
            createVideoCard(id, id, null);
            startCall(id);
        }

        if (type === "user-left" || type === "user_left") {
            const id = data.userId || data.id;
            removeVideoCard(id);
            if (peers[id]) { peers[id].close(); delete peers[id]; }
        }

        if (type === "offer") handleOffer(data);
        if (type === "answer") handleAnswer(data);
        if (type === "ice-candidate" || type === "ice_candidate") handleIce(data);
    };

    socket.onclose = () => console.log("Disconnected from signaling server");
}

// ================== PEER CONNECTION ==================
function createPeer(id) {
    const peer = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
        ]
    });

    peer.ontrack = (e) => {
        const stream = e.streams[0];
        const card = document.getElementById("card-" + id);
        if (!card) createVideoCard(id, id, stream);
        else attachStream(id, stream);
    };

    peer.onicecandidate = (e) => {
        if (e.candidate) {
            socket.send(JSON.stringify({
                type: "ice-candidate",
                to: id,
                from: userId,
                candidate: e.candidate
            }));
        }
    };

    peer.onconnectionstatechange = () => {
        if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
            removeVideoCard(id);
            delete peers[id];
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    }

    return peer;
}

async function startCall(id) {
    const peer = createPeer(id);
    peers[id] = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.send(JSON.stringify({ type: "offer", to: id, from: userId, offer }));
}

async function handleOffer(data) {
    const from = data.from || data.sender;
    if (!document.getElementById("card-" + from)) createVideoCard(from, from, null);

    const peer = createPeer(from);
    peers[from] = peer;

    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.send(JSON.stringify({ type: "answer", to: from, from: userId, answer }));
}

async function handleAnswer(data) {
    const from = data.from || data.sender;
    const peer = peers[from];
    if (peer) await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
}

async function handleIce(data) {
    const from = data.from || data.sender;
    const peer = peers[from];
    if (peer) {
        try {
            await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
            console.warn("ICE error:", e);
        }
    }
}