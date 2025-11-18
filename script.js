const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

let codeReader = null;
let stream = null;
let track = null;
let torchOn = false;

// Som offline (sem internet)
const beep = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");

// Botões
document.getElementById('start-camera-btn').addEventListener('click', startScanner);
document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);

// Criar controles
const scannerContainer = document.getElementById("scanner-container");

scannerContainer.insertAdjacentHTML("beforeend", `
    <button id="flash-btn" style="margin-top:10px;width:100%;">🔦 Ligar Lanterna</button>
    <label style="margin-top:10px; display:block;">Zoom:</label>
    <input type="range" id="zoomControl" min="1" max="5" step="0.1" value="1" style="width:100%;">
`);

const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");

async function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';

    const hints = new Map();
    hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
    hints.set(ZXing.DecodeHintType.ASSUME_GS1, true);
    hints.set(ZXing.DecodeHintType.PURE_BARCODE, true);

    codeReader = new ZXing.BrowserMultiFormatReader(hints);

    try {
        const videoElement = document.getElementById('scanner-video');

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 4096 }, // 4K melhora muito códigos pequenos
                height: { ideal: 2160 },
                focusMode: "continuous"
            }
        });

        videoElement.srcObject = stream;
        videoElement.play();

        track = stream.getVideoTracks()[0];

        const capabilities = track.getCapabilities();

        // Zoom habilitado
        if (capabilities.zoom) {
            zoomControl.min = capabilities.zoom.min;
            zoomControl.max = capabilities.zoom.max;
            zoomControl.value = capabilities.zoom.min;
            zoomControl.disabled = false;
        }

        // Autofocus contínuo
        setInterval(() => {
            if (track) {
                track.applyConstraints({
                    advanced: [{ focusMode: "continuous" }]
                });
            }
        }, 1200);

        // Leitura contínua
        codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
                beep.play();
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

// Lanterna
flashBtn.addEventListener("click", async () => {
    if (!track || !track.getCapabilities().torch) {
        alert("Seu dispositivo não suporta lanterna.");
        return;
    }

    torchOn = !torchOn;
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });

    flashBtn.innerText = torchOn ? "❌ Apagar Lanterna" : "🔦 Ligar Lanterna";
});

// Zoom
zoomControl.addEventListener("input", async () => {
    if (!track) return;
    await track.applyConstraints({
        advanced: [{ zoom: zoomControl.value }]
    });
});

// Parar scanner
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

// Envio do formulário
document.getElementById('formulario').addEventListener('submit', function (e) {
    e.preventDefault();

    const numeroChamado = document.getElementById('numeroChamado').value;
    const nome = document.getElementById('nome').value;
    const motivo = document.getElementById('motivo').value;

    fetch(URL_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
