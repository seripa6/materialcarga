const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";
const beep = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");

let codeReader = null;
let stream = null;
let track = null;
let torchOn = false;

// Botões
document.getElementById('start-camera-btn').addEventListener('click', startScanner);
document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);

// --- Criar Botões (Zoom e Lanterna) dentro do scanner ---
const scannerContainer = document.getElementById("scanner-container");

scannerContainer.insertAdjacentHTML("beforeend", `
    <button id="flash-btn" style="margin-top:10px;width:100%;">🔦 Ligar Lanterna</button>
    <label style="margin-top:10px; display:block;">Zoom:</label>
    <input type="range" id="zoomControl" min="1" max="5" step="0.1" value="1" style="width:100%;">
`);

const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");

// -------------------------
// INICIAR LEITOR ZXING
// -------------------------
async function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';

    codeReader = new ZXing.BrowserMultiFormatReader(undefined, {
        tryHarder: true, // melhora leitura de códigos pequenos
        formats: [
            ZXing.BarcodeFormat.CODE_128
        ]
    });

    try {
        const videoElement = document.getElementById('scanner-video');

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        videoElement.srcObject = stream;
        videoElement.play();

        track = stream.getVideoTracks()[0];
        await track.applyConstraints({
            advanced: [
                { focusMode: "continuous" },
                { exposureMode: "continuous" },
                { zoom: zoomControl.value }
            ]
        });
        const capabilities = track.getCapabilities();

        // Configura range do zoom se suportado
        if (capabilities.zoom) {
            zoomControl.min = capabilities.zoom.min;
            zoomControl.max = capabilities.zoom.max;
            zoomControl.step = capabilities.zoom.step || 0.1;
            zoomControl.value = capabilities.zoom.min;
            zoomControl.disabled = false;
        } else {
            zoomControl.disabled = true;
        }

        // Começa leitura contínua

        const hints = new Map();
        hints.set(ZXing.DecodeHintType.TRY_HARDER, true);

        codeReader = new ZXing.BrowserMultiFormatReader(hints);
        codeReader.decodeFromVideoDevice(null, videoElement, { area: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }, (result, err) => 
            {
                if (result) {
                    beep.play(); // <-- TOCA O BEEP

                    document.getElementById('numeroChamado').value = result.text;
                    document.getElementById('mensagem').innerText = "Código Detectado!";
                    document.getElementById('mensagem').style.color = "green";
                    stopScanner();
                }
            });

        document.getElementById('mensagem').innerText = "Aponte a câmera para o código...";
        document.getElementById('mensagem').style.color = "blue";

    } catch (error) {
        document.getElementById('mensagem').innerText = "Erro ao acessar câmera: " + error;
        document.getElementById('mensagem').style.color = "red";
    }
}

// -------------------------
// CONTROLE DA LANTERNA
// -------------------------
flashBtn.addEventListener("click", async () => {
    if (!track || !track.getCapabilities().torch) {
        alert("Seu dispositivo não suporta lanterna.");
        return;
    }

    torchOn = !torchOn;

    await track.applyConstraints({
        advanced: [
            { focusMode: "continuous" },
            { zoom: zoomControl.value },
            { exposureMode: "continuous" }
        ]
    });

    flashBtn.innerText = torchOn ? "❌ Apagar Lanterna" : "🔦 Ligar Lanterna";
});

// -------------------------
// CONTROLE DE ZOOM
// -------------------------
zoomControl.addEventListener("input", async () => {
    if (!track) return;
    await track.applyConstraints({
        advanced: [{ zoom: zoomControl.value }]
    });
});

// -------------------------
// PARAR O SCANNER
// -------------------------
function stopScanner() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (codeReader) {
        codeReader.reset();
        codeReader = null;
    }

    document.getElementById('scanner-container').style.display = 'none';
    torchOn = false;
}

// -------------------------
// ENVIO DO FORMULÁRIO
// -------------------------
document.getElementById('formulario').addEventListener('submit', function (e) {
    e.preventDefault();

    const numeroChamado = document.getElementById('numeroChamado').value;
    const nome = document.getElementById('nome').value;
    const motivo = document.getElementById('motivo').value;

    fetch(URL_SCRIPT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ numeroChamado, nome, motivo })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'sucesso') {
                document.getElementById('mensagem').innerText = 'Dados enviados com sucesso!';
                document.getElementById('mensagem').style.color = 'green';
                document.getElementById('formulario').reset();
            } else {
                document.getElementById('mensagem').innerText = 'Erro: ' + data.mensagem;
                document.getElementById('mensagem').style.color = "red";
            }
        })
        .catch(error => {
            document.getElementById('mensagem').innerText = 'Erro na requisição: ' + error.message;
            document.getElementById('mensagem').style.color = "red";
        });
});

