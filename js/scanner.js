
/* js/scanner.js — camera, ZXing and controls */
let stream = null;
let track = null;
let codeReader = null;
let scanning = false;

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 750;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
        console.error('beep error', e);
    }
}

async function startScanner() {
    try {
        scannerBox.classList.remove('hidden');
        scanning = true;

        numeroChamado.value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("setor").value = "";
        

        // ZXing browser exposes ZXingBrowser
        codeReader = new ZXingBrowser.BrowserMultiFormatReader();

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        track = stream.getVideoTracks()[0];
        setupZoom();

        codeReader.decodeFromVideoDevice(null, video, async (result) => {
            if (result && scanning) {
                scanning = false;
                stopScanner();

                playBeep();
                navigator.vibrate?.(120);

                const codigo = result.text.trim();
                numeroChamado.value = codigo;
                setMessage("🔍 Buscando material...", "orange");

                const resp = await fetch(URL_SCRIPT, {
                    method: "POST",
                    body: new URLSearchParams({
                        acao: "buscar",
                        codigo
                    })
                });

                const dados = await resp.json();

                if (dados.status === "ok") {
                    document.getElementById("descricao").value = dados.descricao;
                    document.getElementById("setor").value = dados.setor;
                    setMessage("✔ Material encontrado!", "limegreen");

                } else {
                    setMessage("❌ Código não encontrado!", "red");
                }
            }
        });
    } catch (err) {
        console.error(err);
        setMessage('Erro ao acessar câmera: ' + (err.message || err), 'orange');
    }
}

function stopScanner() {
    scanning = false;

    try { codeReader?.reset(); } catch (e) { }

    if (stream) {
        stream.getTracks().forEach(t => {
            try { t.stop(); } catch (e) { }
        });
    }

    scannerBox.classList.add('hidden'); // esconde scanner
}

function restartScan() {
    scanning = true;
    setMessage('Escaneando...');
}

async function toggleFlash() {
    if (!track) return alert('Não há câmera ativa.');
    const caps = track.getCapabilities();
    if (!caps.torch) return alert('Lanterna não suportada.');

    const on = flashBtn.dataset.state !== 'on';
    try {
        await track.applyConstraints({ advanced: [{ torch: on }] });
        flashBtn.dataset.state = on ? 'on' : 'off';
        flashBtn.innerText = on ? '❌' : '🔦';
    } catch (e) {
        console.error('toggleFlash', e);
        alert('Erro ao alternar lanterna.');
    }
}

function setupZoom() {
    if (!track) return;
    const caps = track.getCapabilities();
    if (!caps.zoom) { zoomControl.disabled = true; return; }
    zoomControl.disabled = false;
    zoomControl.min = caps.zoom.min;
    zoomControl.max = caps.zoom.max;
    zoomControl.value = caps.zoom.min || 1;
}

async function setZoom() {
    if (!track) return;
    try { await track.applyConstraints({ advanced: [{ zoom: zoomControl.value }] }); } catch (e) { }
}

// wire buttons (these assume ui.js loaded first)
startBtn.onclick = async () => { try { playBeep(); } catch (e) { }; await startScanner(); };
stopBtn.onclick = stopScanner;
restartBtn.onclick = restartScan;
flashBtn.onclick = toggleFlash;
zoomControl.oninput = setZoom;
