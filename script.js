//=====================================================//
// Variables globales
let puntos = 0;
let nivel = 1;
let velocidadAyudantes = 1000;
let mejoras = []
const puntosTexto = document.querySelector("#puntos");
//=====================================================//
// Cargar mejoras desde el archivo JSON
fetch("mejoras.json")
  .then(response => {
    if (!response.ok) throw new Error("No se pudo cargar el archivo mejoras.json");
    return response.json();
  })

  .then(data => {
    mejoras = data.map(mejora => ({
      nombre: mejora.nombre,
      precio: mejora.precio,
      descripcion: mejora.descripcion,
      cantidad: mejora.cantidad || 0
    }));
  })
   .catch(error => {
    console.error("Error al cargar mejoras:", error);
   });
    

//=====================================================//
// Mostrar mensajes flotantes
function mostrarMensaje(id = "mensaje", texto = "No tienes suficientes puntos") {
  const mensaje = document.querySelector(`#${id}`);
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.classList.add("mensaje-activo");

  setTimeout(() => {
    mensaje.classList.remove("mensaje-activo");
  }, 3000);
}
//=====================================================//
// Click manual para sumar puntos
const boton = document.querySelector("#boton");
boton.addEventListener("click", sumarpuntos);

function sumarpuntos() {
    puntos += nivel;
    puntosTexto.innerText = "puntos totales: " + puntos;
}
//=====================================================//
// Mejora 1: Más puntos por clic
const mejora1 = document.querySelector("#card_mejora1");
mejora1.addEventListener("click", comprarmejora1);

function comprarmejora1() {
    if (puntos >= mejoras[0].precio) {
        puntos -= mejoras[0].precio;
        mejoras[0].cantidad += 1;
        nivel += 1;
       mejoras[0].precio = 25 + mejoras[0].cantidad * 20;
        puntosTexto.innerText = "puntos totales: " + puntos;

        mejora1.innerHTML = `
            <p>MAS PODER DE CLICKS</p>
            <p>agrega +1 a tus clicks</p>
            <p>precio: ${mejoras[0].precio} puntos</p>  
            <p>nivel ${mejoras[0].cantidad}</p>
            `;
            guardarProgreso();
      
    } else {
        mostrarMensaje("mensaje", "¡No tienes suficientes puntos para esta mejora!");
    }
}
//=====================================================//
// Ayudante automático
let intervaloAyudante;

function iniciarAyudante() {
    clearInterval(intervaloAyudante);
    intervaloAyudante = setInterval(() => {
        puntos += mejoras[1].cantidad;
        puntosTexto.innerText = "puntos totales: " + puntos;
    }, velocidadAyudantes);
}

// Mejora 2: Comprar ayudante
const mejora2 = document.querySelector("#card_mejora2");
mejora2.addEventListener("click", comprarmejora2);

function comprarmejora2() {
    if (puntos >= mejoras[1].precio) {
        puntos -= mejoras[1].precio;
        mejoras[1].cantidad += 5;
        mejoras[1].precio = 100 + mejoras[1].cantidad * 50;
        puntosTexto.innerText = "puntos totales: " + puntos;

        mejora2.innerHTML = `
            <p>UN AMIGITO TE AYUDARÁ</p>
            <p>agrega +1 a tu puntaje automáticamente</p>
            <p>precio: ${mejoras[1].precio} puntos</p> 
            <p>nivel ${mejoras[1].cantidad}</p>
        `;

        iniciarAyudante();
        guardarProgreso();
   
    } else {
        mostrarMensaje("mensaje", "No tienes suficientes puntos para el ayudante.");
    }
}
//=====================================================//
// Mejora 3: Aumentar velocidad de ayudante
const mejora3 = document.querySelector("#card_mejora3");
mejora3.addEventListener("click", comprarmejora3);

function comprarmejora3() {
    if (puntos >= mejoras[2].precio && mejoras[1].cantidad > 0) {
        puntos -= mejoras[2].precio;
        mejoras[2].cantidad += 1;
        velocidadAyudantes = Math.max(100, velocidadAyudantes - 100); // no menos de 100ms
        mejoras[2].precio = 500 + mejoras[2].cantidad * 150;
        puntosTexto.innerText = "puntos totales: " + puntos;

        mejora3.innerHTML = `
            <p>+ VELOCIDAD DE AYUDANTE</p>
            <p>clicks más rápidos del ayudante</p>
            <p>precio: ${mejoras[2].precio} puntos</p> 
            <p>nivel ${mejoras[2].cantidad}</p>
            <p>velocidad: ${velocidadAyudantes} ms</p>
        `;

        iniciarAyudante();
        guardarProgreso();

    } else {
        mostrarMensaje("mensaje", "Primero necesitás un ayudante activo.");
    }
}
//=====================================================//
// guardar puntos en LocalStorage
function guardarProgreso() {
  localStorage.setItem("puntos", puntos);
  localStorage.setItem("nivel", nivel);
  localStorage.setItem("mejoras", JSON.stringify(mejoras));
  localStorage.setItem("velocidadAyudantes", velocidadAyudantes);
}

//=====================================================//
// cargar puntos desde LocalStorage
if (localStorage.getItem("puntos")) {
  puntos = parseInt(localStorage.getItem("puntos"));
  nivel = parseInt(localStorage.getItem("nivel"));
  mejoras = JSON.parse(localStorage.getItem("mejoras"));
  velocidadAyudantes = parseInt(localStorage.getItem("velocidadAyudantes"));
  renderizarCards();
}

// Actualizar la interfaz con los valores cargados
function renderizarCards() {
  mejora1.innerHTML = `
    <p>MAS PODER DE CLICKS</p>
    <p>agrega +1 a tus clicks</p>
    <p>precio: ${mejoras[0].precio} puntos</p>  
    <p>nivel ${mejoras[0].cantidad}</p>
  `;
  mejora2.innerHTML = `
    <p>UN AMIGITO TE AYUDARÁ</p>
    <p>agrega +1 a tu puntaje automáticamente</p>
    <p>precio: ${mejoras[1].precio} puntos</p> 
    <p>nivel ${mejoras[1].cantidad}</p>
  `;
  mejora3.innerHTML = `
    <p>+ VELOCIDAD DE AYUDANTE</p>
    <p>clicks más rápidos del ayudante</p>
    <p>precio: ${mejoras[2].precio} puntos</p> 
    <p>nivel ${mejoras[2].cantidad}</p>
    <p>velocidad: ${velocidadAyudantes} ms</p>
  `;
}

//=====================================================//
// Botón de reinicio
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
    { nombre: "Mejora 1", precio: 25 , descripcion:"más puntos por clic", cantidad: 1 },	
    { nombre: "Mejora 2", precio: 100, descripcion:"ayudante que te da puntos", cantidad: 0 },
    { nombre: "Mejora 3", precio: 500, descripcion:"aumenta la velocidad de tu ayudante", cantidad: 1 },
  ];
  localStorage.clear();
  actualizarInterfaz();
  iniciarAyudante();
  modalReset.style.display = "none";
});

btnCancelarReset.addEventListener("click", () => {
  modalReset.style.display = "none";
});
//=====================================================//
// Actualizar la interfaz con los valores actuales
function actualizarInterfaz() {
  document.querySelector("#puntos").innerHTML = "puntos totales: " + puntos;

  document.querySelector("#card_mejora1").innerHTML = `
    <p>MAS PODER DE CLICKS</p>
    <p> agrega +1 a tus clicks</p>
    <p>precio: 25 puntos</p> 
    <p>nivel 1</p>
  `;

  document.querySelector("#card_mejora2").innerHTML = `
    <p>UN AMIGITO TE AYUDARA</p>
    <p> agrega +1 tu puntaje automaticamente</p>
    <p>precio: 100 puntos</p> 
    <p>nivel 0</p>
  `;

  document.querySelector("#card_mejora3").innerHTML = `
    <p> + VELOCIDAD DE AYUDANTE</p>
    <p> clicks mas rapidos del ayudante</p>
    <p>precio: 500 puntos</p> 
    <p>nivel 1</p>
    <p>velocidad de ayudante: 1000 ms</p>
  `;
}
//=====================================================//
// Animaciones con Anime.js y Splitting.js
Splitting();
anime({
  targets: '.char',
  translateY: [ -50, 0 ],
  opacity: [0, 1],
  easing: 'easeOutExpo',
  duration: 1000,
  delay: anime.stagger(100)
});
//=====================================================//
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

