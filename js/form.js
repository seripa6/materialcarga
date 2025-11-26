const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHqrVpsKxgQGbP8A_RsQitW4BwkKtRMjGEKnT9y-ssBmZzyFpwR2Gdc7sJ6Kd711RK/exec";

let bloqueado = false;
let materialCarregado = false;

async function buscarMaterial(codigo) {
    if (!codigo) return;

    setMessage("🔍 Buscando...");

    const data = new URLSearchParams({
        acao: "buscar",
        codigo
    });

    try {
        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: data
        });

        const json = await res.json();
        if (json.status === "ok") {
            materialCarregado = true;
            descricao.value = json.descricao || "";
            setor.value = json.setor || "";
            setMessage("✔ Material encontrado!", "limegreen");
        } else {
            materialCarregado = false;
            descricao.value = "";
            setor.value = "";
            setMessage("❌ Código não encontrado!", "red");
        }

    } catch (err) {
        console.error(err);
        setMessage("⚠ Erro ao conectar!", "red");
    }
}


async function enviarRegistro(codigo, novoSetor) {
    const data = new URLSearchParams({
        acao: novoSetor ? "registrarAlteracao" : "registrar",
        codigo,
        novoSetor: novoSetor || ""
    });

    try {
        const res = await fetch(SCRIPT_URL, { method: "POST", body: data });
        const json = await res.json();

        // 🔥 Aqui continua "sucesso" porque o GAS retorna isso corretamente
        if (json.status === "sucesso") {
            setMessage("📦 Registro salvo!", "limegreen");
            return true;
        } else {
            setMessage("⚠ Erro ao salvar!", "orange");
            return false;
        }
    } catch (error) {
        setMessage("🚨 Falha na conexão!", "red");
        return false;
    }
}


// 📤 Submit
formulario.addEventListener("submit", async e => {
    e.preventDefault();

    if (bloqueado) return;  // evita envios repetidos

    const codigo = numeroChamado.value.trim();
    const novoSetor = alterarSetor.value;

    if (!codigo) {
        setMessage("⚠ Digite ou escaneie um código!", "orange");
        return;
    }
    if (!materialCarregado) {
        setMessage("⚠ Busque um material válido antes de enviar!", "orange");
        return;
    }

    bloqueado = true; // trava o envio

    const ok = await enviarRegistro(codigo, novoSetor);

    if (ok) {
        formulario.reset();
        setTimeout(() => startScanner(), 800);
    }

    setTimeout(() => bloqueado = false, 1200); // libera envio depois de 1.2s
});


// Ao sair do campo (caso não pressione Enter)
numeroChamado.addEventListener("blur", () => {
    if (numeroChamado.value.trim().length > 0) {
        buscarMaterial(numeroChamado.value.trim());
    }
});