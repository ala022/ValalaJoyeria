let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let reseñas = JSON.parse(localStorage.getItem("reseñas")) || [];

const productosContainer = document.getElementById("productos");
const contadorCarrito = document.getElementById("contador-carrito");
const carritoItems = document.getElementById("carrito-items");
const totalCarrito = document.getElementById("total");
const emptyCartButton = document.getElementById("empty-cart");
const reseñasContainer = document.getElementById("reseñas-container");

// Escuchar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    inicializarAplicacion();
    cargarReseñas();
    gestionarFormularioReseñas();
    gestionarFormularioContacto();
    inicializarCarrusel();
});

// Inicializar la aplicación
function inicializarAplicacion() {
    cargarProductos();
    actualizarContadorCarrito();
    renderizarCarrito();

    // Asignar eventos al botón de vaciar carrito
    if (emptyCartButton) {
        emptyCartButton.addEventListener("click", vaciarCarrito);
    }
}

// Cargar productos desde un JSON
async function cargarProductos() {
    try {
        const respuesta = await fetch("JSON/productos.json");
        productos = await respuesta.json();

        if (productosContainer) {
            productos.forEach(producto => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p>Precio: $${producto.precio}</p>
                    <button class="agregar-carrito" data-id="${producto.id}">Añadir al Carrito</button>
                    <button class="detalles-producto" data-id="${producto.id}">Más detalles</button>
                `;
                productosContainer.appendChild(card);
            });

            productosContainer.addEventListener("click", (event) => {
                const productoId = event.target.getAttribute("data-id");
                if (event.target.classList.contains("agregar-carrito")) {
                    agregarAlCarrito(productoId);
                } else if (event.target.classList.contains("detalles-producto")) {
                    mostrarDetalles(productoId);
                }
            });
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Agregar productos al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id == id);

    if (producto) {
        const productoEnCarrito = carrito.find(p => p.id == id);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarContadorCarrito();
        renderizarCarrito();
        alert("Producto añadido al carrito.");
    }
}

// Mostrar detalles de un producto
function mostrarDetalles(id) {
    const producto = productos.find(p => p.id == id);
    if (producto) {
        alert(`Nombre: ${producto.nombre}\nDescripción: ${producto.descripcion}\nPrecio: $${producto.precio}`);
    } else {
        alert("Producto no encontrado.");
    }
}

// Actualizar el contador del carrito
function actualizarContadorCarrito() {
    if (contadorCarrito) {
        const totalCantidad = carrito.reduce((total, p) => total + p.cantidad, 0);
        contadorCarrito.textContent = totalCantidad;
    }
}

// Renderizar el carrito
function renderizarCarrito() {
    if (carritoItems) {
        carritoItems.innerHTML = "";
        if (carrito.length === 0) {
            carritoItems.innerHTML = "<p>El carrito está vacío.</p>";
            totalCarrito.textContent = "$0";
            return;
        }

        carrito.forEach(producto => {
            const item = document.createElement("div");
            item.classList.add("carrito-item");
            item.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" width="50">
                <div>
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${producto.precio}</p>
                    <p>
                        Cantidad: 
                        <button class="btn-cantidad" data-id="${producto.id}" data-accion="restar">-</button>
                        ${producto.cantidad}
                        <button class="btn-cantidad" data-id="${producto.id}" data-accion="sumar">+</button>
                    </p>
                    <p>Subtotal: $${producto.precio * producto.cantidad}</p>
                </div>
                <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
            `;
            carritoItems.appendChild(item);
        });

        const confirmarCompraBtn = document.createElement("button");
        confirmarCompraBtn.textContent = "Confirmar compra";
        confirmarCompraBtn.classList.add("btn-confirmar");
        carritoItems.appendChild(confirmarCompraBtn);

        confirmarCompraBtn.addEventListener("click", confirmarCompra);

        carritoItems.addEventListener("click", manejarBotonesCarrito);
        actualizarTotal();
    }
}

// Manejar botones del carrito
function manejarBotonesCarrito(event) {
    const id = event.target.getAttribute("data-id");
    const accion = event.target.getAttribute("data-accion");

    if (event.target.classList.contains("btn-cantidad")) {
        cambiarCantidad(id, accion);
    } else if (event.target.classList.contains("btn-eliminar")) {
        eliminarDelCarrito(id);
    }
}

// Cambiar cantidad
function cambiarCantidad(id, accion) {
    const producto = carrito.find(p => p.id == id);
    if (producto) {
        if (accion === "sumar") producto.cantidad++;
        if (accion === "restar" && producto.cantidad > 1) producto.cantidad--;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
    }
}

// Eliminar del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => p.id != id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}

// Actualizar total
function actualizarTotal() {
    const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    if (totalCarrito) totalCarrito.textContent = `$${total}`;
}

// Vaciar carrito
function vaciarCarrito() {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
    alert("El carrito ha sido vaciado.");
}

// Confirmar compra
function confirmarCompra() {
    if (carrito.length > 0) {
        alert(`Compra confirmada. Total: $${carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0)}. ¡Muchas gracias por su compra!`);
        vaciarCarrito();
    } else {
        alert("El carrito está vacío.");
    }
}

// Función para cargar reseñas desde localStorage
function cargarReseñas() {
    const reseñas = JSON.parse(localStorage.getItem("reseñas")) || [];
    reseñas.forEach(({ nombre, reseña }) => {
        const reseñaHTML = document.createElement("div");
        reseñaHTML.classList.add("reseña");
        reseñaHTML.innerHTML = `<p>"${reseña}" - ${nombre}</p>`;
        reseñasContainer.appendChild(reseñaHTML);
    });
}

// Función de validación de reseñas
function validarReseña(nombre, mensaje, mensajeError) {
    if (nombre.length < 2) {
        mensajeError.textContent = "El nombre es obligatorio y debe tener al menos 2 caracteres.";
        mensajeError.style.color = "red";
        return false;
    }

    if (mensaje.length < 10 || mensaje.length > 500) {
        mensajeError.textContent = "La reseña debe tener entre 10 y 500 caracteres.";
        mensajeError.style.color = "red";
        return false;
    }

    mensajeError.textContent = "";
    return true;
}

// Función para gestionar el formulario de reseñas
function gestionarFormularioReseñas() {
    const formularioReseñas = document.getElementById("reseñasForm");
    const mensajeError = document.getElementById("mensaje-error");
    const reseñasContainer = document.getElementById("reseñas-container");

    if (!formularioReseñas || !mensajeError || !reseñasContainer) {
        console.error("Formulario o contenedor de reseñas no encontrado");
        return;
    }

    formularioReseñas.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evitar la acción por defecto (enviar el formulario)

        const nombre = document.getElementById("nombre-reseña").value.trim();
        const mensaje = document.getElementById("reseña").value.trim();

        // Validación del nombre
        if (nombre === "") {
            mensajeError.textContent = "El nombre es obligatorio.";
            mensajeError.style.color = "red";
            mensajeError.style.display = "block";  // Mostrar el mensaje de error
            return;
        }

        // Validación de la reseña (longitud)
        if (mensaje.length < 10 || mensaje.length > 500) {
            mensajeError.textContent = "La reseña debe tener entre 10 y 500 caracteres.";
            mensajeError.style.color = "red";
            mensajeError.style.display = "block";  // Mostrar el mensaje de error
            return;
        }

        // Limpiar mensaje de error si todo es correcto
        mensajeError.textContent = "";
        mensajeError.style.display = "none";  // Ocultar el mensaje de error

        const datos = {
            nombre: nombre,
            reseña: mensaje
        };

        try {
            // Enviar los datos al servidor utilizando fetch
            const respuesta = await fetch("https://formspree.io/f/meookoyd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            if (respuesta.ok) {
                // Mostrar mensaje de éxito
                mensajeError.textContent = "Reseña enviada con éxito. ¡Gracias por tu opinión!";
                mensajeError.style.color = "green";
                mensajeError.style.display = "block";  // Mostrar el mensaje de éxito

                // Limpiar el formulario
                formularioReseñas.reset();

                // Crear y agregar la nueva reseña al contenedor de reseñas
                const nuevaReseña = document.createElement("div");
                nuevaReseña.classList.add("reseña");

                // Crear el párrafo con la reseña
                const textoReseña = document.createElement("p");
                textoReseña.textContent = `"${mensaje}" - ${nombre}`;

                // Añadir el párrafo al div
                nuevaReseña.appendChild(textoReseña);

                // Añadir la nueva reseña al contenedor
                reseñasContainer.appendChild(nuevaReseña);
            } else {
                mensajeError.textContent = "Hubo un problema al enviar la reseña. Intenta nuevamente.";
                mensajeError.style.color = "red";
                mensajeError.style.display = "block";  // Mostrar el mensaje de error
            }
        } catch (error) {
            console.error("Error al enviar la reseña:", error);
            mensajeError.textContent = "Hubo un error inesperado. Por favor, intenta más tarde.";
            mensajeError.style.color = "red";
            mensajeError.style.display = "block";  // Mostrar el mensaje de error
        }
    });
}
// Función para gestionar el formulario de contacto
function gestionarFormularioContacto () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function(event) {
        event.preventDefault();  // Evita el comportamiento por defecto de envío

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();
        const honeypot = document.querySelector('input[name="_honeypot"]').value;

        // Verificar el campo honeypot (anti-bots)
        if (honeypot) {
            console.log("Formulario detectado como spam (honeypot llenado).");
            alert("Formulario detectado como spam.");
            return;
        }

        // Validar el nombre
        if (nombre.length < 2 || !/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombre)) {
            alert("Por favor, ingrese un nombre válido (mínimo 2 caracteres y solo letras).");
            return;
        }

        // Validar el correo electrónico
        if (!email.includes("@") || email.length < 5) {
            alert("Por favor, ingrese un correo válido.");
            return;
        }

        // Validar el mensaje
        if (mensaje.length < 10 || mensaje.length > 500) {
            alert("El mensaje debe contener entre 10 y 500 caracteres.");
            return;
        }

        const formData = new FormData(form);
        const datos = Object.fromEntries(formData.entries());

        try {
            const respuesta = await fetch("https://formspree.io/f/xpwwrzqy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            if (respuesta.ok) {
                alert("Formulario enviado con éxito. Gracias por contactarnos.");
                form.reset();  // Limpiar el formulario
            } else {
                alert("Error al enviar el mensaje. Inténtalo nuevamente más tarde.");
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            mensajeError.textContent =
            "Hubo un problema al enviar el mensaje. Por favor, inténtalo más tarde.";
        mensajeError.style.color = "red";
        }
    });
};


// Funciones del carrusel
const slides = document.querySelector('.slides');
const slide = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let index = 0; 
let autoSlideInterval; // Variable para almacenar el intervalo automático

// Función para actualizar la posición del carrusel
function updateSlide() {
    slides.style.transform = `translateX(-${index * 100}%)`;
}

// Función para avanzar a la siguiente diapositiva
function nextSlide() {
    index = (index === slide.length - 1) ? 0 : index + 1;
    updateSlide();
}

// Función para retroceder a la diapositiva anterior
function prevSlide() {
    index = (index === 0) ? slide.length - 1 : index - 1;
    updateSlide();
}

// Eventos para botones de navegación
prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide(); // Reinicia el temporizador de transición automática
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide(); // Reinicia el temporizador de transición automática
});

// Función para iniciar la transición automática
function autoSlide() {
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 6000); // Cambia de diapositiva cada 6 segundos
}

// Función para reiniciar el temporizador de transición automática
function resetAutoSlide() {
    clearInterval(autoSlideInterval); // Detiene el intervalo actual
    autoSlide(); // Inicia un nuevo intervalo
}

// Iniciar la transición automática
autoSlide();

// Inicializar el carrusel en el primer slide
showSlide(currentSlide);

