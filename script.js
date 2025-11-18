// Substitua pela URL do seu web app implantado no Google Apps Script
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

let codeReader = null;
let stream = null;

// Botões
document.getElementById('start-camera-btn').addEventListener('click', startScanner);
document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);

// -------------------------
// INICIAR LEITOR ZXING
// -------------------------
async function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';

    codeReader = new ZXing.BrowserMultiFormatReader();

    try {
        const videoElement = document.getElementById('scanner-video');

        // Abre a câmera traseira
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        videoElement.srcObject = stream;
        videoElement.play();

        // Começa a leitura contínua
        codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
            if (result) {
                document.getElementById('numeroChamado').value = result.text;
                document.getElementById('mensagem').innerText = "Código Detectado!";
                document.getElementById('mensagem').style.color = "green";
                stopScanner();
            }
        });

        document.getElementById('mensagem').innerText = "Aponte a câmera para o código de barras...";
        document.getElementById('mensagem').style.color = "blue";

    } catch (error) {
        document.getElementById('mensagem').innerText = "Erro ao acessar câmera: " + error;
        document.getElementById('mensagem').style.color = "red";
    }
}

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
        body: new URLSearchParams({
            numeroChamado,
            nome,
            motivo
        })
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
