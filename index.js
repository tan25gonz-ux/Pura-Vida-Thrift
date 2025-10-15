import { supabase } from "./supabase.js";

const WHATSAPP_NUMERO = "50663996583";
const contenedor = document.getElementById("productosContainer");

// === CARGAR PRODUCTOS ===
async function cargarProductos() {
  contenedor.innerHTML = "<p>Cargando productos...</p>";

  const { data: productos, error } = await supabase.from("productos").select("*");
  if (error) {
    contenedor.innerHTML = "<p>Error al cargar productos 😢</p>";
    console.error(error);
    return;
  }

  const categorias = ["Camisa", "Pantalones", "Shorts", "Zapatos", "Accesorios", "Otros"];

  contenedor.innerHTML = categorias.map(cat => {
    const items = productos.filter(p => p.categoria === cat);
    if (items.length === 0) return "";

    // Mostrar flechas siempre (aunque haya pocos)
    const mostrarFlechas = items.length > 1;

    return `
      <div class="categoria-section" data-cat="${cat}">
        <h3 class="categoria-titulo">🧺 ${cat}</h3>
        <div class="carrusel-wrapper">
          ${mostrarFlechas ? `<button class="flecha izquierda" data-cat="${cat}">◀</button>` : ""}
          <div class="productos-grid carrusel" id="grid-${cat.replace(/\s+/g, '')}">
            ${items.map(p => `
              <div class="producto" data-info='${JSON.stringify(p).replace(/'/g, "&apos;")}'>
                <div class="img-container">
                  <img src="${p.imagen}" 
                       data-img2="${p.imagen2 || ''}" 
                       data-img3="${p.imagen3 || ''}" 
                       data-img4="${p.imagen4 || ''}" 
                       alt="${p.nombre}">
                  ${p.etiqueta ? `<span class="etiqueta ${p.etiqueta.toLowerCase()}">${p.etiqueta}</span>` : ""}
                </div>
                <h4>${p.nombre}</h4>
                <p>₡${p.precio}</p>
              </div>
            `).join("")}
          </div>
          ${mostrarFlechas ? `<button class="flecha derecha" data-cat="${cat}">▶</button>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // --- Flechas carrusel ---
  document.querySelectorAll(".flecha").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat.replace(/\s+/g, '');
      const grid = document.getElementById(`grid-${cat}`);
      const scroll = 260;
      grid.scrollBy({
        left: btn.classList.contains("derecha") ? scroll : -scroll,
        behavior: "smooth"
      });
    });
  });

  // --- Auto scroll carrusel (si hay más de 1 producto) ---
  document.querySelectorAll(".carrusel").forEach(grid => {
    if (grid.children.length > 1) {
      setInterval(() => {
        grid.scrollBy({ left: 260, behavior: "smooth" });
        if (grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 5)
          grid.scrollTo({ left: 0, behavior: "smooth" });
      }, 4000);
    }
  });

  // --- Rotación automática de imágenes ---
  rotarImagenes();

  // --- Modal producto ---
  document.querySelectorAll(".producto").forEach(p => {
    p.addEventListener("click", () => abrirModal(JSON.parse(p.dataset.info)));
  });
}

// === ROTACIÓN DE IMÁGENES ===
function rotarImagenes() {
  const imgs = document.querySelectorAll(".img-container img");
  imgs.forEach(img => {
    const extras = [img.dataset.img2, img.dataset.img3, img.dataset.img4].filter(Boolean);
    if (!extras.length) return;
    let i = 0;
    const todas = [img.src, ...extras];
    setInterval(() => {
      i = (i + 1) % todas.length;
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = todas[i];
        img.style.opacity = 1;
      }, 400);
    }, 3000);
  });
}

// === MODAL ===
const modal = document.getElementById("modalProducto");
const modalImg = document.getElementById("modalImg");
const modalNombre = document.getElementById("modalNombre");
const modalCategoria = document.getElementById("modalCategoria");
const modalPrecio = document.getElementById("modalPrecio");
const modalWhatsApp = document.getElementById("modalWhatsApp");
const cerrarModal = document.getElementById("cerrarModal");
const prevImg = document.getElementById("prevImg");
const nextImg = document.getElementById("nextImg");

let imagenes = [];
let imgIndex = 0;

function abrirModal(p) {
  modal.classList.add("show");
  modalNombre.textContent = p.nombre;
  modalCategoria.textContent = p.categoria;
  modalPrecio.textContent = `₡${p.precio}`;
  modalWhatsApp.href = `https://wa.me/${WHATSAPP_NUMERO}?text=¡Hola! Me interesa *${p.nombre}* (${p.categoria}) por ₡${p.precio}`;
  imagenes = [p.imagen, p.imagen2, p.imagen3, p.imagen4].filter(Boolean);
  imgIndex = 0;
  mostrarImagen();
}
function mostrarImagen() { modalImg.src = imagenes[imgIndex]; }
prevImg.addEventListener("click", () => { imgIndex = (imgIndex - 1 + imagenes.length) % imagenes.length; mostrarImagen(); });
nextImg.addEventListener("click", () => { imgIndex = (imgIndex + 1) % imagenes.length; mostrarImagen(); });
cerrarModal.addEventListener("click", () => modal.classList.remove("show"));
window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

// === FILTROS ===
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
    e.target.classList.add("activo");
    const cat = e.target.dataset.cat;
    document.querySelectorAll(".categoria-section").forEach(sec => {
      sec.style.display = cat === "Todos" || sec.dataset.cat === cat ? "block" : "none";
    });
  });
});

// === 🌙 MODO OSCURO ===
const themeBtn = document.getElementById("toggleTheme");
const body = document.body;

// Cargar tema guardado
if (localStorage.getItem("modo") === "oscuro") {
  body.classList.add("dark");
  themeBtn.textContent = "🌙";
} else {
  themeBtn.textContent = "🌞";
}

// Alternar tema
themeBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  const modoActual = body.classList.contains("dark") ? "oscuro" : "claro";
  localStorage.setItem("modo", modoActual);
  themeBtn.textContent = body.classList.contains("dark") ? "🌙" : "🌞";
});

// === INICIALIZAR ===
cargarProductos();
