const API_URL = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

// =======================
// VARIÁVEIS
// =======================

let lastCode = "";
let photoBase64 = "";
let scanningActive = false;

const beep = document.getElementById("beepSound");
const output = document.getElementById("output");
const statusMsg = document.getElementById("status");
const manualInput = document.getElementById("manualInput");

const codeReader = new ZXingBrowser.BrowserMultiFormatReader();


// =======================
// INICIAR SCANNER
// =======================

document.getElementById("btnStart").addEventListener("click", async () => {
    const preview = document.getElementById("camera");
    const cams = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();

    if (!cams.length) return alert("❌ Nenhuma câmera encontrada!");

    scanningActive = true;

    codeReader.decodeFromVideoDevice(cams[0].deviceId, preview, (result) => {
        if (!scanningActive || !result) return;

        if (result.text !== lastCode) {
            lastCode = result.text;
            output.textContent = lastCode;
            beep.play();
        }
    });

    statusMsg.textContent = "📷 Scanner ativo...";
});


// =======================
// PARAR SCANNER
// =======================

document.getElementById("btnStop").addEventListener("click", () => {
    codeReader.reset();
    scanningActive = false;
    statusMsg.textContent = "⏹ Scanner parado";
});


// =======================
// ENTRADA MANUAL
// =======================

document.getElementById("btnUseManual").addEventListener("click", () => {
    if (!manualInput.value.trim()) return alert("Digite um código primeiro.");

    lastCode = manualInput.value.trim();
    output.textContent = lastCode;
    beep.play();
});

// Pressionar Enter envia automaticamente
manualInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("btnUseManual").click();
});


// =======================
// CAPTURAR FOTO
// =======================

document.getElementById("btnPhoto").addEventListener("click", () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");

    if (!video.videoWidth) return alert("Abra a câmera primeiro!");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    photoBase64 = canvas.toDataURL("image/jpeg");

    alert("📸 Foto capturada!");
});


// =======================
// ENVIAR PARA A PLANILHA
// =======================

document.getElementById("btnSend").addEventListener("click", () => {

    if (!lastCode) return alert("Nenhum código para enviar!");

    statusMsg.textContent = "⏳ Enviando...";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            barcode: lastCode,
            photo: photoBase64
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "sucesso") {
            statusMsg.textContent = "✅ Registro enviado";
            beep.play();

            // RESET
            lastCode = "";
            photoBase64 = "";
            manualInput.value = "";
            output.textContent = "---";
        } else {
            statusMsg.textContent = "⚠ Erro: " + data.mensagem;
        }
    })
    .catch(err => {
        statusMsg.textContent = "❌ Falha no envio: " + err.message;
    });
});