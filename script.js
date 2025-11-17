const codeReader = new ZXingBrowser.BrowserMultiFormatReader();
let lastCode = "";
let photoBase64 = "";

document.getElementById("btnStart").addEventListener("click", async () => {
    const preview = document.getElementById("camera");
    const cameras = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();

    if (cameras.length === 0) {
        alert("Nenhuma câmera encontrada!");
        return;
    }

    codeReader.decodeFromVideoDevice(cameras[0].deviceId, preview, (result) => {
        if (result) {
            lastCode = result.text;
            document.getElementById("output").textContent = lastCode;
        }
    });
});

document.getElementById("btnPhoto").addEventListener("click", () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    photoBase64 = canvas.toDataURL("image/jpeg");
    alert("📸 Foto capturada!");
});

document.getElementById("btnEnviar").addEventListener("click", () => {
    if (!lastCode) {
        alert("Nenhum código lido!");
        return;
    }

    fetch("https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec", {
        method: "POST",
        body: JSON.stringify({
            barcode: lastCode,
            photo: photoBase64 || "",
            timestamp: new Date().toLocaleString(),
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        lastCode = "";
        photoBase64 = "";
        document.getElementById("output").textContent = "---";
    })
    .catch(err => alert("Erro ao enviar: " + err));
});
