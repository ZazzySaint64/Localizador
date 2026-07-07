// ========================================================
// 1. OS DADOS: as 4 perguntas, cada uma com sua coordenada-alvo
// ========================================================
// Guardamos como uma LISTA de objetos (em vez de 4 blocos de código
// repetidos) para termos UMA lógica só que serve para as 4 perguntas.
const perguntas = [
  {
    texto: "Nosso primeiro beijo",
    latitude: -30.14994417285114,
    longitude: -51.13829693246541,
    raioMetros: 40
  },
  {
    texto: "Nosso banquinho especial",
    latitude: -30.14937798131834,
    longitude: -51.140007918973375,
    raioMetros: 40
  },
  {
    texto: "O lugar onde nos conhecemos",
    latitude: -30.14798257895677,
    longitude: -51.14486454595764,
    raioMetros: 40
  },
  {
    texto: "A nossa cafeteria favorita",
    latitude: -30.080083596325935,
    longitude: -51.24816089014033,
    raioMetros: 40
  }
];

// Guarda em qual pergunta o usuário está agora (começa na 0)
let indiceAtual = 0;

// ========================================================
// 2. REFERÊNCIAS AOS ELEMENTOS DA TELA
// ========================================================
// Pegamos uma vez só, no início, para não ter que buscar
// no HTML toda vez que precisarmos usá-los.
const elPergunta = document.getElementById("pergunta");
const elContador = document.getElementById("contador");
const elMensagem = document.getElementById("mensagem");
const elBotao = document.getElementById("botao-checar");

// ========================================================
// 3. FUNÇÃO QUE CALCULA A DISTÂNCIA ENTRE DUAS COORDENADAS
// ========================================================
// Fórmula de Haversine: retorna a distância em METROS entre
// dois pontos (lat1,lon1) e (lat2,lon2), considerando que a
// Terra é uma esfera (não um plano).
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const raioTerraMetros = 6371000;

  // A fórmula trabalha com radianos, não graus, então convertemos.
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
// 4. FUNÇÃO QUE ATUALIZA A TELA COM A PERGUNTA ATUAL
// ========================================================
function mostrarPerguntaAtual() {
  const pergunta = perguntas[indiceAtual];
  elPergunta.textContent = pergunta.texto;
  elContador.textContent = `Pergunta ${indiceAtual + 1} de ${perguntas.length}`;
  elMensagem.textContent = "";
}

// ========================================================
// 5. FUNÇÃO PRINCIPAL: chamada quando o usuário aperta "É aqui!"
// ========================================================
function verificarLocalizacao() {
  // Verifica se o navegador suporta geolocalização
  if (!navigator.geolocation) {
    elMensagem.textContent = "Seu navegador não suporta geolocalização.";
    return;
  }

  elMensagem.textContent = "Verificando sua localização...";

  navigator.geolocation.getCurrentPosition(
    // Callback de SUCESSO: o navegador conseguiu a posição
    (posicao) => {
      const latUsuario = posicao.coords.latitude;
      const lonUsuario = posicao.coords.longitude;

      const alvo = perguntas[indiceAtual];
      const distancia = calcularDistanciaMetros(
        latUsuario,
        lonUsuario,
        alvo.latitude,
        alvo.longitude
      );

      // if / else pedido: perto o suficiente do alvo?
      if (distancia <= alvo.raioMetros) {
        avancarParaProximaPergunta();
      } else {
        elMensagem.textContent = "Ops, lugar errado...";
      }
    },
    // Callback de ERRO: usuário negou permissão, GPS falhou, etc.
    (erro) => {
      elMensagem.textContent = "Não foi possível obter sua localização. Verifique se você permitiu o acesso ao GPS.";
      console.error(erro);
    },
    // Opções: pede a posição mais precisa possível
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ========================================================
// 6. AVANÇAR PARA A PRÓXIMA PERGUNTA (OU TERMINAR O QUIZ)
// ========================================================
function avancarParaProximaPergunta() {
  indiceAtual++;

  if (indiceAtual < perguntas.length) {
    mostrarPerguntaAtual();
  } else {
    elPergunta.textContent = "Parabéns! Você sabe tudo sobre nós!";
    elContador.textContent = "";
    elMensagem.textContent = "";
    elBotao.style.display = "none";
  }
}

// ========================================================
// 7. LIGANDO O BOTÃO À FUNÇÃO E INICIANDO O QUIZ
// ========================================================
elBotao.addEventListener("click", verificarLocalizacao);
mostrarPerguntaAtual();
