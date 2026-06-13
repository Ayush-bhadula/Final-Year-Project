const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");
const userId = params.get("user");
const displayName = localStorage.getItem("username") || userId;

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
let heartbeatInterval = null;

// ================== TRANSCRIPTION STATE ==================
let transcript = [];
let transcriptionActive = false;
let mediaRecorder = null;
let audioChunks = [];

const GROQ_API_KEY = "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";

const MIC_ON_SVG = `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`;
const MIC_OFF_SVG = `<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`;
const CAM_ON_SVG = `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`;
const CAM_OFF_SVG = `<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/><polyline points="23 7 16 12 23 17 23 7"/>`;


// ================== TOAST NOTIFICATIONS ==================
function showToast(name, type) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = `
            position: fixed; top: 85px; right: 20px;
            display: flex; flex-direction: column; gap: 10px;
            z-index: 9999; pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const initials = (name || "U").toString().substring(0, 2).toUpperCase();
    const message = type === "join" ? "joined the meeting" : "left the meeting";
    const isJoin = type === "join";
    const bgColor = isJoin ? "rgba(16, 185, 90, 0.25)" : "rgba(255, 77, 77, 0.22)";
    const borderColor = isJoin ? "rgba(16, 185, 90, 0.4)" : "rgba(255, 77, 77, 0.35)";
    const avatarBg = isJoin ? "rgba(16, 185, 90, 0.35)" : "rgba(255, 77, 77, 0.3)";
    const avatarColor = isJoin ? "#6effa8" : "#ffaaaa";
    const dotColor = isJoin ? "#10b95a" : "#ff4d4d";

    const toast = document.createElement("div");
    toast.style.cssText = `
        display: flex; align-items: center; gap: 12px;
        padding: 12px 18px; border-radius: 12px;
        backdrop-filter: blur(12px); background: ${bgColor};
        border: 1px solid ${borderColor}; color: white;
        font-size: 14px; font-family: Cambria, serif;
        min-width: 240px; max-width: 320px; pointer-events: auto;
        transform: translateX(60px); opacity: 0;
        transition: transform 0.35s ease, opacity 0.35s ease;
    `;
    toast.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:${avatarBg};color:${avatarColor};
            display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;flex-shrink:0;">
            ${initials}
        </div>
        <div style="flex:1;">
            <strong style="display:block;font-size:14px;font-weight:600;">${name}</strong>
            <span style="font-size:12px;opacity:0.75;">${message}</span>
        </div>
        <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
    }));
    setTimeout(() => {
        toast.style.transform = "translateX(60px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}


// ================== MEDIA ==================
async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        micOn = true; camOn = true;
        console.log("✅ Camera/mic acquired");
    } catch (err) {
        console.warn("⚠️ No camera/mic:", err.message);
        localStream = null; micOn = false; camOn = false;
    }
    createVideoCard("local", displayName, localStream);
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

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    if (peerId === "local") video.muted = true;

    if (stream) { video.srcObject = stream; video.style.display = "block"; }
    else { video.style.display = "none"; }

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.id = "avatar-" + peerId;
    avatar.innerText = (displayName || "U").toString().substring(0, 2).toUpperCase();
    avatar.style.display = (stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled) ? "none" : "flex";

    const nameTag = document.createElement("div");
    nameTag.className = "name-tag";
    nameTag.innerText = peerId === "local" ? displayName : displayName;

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
    console.log("🎴 Card created for:", peerId);
}

function updateGridLayout() {
    const count = videoContainer.querySelectorAll(".video-card").length;
    videoContainer.setAttribute("data-count", count);
    console.log("📐 Grid count:", count);
}

function attachStream(peerId, stream) {
    const card = document.getElementById("card-" + peerId);
    if (!card) { createVideoCard(peerId, peerId, stream); return; }

    const video = card.querySelector("video");
    const avatar = document.getElementById("avatar-" + peerId);
    video.srcObject = stream;
    video.style.display = "block";
    const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
    if (avatar) avatar.style.display = hasVideo ? "none" : "flex";
    updateRemoteStatus(peerId, stream);
    console.log("📹 Stream attached for:", peerId);
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
    console.log("🗑️ Card removed for:", peerId);
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
    setStatusIcon("mic-icon-local", micOn, MIC_ON_SVG, MIC_OFF_SVG);
    setStatusIcon("cam-icon-local", camOn, CAM_ON_SVG, CAM_OFF_SVG);

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
    stopTranscription();
    downloadTranscript();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (socket) socket.close();
    window.location.href = "Dashboard.html";
});


// ================== WEBSOCKET ==================
function connectToBackend() {
    socket = new WebSocket("wss://final-year-project-3-pn8n.onrender.com/signal");

    socket.onopen = () => {
        console.log("✅ Connected to signaling server");
        socket.send(JSON.stringify({ type: "join-room", roomId, userId }));
        heartbeatInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ping", roomId }));
            }
        }, 20000);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📨 MSG received:", data.type, data);
        const type = data.type;

        if (type === "user-joined" || type === "user_joined") {
            const id = data.userId || data.id;
            if (id === userId) return;
            console.log("👤 User joined:", id);
            createVideoCard(id, id, null);
            setTimeout(() => startCall(id), 500);
            showToast(id, "join");
        }

        if (type === "user-left" || type === "user_left") {
            const id = data.userId || data.id;
            console.log("👤 User left:", id);
            showToast(id, "leave");
            removeVideoCard(id);
            if (peers[id]) { peers[id].close(); delete peers[id]; }
        }

        if (type === "offer") handleOffer(data);
        if (type === "answer") handleAnswer(data);
        if (type === "ice-candidate" || type === "ice_candidate") handleIce(data);

        if (type === "transcript") {
            transcript.push({ time: data.time, speaker: data.from, text: data.text });
            addTranscriptLine(data.time, data.from, data.text);
        }
    };

    socket.onclose = () => {
        console.log("❌ Disconnected from signaling server");
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        setTimeout(connectToBackend, 2000);
    };

    socket.onerror = (e) => console.error("🔴 WebSocket error:", e);
}


// ================== PEER CONNECTION ==================
function createPeer(id) {
    console.log("🔗 Creating peer for:", id);
    const peer = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
        ]
    });

    peer.ontrack = (e) => {
        console.log("🎥 Track received from:", id, e.streams);
        const stream = e.streams[0];
        const card = document.getElementById("card-" + id);
        if (!card) createVideoCard(id, id, stream);
        else attachStream(id, stream);
    };

    peer.onicecandidate = (e) => {
        if (e.candidate) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "ice-candidate",
                    to: id, from: userId,
                    roomId: roomId,
                    candidate: e.candidate
                }));
            }
        }
    };

    peer.onconnectionstatechange = () => {
        console.log("🔄 Peer state [" + id + "]:", peer.connectionState);
        if (peer.connectionState === "disconnected" || peer.connectionState === "failed") {
            removeVideoCard(id);
            delete peers[id];
        }
    };

    peer.oniceconnectionstatechange = () => {
        console.log("🧊 ICE state [" + id + "]:", peer.iceConnectionState);
    };

    if (localStream) {
        localStream.getTracks().forEach(track => {
            peer.addTrack(track, localStream);
            console.log("➕ Added track:", track.kind);
        });
    } else {
        console.warn("⚠️ No localStream — peer connected without camera/mic");
    }

    return peer;
}

async function startCall(id) {
    console.log("📞 Starting call to:", id);
    const peer = createPeer(id);
    peers[id] = peer;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: "offer", to: id, from: userId, roomId: roomId, offer }));
    console.log("📤 Offer sent to:", id);
}

async function handleOffer(data) {
    const from = data.from || data.sender;
    console.log("📥 Offer received from:", from);
    if (!document.getElementById("card-" + from)) createVideoCard(from, from, null);
    const peer = createPeer(from);
    peers[from] = peer;
    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: "answer", to: from, from: userId, roomId: roomId, answer }));
    console.log("📤 Answer sent to:", from);
}

async function handleAnswer(data) {
    const from = data.from || data.sender;
    console.log("📥 Answer received from:", from);
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
            console.warn("❌ ICE error:", e);
        }
    }
}


// ================== GROQ WHISPER TRANSCRIPTION ==================
async function sendToGroq(audioBlob) {
    try {
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("model", "whisper-large-v3");
        formData.append("language", "en");

        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            console.error("Groq error:", await response.text());
            return;
        }

        const result = await response.json();
        const text = result.text?.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString();
        transcript.push({ time, speaker: displayName, text });
        addTranscriptLine(time, displayName, text);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "transcript",
                from: displayName,
                roomId: roomId,
                text, time
            }));
        }

        console.log("📝 Transcribed:", text);
    } catch (err) {
        console.error("Groq fetch error:", err);
    }
}

function startTranscription() {
    if (!localStream) {
        alert("No microphone found!");
        return;
    }

    const audioStream = new MediaStream(localStream.getAudioTracks());
    mediaRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
        if (audioChunks.length === 0) return;
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
        await sendToGroq(audioBlob);

        if (transcriptionActive) {
            mediaRecorder.start();
            setTimeout(() => {
                if (transcriptionActive && mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            }, 5000);
        }
    };

    mediaRecorder.start();
    transcriptionActive = true;

    setTimeout(() => {
        if (transcriptionActive && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    }, 5000);

    const btn = document.getElementById("transcriptBtn");
    if (btn) {
        btn.style.background = "rgba(16,185,90,0.8)";
        btn.title = "Stop Transcription";
    }
    console.log("🎙️ Groq transcription started");
}

function stopTranscription() {
    transcriptionActive = false;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    mediaRecorder = null;
    audioChunks = [];

    const btn = document.getElementById("transcriptBtn");
    if (btn) { btn.style.background = ""; btn.title = "Start Transcription"; }
    console.log("🛑 Transcription stopped");
}

function toggleTranscription() {
    transcriptionActive ? stopTranscription() : startTranscription();
}

function addTranscriptLine(time, speaker, text) {
    const box = document.getElementById("transcriptBox");
    if (!box) return;
    const line = document.createElement("div");
    line.style.cssText = `margin-bottom:8px;padding:6px 10px;border-radius:8px;
        background:rgba(255,255,255,0.05);font-size:13px;color:#ccc;`;
    line.innerHTML = `<span style="color:#10b95a;">[${time}]</span> <strong style="color:#7eb8ff;">${speaker}:</strong> ${text}`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    const panel = document.getElementById("transcriptPanel");
    if (panel) panel.style.display = "flex";
}

function downloadTranscript() {
    if (transcript.length === 0) return;
    const lines = transcript.map(t => `[${t.time}] ${t.speaker}: ${t.text}`).join("\n");
    const header = `MeetScribe Transcript\nRoom: ${roomId}\nDate: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    const blob = new Blob([header + lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${roomId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("📄 Transcript downloaded");
}


// ================== INJECT TRANSCRIPT UI ==================
(function injectTranscriptUI() {
    const controls = document.querySelector(".controls");
    const leaveButton = document.getElementById("leaveBtn");

    const transcriptBtn = document.createElement("button");
    transcriptBtn.id = "transcriptBtn";
    transcriptBtn.title = "Start Transcription";
    transcriptBtn.className = "control-btn";
    transcriptBtn.style.cssText = `cursor:pointer;`;
    transcriptBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <text x="5" y="16" font-size="8" font-weight="bold" fill="currentColor" stroke="none" font-family="Arial">CC</text>
    </svg>`;
    transcriptBtn.onclick = toggleTranscription;

    const downloadBtn = document.createElement("button");
    downloadBtn.id = "downloadTranscriptBtn";
    downloadBtn.title = "Download Transcript (.txt)";
    downloadBtn.className = "control-btn";
    downloadBtn.style.cssText = `cursor:pointer;`;
    downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`;
    downloadBtn.onclick = downloadTranscript;

    if (controls && leaveButton) {
        controls.insertBefore(transcriptBtn, leaveButton);
        controls.insertBefore(downloadBtn, leaveButton);
    } else if (controls) {
        controls.appendChild(transcriptBtn);
        controls.appendChild(downloadBtn);
    }

    const panel = document.createElement("div");
    panel.id = "transcriptPanel";
    panel.style.cssText = `
        display: none;
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 320px;
        max-height: 300px;
        background: rgba(10, 15, 35, 0.95);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        flex-direction: column;
        z-index: 9998;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;
    panel.innerHTML = `
        <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);
            display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.05);">
            <span style="color:white;font-size:13px;font-weight:600;">📝 Live Transcript</span>
            <div style="display:flex;gap:8px;align-items:center;">
                <button onclick="downloadTranscript()" title="Download"
                    style="background:none;border:none;color:#7eb8ff;cursor:pointer;font-size:12px;">⬇ Save</button>
                <button onclick="document.getElementById('transcriptPanel').style.display='none'"
                    style="background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;">✕</button>
            </div>
        </div>
        <div id="transcriptBox" style="padding:10px;overflow-y:auto;flex:1;max-height:240px;"></div>
    `;
    document.body.appendChild(panel);
})();