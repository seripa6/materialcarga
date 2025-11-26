/* js/ui.js — DOM e helper */

const video = document.getElementById("scanner-video");
const startBtn = document.getElementById("start-camera-btn");
const stopBtn = document.getElementById("stop-scan-btn");
const restartBtn = document.getElementById("restart-scan-btn");
const flashBtn = document.getElementById("flash-btn");
const zoomControl = document.getElementById("zoomControl");
const scannerContainer = document.getElementById("scanner-container");

const formulario = document.getElementById("formulario");

const numeroChamado = document.getElementById("numeroChamado");
const descricao = document.getElementById("descricao");
const setor = document.getElementById("setor");
const alterarSetor = document.getElementById("alterarSetor");
const mensagem = document.getElementById("mensagem");

function setMessage(text, color = "white") {
    mensagem.textContent = text;
    mensagem.style.color = color;
}

window.video = video;
window.startBtn = startBtn;
window.stopBtn = stopBtn;
window.restartBtn = restartBtn;
window.flashBtn = flashBtn;
window.zoomControl = zoomControl;
window.scannerContainer = scannerContainer;

window.numeroChamado = numeroChamado;
window.descricao = descricao;
window.setor = setor;
window.alterarSetor = alterarSetor;
window.formulario = formulario;
window.setMessage = setMessage;
