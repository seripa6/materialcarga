
/* js/ui.js — exposes DOM refs and helper to set messages */
const video = document.getElementById("scanner-video");
const startBtn = document.getElementById("start-camera-btn");
const stopBtn = document.getElementById("stop-scan-btn");
const restartBtn = document.getElementById("restart-scan-btn");
const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");
const scannerBox = document.getElementById("scanner-container");
const mensagem = document.getElementById("mensagem");
const numeroChamado = document.getElementById("numeroChamado");
const nome = document.getElementById("nome");
const motivo = document.getElementById("motivo");

function setMessage(text, color) {
    mensagem.textContent = text || '';
    mensagem.style.color = color || 'white';
}
