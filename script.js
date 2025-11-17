const codeReader = new ZXingBrowser.BrowserMultiFormatReader();
let lastCode = "";
let photoBase64 = "";

const beep = new Audio("beep.mp3"); // <-- arquivo local
const output = document.getElementById("output");
const statusMsg = document.getElementById("status");

document.getElementById("btnStart").addEventListener("click", async () => {
    const preview = document.getElementById("camera");
    const cams = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
    if (!cams.length) return alert("Nenhuma câmera encontrada");

    codeReader.decodeFromVideoDevice(cams[0].deviceId, preview, (result) => {
        if (result && result.text !== lastCode) {
            lastCode = result.text;
            output.textContent = lastCode;
            beep.play().catch(()=>{});
        }
    });
});

// Entrada manual
document.getElementById("btnUseManual").addEventListener("click", () => {
    const typed = document.getElementById("manualInput").value.trim();
    if (!typed) return alert("Digite um código primeiro.");
    lastCode = typed;
    output.textContent = lastCode;
    beep.play().catch(()=>{});
});

// Foto
document.getElementById("btnPhoto").addEventListener("click", () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    photoBase64 = canvas.toDataURL("image/jpeg");
    alert("Foto capturada!");
});

document.getElementById("btnSend").addEventListener("click", () => {

    if (!lastCode) return alert("Nenhum código para enviar!");

    statusMsg.textContent = "Enviando...";

    fetch("https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            barcode: lastCode,
            photo: photoBase64
        })
    })
    .then(r => r.text())
    .then(msg => {
        statusMsg.textContent = "✔ Enviado!";
        output.textContent = "---";
        document.getElementById("manualInput").value = "";
        lastCode = "";
        photoBase64 = "";
    })
    .catch(err => {
        statusMsg.textContent = "❌ Erro: " + err;
    });
});