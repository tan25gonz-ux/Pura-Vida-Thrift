import { supabase } from "./supabase.js";

const lista = document.getElementById("listaProductos");
const categorias = ["Camisa", "Pantalones", "Shorts", "Zapatos", "Accesorios", "Otros"];

async function cargarProductos() {
  const { data: productos } = await supabase.from("productos").select("*");
  lista.innerHTML = categorias.map(cat => {
    const items = productos.filter(p => p.categoria === cat);
    if (!items.length) return "";
    return `
      <div class="categoria-section-admin">
        <h3>🧺 ${cat}</h3>
        <div class="grid-admin">
          ${items.map(p => `
            <div class="card-admin">
              <img src="${p.imagen}" alt="${p.nombre}">
              <h4>${p.nombre}</h4>
              <p>₡${p.precio}</p>
              <div class="admin-buttons">
                <button class="btn-editar" data-id="${p.id}">✏️</button>
                <button class="btn-eliminar" data-id="${p.id}">🗑️</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>`;
  }).join("");

  document.querySelectorAll(".btn-eliminar").forEach(b => {
    b.onclick = async () => {
      if (confirm("¿Eliminar este producto?")) {
        await supabase.from("productos").delete().eq("id", b.dataset.id);
        cargarProductos();
      }
    };
  });

  document.querySelectorAll(".btn-editar").forEach(b => {
    b.onclick = () => abrirModal(b.dataset.id);
  });
}

const modal = document.getElementById("modalEditar");
const cerrar = document.getElementById("cerrarEditar");
const nombreEdit = document.getElementById("nombreEditar");
const precioEdit = document.getElementById("precioEditar");
const catEdit = document.getElementById("categoriaEditar");
const imgEdit = document.getElementById("imgEditar");
const descCheck = document.getElementById("aplicarDescuento");
let idEditando = null;

async function abrirModal(id) {
  const { data: p } = await supabase.from("productos").select("*").eq("id", id).single();
  idEditando = id;
  modal.classList.add("show");
  nombreEdit.value = p.nombre;
  precioEdit.value = p.precio;
  catEdit.value = p.categoria;
  imgEdit.src = p.imagen;
  descCheck.checked = p.etiqueta === "Descuento";
}
cerrar.onclick = () => modal.classList.remove("show");

document.getElementById("guardarEdicion").addEventListener("click", async () => {
  const updates = {
    nombre: nombreEdit.value,
    categoria: catEdit.value,
    precio: precioEdit.value,
    etiqueta: descCheck.checked ? "Descuento" : null
  };
  await supabase.from("productos").update(updates).eq("id", idEditando);
  modal.classList.remove("show");
  cargarProductos();
});

cargarProductos();
