const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

// beep offline curto
const beep = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");

let codeReader = null;
let stream = null;
let track = null;
let torchOn = false;
let processInterval = null;

// botões
const startBtn = document.getElementById('start-camera-btn');
const stopBtn = document.getElementById('stop-scan-btn');

startBtn.addEventListener('click', startScanner);
stopBtn.addEventListener('click', stopScanner);

async function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';

    const { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } = ZXing;

    const supportedFormats = [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.ITF,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODABAR,
    ];

    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, supportedFormats);

    codeReader = new BrowserMultiFormatReader(hints);

    try {
        const videoElement = document.getElementById('scanner-video');
        videoElement.setAttribute("playsinline", true); // necessário em iPhone

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });

        videoElement.srcObject = stream;
        await videoElement.play();

        track = stream.getVideoTracks()[0];

        // inicia decodificação contínua
        codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
                onDetected(result.text);
            }
        });

        document.getElementById('mensagem').innerText = "Aponte a câmera para o código...";
        document.getElementById('mensagem').style.color = "blue";

    } catch (error) {
        document.getElementById('mensagem').innerText = "Erro ao acessar câmera: " + error;
        document.getElementById('mensagem').style.color = "red";
    }
}

function onDetected(text) {
    try { beep.play(); } catch {}
    document.getElementById('numeroChamado').value = text;
    document.getElementById('mensagem').innerText = "Código Detectado!";
    document.getElementById('mensagem').style.color = "green";
    stopScanner();
}

function stopScanner() {
    if (processInterval) clearInterval(processInterval);

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (codeReader) {
        try { codeReader.reset(); } catch {}
        codeReader = null;
    }

    document.getElementById('scanner-container').style.display = 'none';
}
