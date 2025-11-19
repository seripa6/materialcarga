const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

let stream = null;
let track = null;
let codeReader = null;
let scanning = false;

const beep = new Audio(
    "data:audio/wav;base64,UklGRkIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA//8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A"
);

const video = document.getElementById("scanner-video");
const startBtn = document.getElementById("start-camera-btn");
const stopBtn = document.getElementById("stop-scan-btn");
const restartBtn = document.getElementById("restart-scan-btn");
const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");
const scannerBox = document.getElementById("scanner-container");

startBtn.onclick = startScanner;
stopBtn.onclick = stopScanner;
restartBtn.onclick = restartScan;
flashBtn.onclick = toggleFlash;
zoomControl.oninput = setZoom;


async function startScanner() {
    try {
        scannerBox.style.display = "block";
        scanning = true;

        codeReader = new ZXingBrowser.BrowserMultiFormatReader();

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        await video.play();

        track = stream.getVideoTracks()[0];

        setupZoom();

        codeReader.decodeFromVideoDevice(null, video, (result, err) => {
            if (result && scanning) {
                scanning = false;
                beep.play();
                document.getElementById("numeroChamado").value = result.text;
                document.getElementById("mensagem").innerText = "Código detectado!";
                document.getElementById("mensagem").style.color = "green";
            }
        });

    } catch (err) {
        alert("Erro ao acessar câmera: " + err);
        console.error(err);
    }
}

function stopScanner() {
    scanning = false;

    if (codeReader) codeReader.reset();
    if (stream) stream.getTracks().forEach(t => t.stop());

    scannerBox.style.display = "none";
}

function restartScan() {
    scanning = true;
    document.getElementById("mensagem").innerText = "Escaneando...";
    document.getElementById("mensagem").style.color = "black";
}

async function toggleFlash() {
    if (!track || !track.getCapabilities().torch) {
        alert("Este dispositivo não suporta lanterna.");
        return;
    }

    const state = flashBtn.dataset.state === "on";

    await track.applyConstraints({ advanced: [{ torch: !state }] });

    flashBtn.dataset.state = state ? "off" : "on";
    flashBtn.innerText = state ? "🔦 Lanterna" : "❌ Apagar";
}

function setupZoom() {
    if (!track) return;

    const caps = track.getCapabilities();
    if (!caps.zoom) {
        zoomControl.disabled = true;
        return;
    }

    zoomControl.disabled = false;
    zoomControl.min = caps.zoom.min;
    zoomControl.max = caps.zoom.max;
    zoomControl.value = caps.zoom.min;
}

async function setZoom() {
    await track.applyConstraints({ advanced: [{ zoom: zoomControl.value }] });
}

document.getElementById("formulario").addEventListener("submit", async e => {
    e.preventDefault();

    const data = new URLSearchParams({
        numeroChamado: numeroChamado.value,
        nome: nome.value,
        motivo: motivo.value
    });

    const res = await fetch(URL_SCRIPT, { method: "POST", body: data });
    const json = await res.json();

    document.getElementById("mensagem").textContent = json.status === "sucesso"
        ? "Enviado com sucesso!"
        : "Erro ao enviar";

    if (json.status === "sucesso") e.target.reset();
});
