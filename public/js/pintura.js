let canvas;
let ctx;

const aviao = localStorage.getItem("aviao");

document.getElementById("aviaoTitulo").textContent = aviao;

const vistas = [
  "esquerda",
  "direita",
  "cima"
];

let pixelsPintados = 0;

let vistaAtual = 0;

let progresso = 0;
let painting = false;

let mudandoVista = false;

let pixelVisitado = null;

let maskAviaoData = null;

const pb = new Image();
const colorida = new Image();

const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");

const inicio = Number(localStorage.getItem("inicio"));

setInterval(() => {

  const decorrido =
    Date.now() - inicio;

  const minutos =
    Math.floor(decorrido / 60000);

  const segundos =
    Math.floor((decorrido % 60000) / 1000);

  const centesimos =
    Math.floor((decorrido % 1000) / 10);

  document.getElementById("tempo").textContent =
    `${String(minutos).padStart(2, "0")}:` +
    `${String(segundos).padStart(2, "0")}.` +
    `${String(centesimos).padStart(2, "0")}`;

}, 10);

carregarVista();

function carregarVista() {

  mudandoVista = false;

  progresso = 0;

  document.getElementById("progresso").textContent =
    progresso;

  document.getElementById("vista").textContent =
    vistas[vistaAtual].toUpperCase();

  pb.src =
    `assets/${aviao}/${vistas[vistaAtual]}.jpg`;

  colorida.src =
    `assets/${aviao}/${vistas[vistaAtual]}_pintado.jpg`;

  console.log(pb.src);
  console.log(colorida.src);

  Promise.all([
    new Promise(r => pb.onload = r),
    new Promise(r => colorida.onload = r)
  ]).then(() => {

    const canvas = document.querySelector("canvas");
    iniciarCanvas(canvas);

  });
}

function iniciarCanvas(canvasEl) {

  canvas = canvasEl;
  ctx = canvas.getContext("2d");


  canvas.addEventListener("pointerdown", () => {
    painting = true;
  });

  canvas.addEventListener("pointerup", () => {
    painting = false;
  });

  canvas.addEventListener("pointerleave", () => {
    painting = false;
  });

  canvas.addEventListener("pointermove", pintar);

  pixelVisitado = new Uint8Array(pb.width * pb.height);

  canvas.width = pb.width;
  canvas.height = pb.height;

  maskCanvas.width = pb.width;
  maskCanvas.height = pb.height;

  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

  calcularMascaraAviao();

  redraw();
}

function redraw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo = avião preto e branco
  ctx.drawImage(
    pb,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Canvas temporário
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  const tempCtx = tempCanvas.getContext("2d");

  // Avião colorido
  tempCtx.drawImage(
    colorida,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Mantém apenas as zonas pintadas
  tempCtx.globalCompositeOperation = "destination-in";

  tempCtx.drawImage(
    maskCanvas,
    0,
    0
  );

  // Coloca as zonas coloridas por cima do PB
  ctx.drawImage(
    tempCanvas,
    0,
    0
  );
}


function pintar(e) {

  if (!painting) return;

  if (mudandoVista) return;

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x =
    (e.clientX - rect.left) * scaleX;

  const y =
    (e.clientY - rect.top) * scaleY;

  maskCtx.fillStyle = "white";

  maskCtx.beginPath();

  maskCtx.arc(
    x,
    y,
    20,
    0,
    Math.PI * 2
  );

  maskCtx.fill();

  redraw();

  calcularProgresso();
}

function revelarCor() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.drawImage(pb, 0, 0);

  ctx.save();

  ctx.drawImage(maskCanvas, 0, 0);

  ctx.globalCompositeOperation =
    "source-in";

  ctx.drawImage(
    colorida,
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.restore();

  ctx.drawImage(pb, 0, 0);
}

function terminar() {

  const tempoFinal =
    Math.floor(
      (Date.now() - inicio) / 1000
    );

  const resultado = {

    nome:
      localStorage.getItem("nome"),

    aviao:
      localStorage.getItem("aviao"),

    tempo:
      tempoFinal
  };

  localStorage.setItem(
    "resultado",
    JSON.stringify(resultado)
  );

  location.href =
    "resultado.html";
}

function calcularProgresso() {

  const data = maskCtx.getImageData(
    0, 0,
    maskCanvas.width,
    maskCanvas.height
  ).data;

  let pintadosAviao = 0;
  let totalAviao = 0;

  for (let i = 0; i < data.length; i += 4) {

    const idx = i / 4;

    if (maskAviaoData && maskAviaoData[idx] === 1) {

      totalAviao++;

      if (data[i + 3] > 0) {
        pintadosAviao++;
      }
    }
  }

  if (totalAviao === 0) {
    progresso = 0;
  } else {
    progresso = (pintadosAviao / totalAviao) * 100;
  }

  if (isNaN(progresso)) progresso = 0;
  if (progresso > 100) progresso = 100;

  document.getElementById("progresso").textContent =
    Math.floor(progresso);

  document.getElementById("progresso-fill").style.width =
    Math.floor(progresso) + "%";

  if (progresso >= 98 && !mudandoVista) {

    mudandoVista = true;

    painting = false;

    vistaAtual++;

    console.log(
      "Mudou para vista:",
      vistaAtual
    );

    if (vistaAtual >= vistas.length) {

      terminar();

    } else {

      animarTrocaVista(() => {

        carregarVista();

      });

    }
  }
}

function calcularMascaraAviao() {

  const temp = document.createElement("canvas");
  temp.width = pb.width;
  temp.height = pb.height;

  const tctx = temp.getContext("2d");
  tctx.drawImage(pb, 0, 0);

  const data = tctx.getImageData(
    0, 0,
    temp.width,
    temp.height
  ).data;

  maskAviaoData = new Uint8Array(data.length / 4);

  for (let i = 0; i < data.length; i += 4) {

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isAviao =
      (r + g + b) / 3 < 250;

    maskAviaoData[i / 4] = isAviao ? 1 : 0;
  }
}

function trocarVistaAnimada(callbackNovaVista) {

  const carousel = document.getElementById("carousel");

  const atual = carousel.querySelector(".slide");

  // cria novo slide
  const novoSlide = document.createElement("div");
  novoSlide.classList.add("slide", "enter-right");

  const novoCanvas = document.createElement("canvas");
  novoCanvas.id = "canvas";

  novoSlide.appendChild(novoCanvas);
  carousel.appendChild(novoSlide);

  // força render
  requestAnimationFrame(() => {

    atual.classList.add("exit-left");
    novoSlide.classList.remove("enter-right");
    novoSlide.classList.add("active");

  });

  // cleanup + callback
  setTimeout(() => {

    atual.remove();

    callbackNovaVista(novoCanvas);

  }, 600);
}

function animarTrocaVista(callback) {

  // sai para a esquerda
  canvas.style.transform = "translateX(-120%)";
  canvas.style.opacity = "0";

  setTimeout(() => {

    callback(); // muda imagem

    // entra da direita
    canvas.style.transition = "none";
    canvas.style.transform = "translateX(120%)";

    // força reflow
    canvas.offsetHeight;

    canvas.style.transition = "transform .6s ease, opacity .6s ease";
    canvas.style.transform = "translateX(0)";
    canvas.style.opacity = "1";

  }, 600);
}