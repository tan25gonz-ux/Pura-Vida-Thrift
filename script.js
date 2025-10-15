import { supabase } from "./supabase.js";

async function cargarProductos() {
  const contenedor = document.getElementById("productosContainer");
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

    const mostrarFlechas = items.length > 4;

    return `
      <div class="categoria-section">
        <h3>📂 ${cat}</h3>
        <div class="carrusel-wrapper">
          ${mostrarFlechas ? `<button class="flecha izquierda" data-cat="${cat}">◀</button>` : ""}
          <div class="productos-grid" id="grid-${cat.replace(/\s+/g, '')}">
            ${items.map(p => `
              <div class="card">
                <img src="${p.imagen}" alt="${p.nombre}">
                <div class="card-content">
                  <h3>${p.nombre}</h3>
                  <p class="price">₡${p.precio}</p>
                </div>
              </div>
            `).join("")}
          </div>
          ${mostrarFlechas ? `<button class="flecha derecha" data-cat="${cat}">▶</button>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // Control de flechas
  document.querySelectorAll(".flecha").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat.replace(/\s+/g, '');
      const grid = document.getElementById(`grid-${cat}`);
      const scrollAmount = 320;

      if (btn.classList.contains("derecha")) {
        grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
      } else {
        grid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    });
  });
}

// Filtro de categorías
document.addEventListener("click", e => {
  if (e.target.classList.contains("filtro-btn")) {
    document.querySelectorAll(".filtro-btn").forEach(btn => btn.classList.remove("activo"));
    e.target.classList.add("activo");

    const categoria = e.target.getAttribute("data-cat");
    const secciones = document.querySelectorAll(".categoria-section");

    secciones.forEach(sec => {
      if (categoria === "Todos" || sec.querySelector("h3").textContent.includes(categoria)) {
        sec.style.display = "block";
      } else {
        sec.style.display = "none";
      }
    });
  }
});

cargarProductos();
