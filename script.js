 async function scanWithDetector() {
            if (!scanning) return;
            try {
                const barcodes = await detector.detect(video);
                if (barcodes && barcodes.length) {
                    barcodeInput.value = barcodes[0].rawValue;
                    status.textContent = 'Código detectado: ' + barcodes[0].rawValue;
                    // opcional: parar após leitura
                    // scanning = false;
                } else {
                    status.textContent = 'Nenhum código por enquanto...';
                }
            } catch (err) {
                console.error(err);
                status.textContent = 'Erro na leitura: ' + err;
            }
            requestAnimationFrame(scanWithDetector);
        }


        // captura foto a partir do vídeo
        btnCapture.addEventListener('click', () => {
            if (!video.srcObject) { status.textContent = 'Abra a câmera primeiro (Iniciar scanner).'; return; }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            showPreview(dataUrl);
        });


        fileInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = function () {
                showPreview(reader.result);
            }
            reader.readAsDataURL(f);
        });


        function showPreview(dataUrl) {
            previewWrap.innerHTML = '';
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            previewWrap.appendChild(img);
            previewWrap.dataset.image = dataUrl; // armazena para envio
        }


        // Enviar para Apps Script
        btnSend.addEventListener('click', () => {
            const code = barcodeInput.value.trim();
            const checked = document.getElementById('conferido').checked;
            const imageData = previewWrap.dataset.image || '';
            status.textContent = 'Enviando...';
            // google.script.run só funciona quando o HTML está hospedado em Apps Script
            google.script.run.withSuccessHandler(function (res) {
                if (res && res.status === 'OK') {
                    status.textContent = 'Salvo! URL da foto: ' + (res.photoUrl || '---');
                } else if (res && res.status === 'ERROR') {
                    status.textContent = 'Erro: ' + res.message;
                } else {
                    status.textContent = 'Resposta inesperada.';
                }
                // limpa preview opcional
                // previewWrap.innerHTML = '';
            }).saveRecord(code, checked, imageData);
        });
