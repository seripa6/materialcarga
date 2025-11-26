/* js/scanner.js — ZXing Scanner */

let scanning = false;
let codeReader = null;
let currentTrack = null;

const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// ▶ Iniciar Scanner
async function startScanner() {
    if (scanning) return;

    scanning = true;
    codeReader = new ZXingBrowser.BrowserMultiFormatReader();

    const devices = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
    if (!devices.length) {
        alert("Nenhuma câmera encontrada.");
        return;
    }

    const backCamera = devices.find(d => /back|rear|traseira/i.test(d.label)) || devices[0];

    const constraints = {
        video: {
            deviceId: backCamera.deviceId,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment"
        }
    };

    codeReader.decodeFromConstraints(constraints, video, (result) => {
        if (result) {
            beep.play().catch(()=>{});
            numeroChamado.value = result.text;
            stopScanner();
            buscarMaterial(result.text);
        }
    });

    const stream = video.srcObject;
    currentTrack = stream?.getVideoTracks()[0];
}


// ❌ Parar scanner
function stopScanner() {
    if (!scanning) return;

    if (codeReader?.stopContinuousDecode) {
        codeReader.stopContinuousDecode();
    }

    if (currentTrack) {
        currentTrack.stop();
    }

    scanning = false;
    scannerContainer.classList.add("hidden");
}


// 🔄 Reiniciar scanner
restartBtn.addEventListener("click", () => {
    stopScanner();
    setTimeout(startScanner, 300);
});


// 🔦 Flash
flashBtn.addEventListener("click", () => {
    if (!currentTrack) return;

    const capabilities = currentTrack.getCapabilities();
    if (!capabilities.torch) return alert("Seu dispositivo não suporta lanterna.");

    const newState = !flashBtn.classList.contains("active");
    flashBtn.classList.toggle("active");

    currentTrack.applyConstraints({
        advanced: [{ torch: newState }]
    });
});


// 🔍 Zoom
zoomControl.addEventListener("input", () => {
    if (!currentTrack) return;

    currentTrack.applyConstraints({
        advanced: [{ zoom: zoomControl.value }]
    }).catch(err => console.warn("Zoom indisponível:", err));
});


// Botão abrir scanner
startBtn.addEventListener("click", () => {
    descricao.value = "";
    setor.value = "";
    setMessage("");
    scannerContainer.classList.remove("hidden");
    startScanner();
});


// Botão parar scanner
stopBtn.addEventListener("click", stopScanner);
