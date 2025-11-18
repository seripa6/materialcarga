// Substitua pela URL do seu web app implantado no Google Apps Script
const URL_SCRIPT = "https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec";

let scannerInitialized = false;
let detectionActive = false;

document.getElementById('start-camera-btn').addEventListener('click', function () {
    if (!scannerInitialized) {
        startCamera();
    }
});

document.getElementById('detect-btn').addEventListener('click', function () {
    if (scannerInitialized && !detectionActive) {
        startDetection();
    }
});

document.getElementById('stop-scan-btn').addEventListener('click', function () {
    stopCamera();
});

function startCamera() {
    document.getElementById('scanner-container').style.display = 'block';
    scannerInitialized = true;

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-video'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Usa câmera traseira em dispositivos móveis
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 2,
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "upc_reader", "upc_e_reader"] // Tipos de códigos suportados
        },
        locate: false  // Desabilitado inicialmente para apenas mostrar o vídeo
    }, function (err) {
        if (err) {
            console.log(err);
            document.getElementById('mensagem').innerText = 'Erro ao iniciar câmera: ' + err.message;
            return;
        }
        Quagga.start();
        document.getElementById('mensagem').innerText = 'Câmera iniciada. Clique em "Detectar Código" para escanear.';
        document.getElementById('mensagem').style.color = 'blue';
    });
}

function startDetection() {
    detectionActive = true;
    Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        document.getElementById('numeroChamado').value = code;
        stopCamera();
        document.getElementById('mensagem').innerText = 'Código detectado: ' + code;
        document.getElementById('mensagem').style.color = 'green';
    });
    document.getElementById('mensagem').innerText = 'Detecção ativada. Aponte para o código de barras.';
    document.getElementById('mensagem').style.color = 'orange';
}

function stopCamera() {
    Quagga.stop();
    document.getElementById('scanner-container').style.display = 'none';
    scannerInitialized = false;
    detectionActive = false;
    document.getElementById('mensagem').innerText = '';
}

document.getElementById('formulario').addEventListener('submit', function (e) {
    e.preventDefault();

    const numeroChamado = document.getElementById('numeroChamado').value;
    const nome = document.getElementById('nome').value;
    const motivo = document.getElementById('motivo').value;

    // Enviar dados via POST
    fetch(URL_SCRIPT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            numeroChamado: numeroChamado,
            nome: nome,
            motivo: motivo
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
            }
        })
        .catch(error => {
            document.getElementById('mensagem').innerText = 'Erro na requisição: ' + error.message;
        });
});