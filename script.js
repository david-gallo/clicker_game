document.addEventListener("DOMContentLoaded", () => {
  //====================== VARIABLES ======================//
  let puntos = 0;
  let nivel = 1;
  let velocidadAyudantes = 1000;
  let mejoras = [];
  let clicsManuales = 0;
  let clicsSinMejora = 0;
  let manualCPS = 0;
  let autoCPS = 0;
  let logrosDesbloqueados = new Set();

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



 //====================== SONIDOS ======================//
  const clickSound = new Howl({
    src: ['sonidos/click.ogg'],
  });
  const hoverSound = new Howl({
    src: ['sonidos/hover_mejoras.ogg'],
  });
  const EstadisticasSound = new Howl({
    src: ['sonidos/estadisticas.ogg'],
  });
  const logrosSound = new Howl({
    src: ['sonidos/logros.ogg'],
  });
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
      logrosDesbloqueados = new Set(JSON.parse(localStorage.getItem("logros")) || []);

      renderizarCards();
      actualizarPuntosEnPantalla();
      if (mejoras[1].cantidad > 0) iniciarAyudante();
      agregarListenersCards();  
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
    localStorage.setItem("logros", JSON.stringify(Array.from(logrosDesbloqueados)));
  }

  //====================== ACTUALIZAR PUNTOS EN PANTALLA ======================//
  function actualizarPuntosEnPantalla() {
    puntosTexto.value = puntos;
  }

  //====================== BOTÓN PRINCIPAL  ======================//
  let comboClicks = 0;
  let comboTimer;

  boton.addEventListener("click", () => {
    clickSound.play();
    clicsManuales++;
    clicsSinMejora++;

    Need_More_Clicks();
    punch_the_tree();
    hollow_hands();
    metroidvania_Millionaire();

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

  //====================== ANIMACION DE PUNTOS ======================//
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
          <p>UN AMIGUITO TE AYUDARÁ</p>
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
        clicsSinMejora = 0;
        anime({
          targets: card,
          scale: [1, 1.05],
          duration: 150,
          direction: 'alternate',
          easing: 'easeInOutQuad'
        });
      });

      card.addEventListener('mouseenter', () => {
        hoverSound.play();
        anime({
          targets: card,
          scale: 1.05,
          duration: 150,
          easing: 'easeOutQuad'
        });
      });

    
      card.addEventListener('mouseleave', () => {
        anime({
          targets: card,
          scale: 1,
          duration: 150,
          easing: 'easeOutQuad'
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
        Master_Unlocking();
        dangerous_to_go_alone();
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
          Master_Unlocking();
          guardarProgreso();
          renderizarCardIndividual(1);
          actualizarPuntosEnPantalla();
        } else {
          mostrarMensaje("mensaje", "No tienes suficientes puntos para el ayudante.");
        }
        break;
      case 2:
        if (mejoras[1].cantidad === 0) {
          mostrarMensaje("mensaje", "Primero necesitás un ayudante activo.");
          youDied();
        } else if (puntos < mejoras[2].precio) {
          mostrarMensaje("mensaje", "No tenés suficientes puntos.");
        } else {
          puntos -= mejoras[2].precio;
          mejoras[2].cantidad++;
          velocidadAyudantes = Math.max(100, velocidadAyudantes - 100);
          starsUnlocked(); // Logro si llegás al mínimo
        
          mejoras[2].precio = 500 + mejoras[2].cantidad * 150;
          iniciarAyudante();
          guardarProgreso();
          Master_Unlocking();
        
          renderizarCardIndividual(2);
          actualizarPuntosEnPantalla();
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
    logrosDesbloqueados.clear();
    localStorage.removeItem("logros");
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
      EstadisticasSound.play();
      statsCard.classList.add("active");
      anime({
        targets: '.stats-card',
        translateX: ['100%', '0%'],
        duration: 900,
        easing: 'easeOutBack',
        opacity: [0, 1]
      });
      btnEstadisticas.textContent = "Ocultar estadísticas";
    } else {
      EstadisticasSound.play();
      anime({
        targets: '.stats-card',
        translateX: ['0%', '100%'],
        duration: 700,
        easing: 'easeInBack',
        opacity: [1, 0],
        complete: () => statsCard.classList.remove("active")
      });
      btnEstadisticas.textContent = "Mostrar estadísticas";
    }

    statsVisible = !statsVisible;
  });

  //====================== ESTADÍSTICAS INICIALES ======================//
  manualCPSOutput.value = "0";
  autoCPSOutput.value = "0";
  totalCPSOutput.value = "0";

  actualizarTotalCPS();

  //====================== LOGROS TOSTIFY ======================//

function desbloquearLogro(id, mensaje) {
  if (logrosDesbloqueados.has(id)) return;
  logrosSound.play();
  logrosDesbloqueados.add(id);
  localStorage.setItem("logros", JSON.stringify([...logrosDesbloqueados]));

  Toastify({
    text: `🏆 ${mensaje}`,
    duration: 5000,
    gravity: "bottom",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: {
      background: 'linear-gradient(135deg, #4caf50, #388e3c)'
    },
    className: "mi-toast-logro"
  }).showToast();

  setTimeout(() => {
    const toastElement = document.querySelector(".mi-toast-logro:last-child");
    if (toastElement) {
      anime({
        targets: toastElement,
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .6)',
        duration: 800,
      });
    }
  }, 1000);
}

//====================== LOGROS ======================//
function punch_the_tree() {
  if (!logrosDesbloqueados.has("punch_the_tree")) {
    desbloquearLogro("punch_the_tree", "¡Punch the Tree! Logras tu primer clic. Todos empezamos desde cero... ¿o desde madera?");
  }
}

function hollow_hands() {
  if (clicsSinMejora >= 500 && !logrosDesbloqueados.has("hollow_hands")) {
    desbloquearLogro("hollow_hands", "¡Hollow Hands! Hacé 500 clics sin comprar ninguna mejora. Seguís golpeando... pero no hay alma que recolectar.");
  }
}

function Master_Unlocking() {
  const mejorasDistintas = mejoras.filter(m => m.cantidad > 0).length;

  if (mejorasDistintas >= 3 && !logrosDesbloqueados.has("master_of_unlocking")) {
    desbloquearLogro(
      "master_of_unlocking",
      "Master of Unlocking: Desbloqueás 3 mejoras distintas. Jill estaría orgullosa."
    );
  }
}

function dangerous_to_go_alone() {
  const tieneAlgunaMejora = mejoras.some(m => m.cantidad > 0);

  if (tieneAlgunaMejora && !logrosDesbloqueados.has("dangerous_to_go_alone")) {
    desbloquearLogro(
      "dangerous_to_go_alone",
      "It's Dangerous to Go Alone: Comprás tu primera mejora. Por suerte, no vas solo."
    );
  }
}

let comboClicks5s = 0;
let comboTimer5s = null;

function Need_More_Clicks() {
  comboClicks5s++;
  
  if (!comboTimer5s) {
    comboTimer5s = setTimeout(() => {
      comboClicks5s = 0;
      comboTimer5s = null;
    }, 5000);
  }

  if (comboClicks5s >= 30 && !logrosDesbloqueados.has("need_more_clicks")) {
    desbloquearLogro(
      "need_more_clicks",
      "I Need More Clicks!: Hacés un combo de 30 clics en 5 segundos. Frenesí nivel demonio."
    );
    comboClicks5s = 0;
    clearTimeout(comboTimer5s);
    comboTimer5s = null;
  }
}


function you_died() {
  if (!logrosDesbloqueados.has("you_died")) {
    desbloquearLogro(
      "you_died",
      "You Died: Fallás una acción por falta de recursos. Y sí, era obvio."
    );
  }
}
 function metroidvania_Millionaire() {
  if (puntos >= 1000000 && !logrosDesbloqueados.has("metroidvania_millionaire")) {
    desbloquearLogro(
      "metroidvania_millionaire",
      "Metroidvania Millionaire: Alcanzás 1 millón de puntos. Exploración, farmeo y clics por doquier."
    );
  }
}
function stars_Unlocked() {
  if (velocidadAyudantes === 100 && !logrosDesbloqueados.has("stars_unlocked")) {
    desbloquearLogro("stars_unlocked", `"STARS...!": Desbloqueás todos los ayudantes disponibles. El escuadrón está completo.`);
  }
}
//====================== FIN DEL CÓDIGO ======================//
  });