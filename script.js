const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

let stream = null;
let track = null;
let codeReader = null;
let scanning = false;

const beep = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");

const video = document.getElementById("scanner-video");
const startBtn = document.getElementById("start-camera-btn");
const stopBtn = document.getElementById("stop-scan-btn");
const restartBtn = document.getElementById("restart-scan-btn");
const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");
const scannerBox = document.getElementById("scanner-container");

startBtn.onclick = startScanner;
stopBtn.onclick = stopScanner;
restartBtn.onclick = () => { scanning = true; };
flashBtn.onclick = toggleFlash;
zoomControl.oninput = setZoom;

async function startScanner() {
    scannerBox.style.display = "block";
    const { BrowserMultiFormatReader } = ZXing;

    codeReader = new BrowserMultiFormatReader();
    scanning = true;

    stream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    track = stream.getVideoTracks()[0];

    codeReader.decodeFromVideoDevice(null, video, (result, err) => {
        if (result && scanning) {
            scanning = false;
            beep.play();
            document.getElementById("numeroChamado").value = result.text;
            document.getElementById("mensagem").textContent = "Código detectado!";
            document.getElementById("mensagem").style.color = "green";
        }
    });

    setupZoom();
}

function stopScanner() {
    scanning = false;
    if (stream) stream.getTracks().forEach(t => t.stop());
    scannerBox.style.display = "none";
}

async function toggleFlash() {
    if (!track.getCapabilities().torch) return alert("Lanterna não suportada.");

    const torchEnabled = flashBtn.dataset.state !== "on";
    await track.applyConstraints({ advanced: [{ torch: torchEnabled }] });
    flashBtn.dataset.state = torchEnabled ? "on" : "off";
    flashBtn.textContent = torchEnabled ? "❌ Apagar" : "🔦 Lanterna";
}

function setupZoom() {
    const caps = track.getCapabilities();
    if (!caps.zoom) return zoomControl.disabled = true;

    zoomControl.min = caps.zoom.min;
    zoomControl.max = caps.zoom.max;
    zoomControl.value = caps.zoom.min;
}

async function setZoom() {
    await track.applyConstraints({ advanced: [{ zoom: zoomControl.value }] });
}

document.getElementById('formulario').addEventListener('submit', async e => {
    e.preventDefault();

    const data = new URLSearchParams({
        numeroChamado: numeroChamado.value,
        nome: nome.value,
        motivo: motivo.value
    });

    const res = await fetch(URL_SCRIPT, { method: 'POST', body: data });
    const json = await res.json();

    document.getElementById("mensagem").textContent = json.status === "sucesso"
        ? "Enviado!"
        : "Erro!";

    if (json.status === "sucesso") e.target.reset();
});
