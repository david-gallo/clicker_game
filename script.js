document.addEventListener("DOMContentLoaded", () => {
  //====================== VARIABLES ======================//
  let puntos = 0;
  let nivel = 1;
  let velocidadAyudantes = 1000;
  let mejoras = [];
  let clicsManuales = 0;
  let manualCPS = 0;
  let autoCPS = 0;

  const mejora1 = document.querySelector("#card_mejora1");
  const mejora2 = document.querySelector("#card_mejora2");
  const mejora3 = document.querySelector("#card_mejora3");
  const puntosTexto = document.querySelector("#totalPoints"); 
  const boton = document.querySelector("#boton");
  const manualCPSOutput = document.querySelector("#manualCPS");
  const autoCPSOutput = document.querySelector("#autoCPS");
  const totalCPSOutput = document.querySelector("#totalCPS");
  const btnEstadisticas = document.getElementById("btnestadisticas");
  const statsCard = document.getElementById("statsCard");
  


  //====================== ANIMACIONES INICIALES ======================//
  Splitting();
  anime({
    targets: '.char',
    translateY: [-50, 0],
    opacity: [0, 1],
    easing: 'easeOutExpo',
    duration: 1000,
    delay: anime.stagger(100)
  });

  //====================== CARGAR DATOS ======================//
  async function cargarMejoras() {
    try {
      const response = await fetch("mejoras.json");
      if (!response.ok) throw new Error("No se pudo cargar mejoras.json");
      const data = await response.json();

      mejoras = data.map(m => ({
        nombre: m.nombre,
        precio: m.precio,
        descripcion: m.descripcion,
        cantidad: m.cantidad || 0,
      }));

      if (localStorage.getItem("mejoras")) {
        const mejorasLS = JSON.parse(localStorage.getItem("mejoras"));
        mejoras = mejoras.map((m, i) => ({
          ...m,
          cantidad: mejorasLS[i]?.cantidad ?? m.cantidad,
          precio: mejorasLS[i]?.precio ?? m.precio,
        }));
      }

      puntos = parseInt(localStorage.getItem("puntos")) || 0;
      nivel = parseInt(localStorage.getItem("nivel")) || 1;
      velocidadAyudantes = parseInt(localStorage.getItem("velocidadAyudantes")) || 1000;

      renderizarCards();
      actualizarPuntosEnPantalla();
      if (mejoras[1].cantidad > 0) iniciarAyudante();
      agregarListenersCards();  // Solo una vez
    } catch (error) {
      console.error("Error al cargar mejoras:", error);
    }
  }

  cargarMejoras();

  //====================== GUARDAR PROGRESO ======================//
  function guardarProgreso() {
    localStorage.setItem("puntos", puntos);
    localStorage.setItem("nivel", nivel);
    localStorage.setItem("mejoras", JSON.stringify(mejoras));
    localStorage.setItem("velocidadAyudantes", velocidadAyudantes);
  }

  //====================== ACTUALIZAR PUNTOS EN PANTALLA ======================//
  function actualizarPuntosEnPantalla() {
    puntosTexto.value = puntos;
  }

  //====================== BOTÓN PRINCIPAL ======================//
  boton.addEventListener("click", () => {
    clicsManuales++; 

    anime({
      targets: boton,
      scale: [
        { value: 1.2, duration: 150, easing: 'easeOutQuad' },
        { value: 1, duration: 150, easing: 'easeInQuad' }
      ],
      rotate: [
        { value: 15, duration: 150, easing: 'easeOutQuad' },
        { value: 0, duration: 150, easing: 'easeInQuad' }
      ]
    });
  });

  //====================== COMBO DE CLICKS ======================//
  let comboClicks = 0;
  let comboTimer;

  boton.addEventListener("click", () => {
    comboClicks++;
    animarPunto(comboClicks * nivel);

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      const puntosGanados = nivel * comboClicks;
      puntos += puntosGanados;
      actualizarPuntosEnPantalla();
      comboClicks = 0;
      guardarProgreso();
    }, 300);
  });

  function animarPunto(cantidad = 1) {
    const punto = document.createElement("span");
    punto.className = "punto-flotante";
    punto.innerText = `+${cantidad}`;

    const rect = boton.getBoundingClientRect();
    punto.style.left = rect.left + rect.width / 2 + (Math.random() * 190 - 90) + "px";
    punto.style.top = rect.top + rect.height / 2 + (Math.random() * 30) + window.scrollY + "px";

    document.body.appendChild(punto);

    anime({
      targets: punto,
      translateY: -60,
      scale: [2, 0.8],
      opacity: [1, 0],
      duration: 1200,
      easing: "easeOutCubic",
      complete: () => punto.remove(),
    });
  }

  //====================== RENDER DE TODAS LAS CARDS ======================//
  function renderizarCards() {
    renderizarCardIndividual(0);
    renderizarCardIndividual(1);
    renderizarCardIndividual(2);
  }

  //====================== RENDER DE UNA CARD INDIVIDUAL ======================//
  function renderizarCardIndividual(indice) {
    let card;
    switch(indice) {
      case 0: card = mejora1; break;
      case 1: card = mejora2; break;
      case 2: card = mejora3; break;
      default: return;
    }

    let contenido = "";
    switch(indice) {
      case 0:
        contenido = `
          <p>MAS PODER DE CLICKS</p>
          <p>agrega +1 a tus clicks</p>
          <p>precio: ${mejoras[0].precio} puntos</p>
          <p>nivel ${mejoras[0].cantidad}</p>
        `;
        break;
      case 1:
        contenido = `
          <p>UN AMIGITO TE AYUDARÁ</p>
          <p>agrega +1 a tu puntaje automáticamente</p>
          <p>precio: ${mejoras[1].precio} puntos</p>
          <p>nivel ${mejoras[1].cantidad}</p>
        `;
        break;
      case 2:
        contenido = `
          <p>+ VELOCIDAD DE AYUDANTE</p>
          <p>clicks más rápidos del ayudante</p>
          <p>precio: ${mejoras[2].precio} puntos</p>
          <p>nivel ${mejoras[2].cantidad}</p>
          <p>velocidad: ${velocidadAyudantes} ms</p>
        `;
        break;
    }
    card.innerHTML = contenido;

    animarMejora(card);
  }

  //====================== ANIMAR SOLO UNA CARD ======================//
function animarMejora(card) {
  anime.timeline()
    .add({
      targets: card,
      scale: [1, 1.1],
      opacity: [1, 0.8],  
      duration: 200,
      easing: 'easeOutQuad'
    })
    .add({
      targets: card,
      scale: 1,
      opacity: 1,
      duration: 400,
      easing: 'easeOutElastic(1, .5)' 
    });
}
  //====================== AGREGAR LISTENER SOLO UNA VEZ ======================//
  function agregarListenersCards() {
    [mejora1, mejora2, mejora3].forEach((card, index) => {
      card.addEventListener('click', () => {
        comprarMejora(index);
        // Animar el click del usuario
        anime({
          targets: card,
          scale: [1, 1.05],
          duration: 150,
          direction: 'alternate',
          easing: 'easeInOutQuad'
        });
      });
    });
  }

  //====================== COMPRAR MEJORAS ======================//
  function comprarMejora(index) {
    switch(index) {
      case 0:
        if (puntos >= mejoras[0].precio) {
          puntos -= mejoras[0].precio;
          mejoras[0].cantidad++;
          nivel++;
          mejoras[0].precio = 25 + mejoras[0].cantidad * 20;
          guardarProgreso();
          renderizarCardIndividual(0);
          actualizarPuntosEnPantalla();
        } else {
          mostrarMensaje("mensaje", "¡No tienes suficientes puntos!");
        }
        break;
      case 1:
        if (puntos >= mejoras[1].precio) {
          puntos -= mejoras[1].precio;
          mejoras[1].cantidad += 5;
          mejoras[1].precio = 100 + mejoras[1].cantidad * 50;
          iniciarAyudante();
          guardarProgreso();
          renderizarCardIndividual(1);
          actualizarPuntosEnPantalla();
        } else {
          mostrarMensaje("mensaje", "No tienes suficientes puntos para el ayudante.");
        }
        break;
      case 2:
        if (puntos >= mejoras[2].precio && mejoras[1].cantidad > 0) {
          puntos -= mejoras[2].precio;
          mejoras[2].cantidad++;
          velocidadAyudantes = Math.max(100, velocidadAyudantes - 100);
          mejoras[2].precio = 500 + mejoras[2].cantidad * 150;
          iniciarAyudante();
          guardarProgreso();
          renderizarCardIndividual(2);
          actualizarPuntosEnPantalla();
        } else {
          mostrarMensaje("mensaje", "Primero necesitás un ayudante activo.");
        }
        break;
    }
  }

  //====================== MENSAJES ======================//
  function mostrarMensaje(id = "mensaje", texto = "No tienes suficientes puntos") {
    const mensaje = document.querySelector(`#${id}`);
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.classList.add("mensaje-activo");

    setTimeout(() => mensaje.classList.remove("mensaje-activo"), 3000);
  }

  //====================== AYUDANTE AUTOMÁTICO ======================//
  let intervaloAyudante;

  function iniciarAyudante() {
    clearInterval(intervaloAyudante);
    intervaloAyudante = setInterval(() => {
      puntos += mejoras[1].cantidad;
      actualizarPuntosEnPantalla();
      guardarProgreso();
    }, velocidadAyudantes);
  }

  //====================== MENU INICIO ======================//
  const menuInicio = document.querySelector(".menu_inicio");
  const opcionesMenu = document.querySelectorAll(".menu_inicio__opcion");
  const gridJuego = document.querySelector(".grid");

  opcionesMenu.forEach(opcion => {
    opcion.addEventListener("click", () => {
      if (opcion.textContent === "tutorial") {
        alert("Aquí va el tutorial del juego.");
      } else if (opcion.textContent === "inicio") {
        menuInicio.style.display = "none";
        gridJuego.classList.remove("oculto");
      }
    });
  });

  //====================== MODAL DE RESET ======================//
  const modalReset = document.querySelector("#modal-reset");
  const btnConfirmarReset = document.querySelector("#confirmar-reset");
  const btnCancelarReset = document.querySelector("#cancelar-reset");

  document.querySelector("#reset").addEventListener("click", () => {
    modalReset.style.display = "flex";
  });

  btnConfirmarReset.addEventListener("click", () => {
    puntos = 0;
    nivel = 1;
    velocidadAyudantes = 1000;
    mejoras = [
      { nombre: "Mejora 1", precio: 25, descripcion: "más puntos por clic", cantidad: 1 },
      { nombre: "Mejora 2", precio: 100, descripcion: "ayudante que te da puntos", cantidad: 0 },
      { nombre: "Mejora 3", precio: 500, descripcion: "aumenta velocidad", cantidad: 1 }
    ];
    localStorage.clear();
    renderizarCards();
    iniciarAyudante();
    actualizarPuntosEnPantalla();
    manualCPSOutput.value = "0";
    autoCPSOutput.value = "0";
    totalCPSOutput.value = "0";
    modalReset.style.display = "none";
  });

  btnCancelarReset.addEventListener("click", () => {
    modalReset.style.display = "none";
  });

  //====================== ACTUALIZAR CPS AUTOMÁTICAMENTE ======================//
  setInterval(() => {
    manualCPS = clicsManuales;
    manualCPSOutput.value = manualCPS;
    clicsManuales = 0;
    actualizarTotalCPS();
  }, 1000);

  setInterval(() => {
    const cantidadAyudantes = mejoras[1]?.cantidad || 0;
    autoCPS = cantidadAyudantes * (1000 / velocidadAyudantes);
    autoCPSOutput.value = autoCPS.toFixed(2);
    actualizarTotalCPS();
  }, 1000);

  function actualizarTotalCPS() {
    const totalCPS = manualCPS + autoCPS;
    totalCPSOutput.value = totalCPS.toFixed(2);
  }

//====================== EVENTOS DE TECLADO ======================//
document.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") {
    document.querySelector("#reset").click();
  } else if (event.key === "m" || event.key === "M") {
    document.querySelector("#menu").click();
  } else if (event.key === "t" || event.key === "T") {
    document.querySelector("#tutorial").click();
  } else if (event.key === " ") {
    document.querySelector("#boton").click();
  } else if (event.key === "Escape") {
    const modalReset = document.querySelector("#modal-reset");
    const menuInicio = document.querySelector(".menu_inicio");
    const gridJuego = document.querySelector(".grid");

    if (modalReset.style.display === "flex") {
      modalReset.style.display = "none";
    } else {
      menuInicio.style.display = "flex";
      gridJuego.classList.add("oculto");
    }
  }
});
//====================== ESTADÍSTICAS RESPONSIVE ======================//
let statsVisible = false;

btnEstadisticas.addEventListener("click", () => {
  if (!statsVisible) {
    statsCard.classList.add("active");
    anime({
      targets: '.stats-card',
      translateY: ['100', '0%'],
      duration: 1000,
      easing: 'easeOutExpo'
    });
  } else {
    anime({
      targets: '.stats-card',
      translateY: ['0%', '100'],
      duration: 1000,
      easing: 'easeInExpo',
      complete: () => statsCard.classList.remove("active")
    });
  }
  statsVisible = !statsVisible;
});

});