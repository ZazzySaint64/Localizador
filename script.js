// ========================================================
// 1. AS ETAPAS: localizações reais + as 3 charadas de texto
// ========================================================
const etapas = [
  {
    tipo: "localizacao",
    texto: "Nosso primeiro beijo",
    latitude: -30.14994417285114,
    longitude: -51.13829693246541,
    raioMetros: 40
  },

  {
    tipo: "texto",
    texto: "Qual é o nosso alimento do amor?",
    validacao: "texto",
    resposta: "arroz"
  },
  {
    tipo: "texto",
    texto: "Quantos graus estavam no dia do pedido?",
    validacao: "numero",
    resposta: "14"
  },
  {
    tipo: "texto",
    texto: "Qual foi a data do nosso primeiro beijo?",
    validacao: "data",
    dia: 12,
    mes: 6,
    ano: 2022
  },

  {
    tipo: "localizacao",
    texto: "Nosso banquinho especial",
    latitude: -30.14937798131834,
    longitude: -51.140007918973375,
    raioMetros: 40
  },
  {
    tipo: "localizacao",
    texto: "O lugar onde nos conhecemos",
    latitude: -30.14798257895677,
    longitude: -51.14486454595764,
    raioMetros: 40
  },
  {
    tipo: "localizacao",
    texto: "A nossa cafeteria favorita",
    latitude: -30.080083596325935,
    longitude: -51.24816089014033,
    raioMetros: 40
  }
];

let indiceAtual = 0;

// ========================================================
// 2. REFERÊNCIAS AOS ELEMENTOS DA TELA
// ========================================================
const elPergunta = document.getElementById("pergunta");
const elContador = document.getElementById("contador");
const elMensagem = document.getElementById("mensagem");
const elBotao = document.getElementById("botao-checar");
const elInput = document.getElementById("resposta-input");

// ========================================================
// 3. DISTÂNCIA ENTRE COORDENADAS (Haversine)
// ========================================================
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const raioTerraMetros = 6371000;
  const paraRadianos = (graus) => (graus * Math.PI) / 180;

  const deltaLat = paraRadianos(lat2 - lat1);
  const deltaLon = paraRadianos(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(paraRadianos(lat1)) *
      Math.cos(paraRadianos(lat2)) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return raioTerraMetros * c;
}

// ========================================================
// 4. NORMALIZAÇÃO DE TEXTO
// ========================================================
function normalizar(texto) {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ========================================================
// 5. VALIDAÇÃO DE RESPOSTA
// ========================================================
function respostaEstaCorreta(etapa, valorDigitado) {
  if (etapa.validacao === "texto") {
    return normalizar(valorDigitado) === normalizar(etapa.resposta);
  }

  if (etapa.validacao === "numero") {
    const encontrados = valorDigitado.match(/\d+/);
    return encontrados !== null && encontrados[0] === etapa.resposta;
  }

  if (etapa.validacao === "data") {
    const numeros = valorDigitado.match(/\d+/g);
    if (!numeros || numeros.length < 3) return false;

    const [diaDigitado, mesDigitado, anoDigitado] = numeros;

    return (
      parseInt(diaDigitado, 10) === etapa.dia &&
      parseInt(mesDigitado, 10) === etapa.mes &&
      parseInt(anoDigitado, 10) === etapa.ano
    );
  }

  return false;
}

// ========================================================
// 6. TEXTO DO CONTADOR
// ========================================================
function calcularTextoContador(indice) {
  const tipo = etapas[indice].tipo;
  const numero = etapas.slice(0, indice + 1).filter((e) => e.tipo === tipo).length;
  const total = etapas.filter((e) => e.tipo === tipo).length;

  return tipo === "localizacao"
    ? `Local ${numero} de ${total}`
    : `Charada ${numero} de ${total}`;
}

// ========================================================
// 7. MOSTRAR A ETAPA ATUAL
// ========================================================
function mostrarEtapaAtual() {
  const etapa = etapas[indiceAtual];

  elPergunta.textContent = etapa.texto;
  elContador.textContent = calcularTextoContador(indiceAtual);
  elMensagem.textContent = "";
  elMensagem.classList.remove("erro", "sucesso");

  if (etapa.tipo === "localizacao") {
    elInput.classList.add("escondido");
    elBotao.textContent = "É aqui!";
  } else {
    elInput.classList.remove("escondido");
    elInput.value = "";
    elBotao.textContent = "Responder";
    elInput.focus();
  }
}

// ========================================================
// 8. MENSAGEM DE ERRO (com animação)
// ========================================================
function mostrarErro(texto) {
  elMensagem.textContent = texto;
  elMensagem.classList.remove("erro");
  void elMensagem.offsetWidth;
  elMensagem.classList.add("erro");
}

// ========================================================
// 9. VERIFICAR LOCALIZAÇÃO
// ========================================================
function verificarLocalizacao(etapa) {
  if (!navigator.geolocation) {
    mostrarErro("Seu navegador não suporta geolocalização.");
    return;
  }

  elMensagem.textContent = "Verificando sua localização...";

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const distancia = calcularDistanciaMetros(
        posicao.coords.latitude,
        posicao.coords.longitude,
        etapa.latitude,
        etapa.longitude
      );

      if (distancia <= etapa.raioMetros) {
        avancarEtapa();
      } else {
        mostrarErro("Ops, lugar errado...");
      }
    },
    (erro) => {
      mostrarErro("Não foi possível obter sua localização. Verifique se você permitiu o acesso ao GPS.");
      console.error(erro);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ========================================================
// 10. VERIFICAR RESPOSTA DE TEXTO
// ========================================================
function verificarTexto(etapa) {
  if (respostaEstaCorreta(etapa, elInput.value)) {
    avancarEtapa();
  } else {
    mostrarErro("Ops, resposta errada...");
  }
}

// ========================================================
// 11. CLIQUE NO BOTÃO — ramifica por tipo
// ========================================================
function verificarEtapaAtual() {
  const etapa = etapas[indiceAtual];

  if (etapa.tipo === "localizacao") {
    verificarLocalizacao(etapa);
  } else {
    verificarTexto(etapa);
  }
}

// ========================================================
// 12. AVANÇAR PARA A PRÓXIMA ETAPA (OU TERMINAR O QUIZ)
// ========================================================
function avancarEtapa() {
  indiceAtual++;

  if (indiceAtual < etapas.length) {
    mostrarEtapaAtual();
  } else {
    elPergunta.textContent = "Parabéns! Você sabe tudo sobre nós! Feliz 4 anos de namoro, meu amor! ❤️";
    elContador.textContent = "";
    elMensagem.textContent = "";
    elMensagem.classList.add("sucesso");
    elBotao.classList.add("escondido");
    elInput.classList.add("escondido");
  }
}

// ========================================================
// 13. EVENTOS
// ========================================================
elBotao.addEventListener("click", verificarEtapaAtual);

elInput.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    verificarEtapaAtual();
  }
});

// ========================================================
// 14. INICIA O QUIZ
// ========================================================
mostrarEtapaAtual();
