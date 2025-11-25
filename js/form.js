/* js/form.js — handles form submit and sending to Google Apps Script */
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

document.getElementById("formulario").addEventListener("submit", async e => {
    e.preventDefault();

    const codigoDigitado = document.getElementById("numeroChamado").value.trim();
    const setorAtual = document.getElementById("setor").value.trim();
    const novoSetor = document.getElementById("alterarSetor").value.trim();

    if (!codigoDigitado) {
        setMessage("⚠️ Digite ou escaneie um código!", "orange");
        return;
    }

    // Mantém zeros à esquerda e garante tamanho mínimo 9 (ajuste se necessário)
    const codigo = codigoDigitado.padStart(9, "0");

    const acao = novoSetor && novoSetor !== setorAtual
        ? "registrarAlteracao"
        : "registrar";

    const data = new URLSearchParams({
        acao,
        codigo,
        novoSetor: novoSetor || setorAtual
    });

    try {
        const res = await fetch(URL_SCRIPT, { method: "POST", body: data });
        const json = await res.json();

        if (json.status === "sucesso") {
            setMessage("📦 Registro salvo!", "limegreen");
            e.target.reset();
            setTimeout(() => startScanner(), 800);
        } else {
            setMessage("❌ Erro ao salvar!", "red");
        }
    } catch (error) {
        setMessage("🚨 Falha de comunicação com o servidor!", "red");
        console.error(error);
    }
});
