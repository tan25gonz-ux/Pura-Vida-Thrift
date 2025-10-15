import { supabase } from "./supabase.js";

const form = document.getElementById("formProducto");
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const status = document.getElementById("status");
const contenedor = document.getElementById("productosContainer");

let files = [];
let productoIdActual = null;

// ========== DRAG & DROP ==========
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", e => handleFiles(e.target.files));
dropArea.addEventListener("dragover", e => { e.preventDefault(); dropArea.classList.add("over"); });
dropArea.addEventListener("dragleave", () => dropArea.classList.remove("over"));
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files);
  dropArea.classList.remove("over");
});

function handleFiles(selected) {
  files = Array.from(selected).slice(0, 4);
  previewContainer.innerHTML = "";
  for (const f of files) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(f);
    img.className = "mini-preview";
    previewContainer.appendChild(img);
  }
}

// ========== STORAGE ==========
async function subirImagen(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from("Imagenes").upload(fileName, file);
  if (upErr) { alert("Error subiendo imagen: " + upErr.message); return null; }
  const { data } = supabase.storage.from("Imagenes").getPublicUrl(fileName);
  return data.publicUrl;
}

// ========== INSERT ==========
form.addEventListener("submit", async e => {
  e.preventDefault();
  status.textContent = "Subiendo imágenes…";

  const urls = [];
  for (const f of files) {
    const url = await subirImagen(f);
    if (url) urls.push(url);
  }

  const nuevo = {
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value,
    precio: Number(document.getElementById("precio").value),
    imagen: urls[0] || "",
    imagen2: urls[1] || "",
    imagen3: urls[2] || "",
    imagen4: urls[3] || ""
  };

  const { error } = await supabase.from("productos").insert([nuevo]).select();
  if (error) {
    alert("Error guardando producto: " + error.message);
  } else {
    status.textContent = "✅ Producto agregado";
    form.reset(); files = [];
    previewContainer.innerHTML = "";
    cargarProductos();
  }
});

// ========== RENDER ==========
async function cargarProductos() {
  contenedor.innerHTML = "<p>Cargando productos…</p>";

  const { data: productos, error } = await supabase.from("productos").select("*").order("id", { ascending: false });
  if (error) { contenedor.innerHTML = "<p>Error al cargar productos</p>"; console.error(error); return; }

  const categorias = ["Camisa","Pantalones","Shorts","Zapatos","Accesorios","Otros"];

  contenedor.innerHTML = categorias.map(cat => {
    const items = productos.filter(p => p.categoria === cat);
    if (!items.length) return "";
    return `
      <section class="admin-categoria">
        <h2>🧺 ${cat}</h2>
        <div class="admin-grid">
          ${items.map(p => `
            <div class="admin-card" data-id="${p.id}">
              <div class="img-wrap"><img src="${p.imagen}" alt="${p.nombre}"></div>
              <div class="info">
                <h3>${p.nombre}</h3>
                <p>₡${p.precio}</p>
              </div>
              <div class="admin-btns">
                <button class="btn-editar">✏️ Editar</button>
                <button class="btn-eliminar">🗑️ Eliminar</button>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("") || "<p>No hay productos</p>";
}

// ========== MODAL ==========
const modal = document.getElementById("modalEditar");
const cerrarModal = document.getElementById("cerrarModal");

function abrirModal({ id, nombre, precio, categoria }) {
  productoIdActual = Number(id);
  modal.classList.add("show");
  document.getElementById("editNombre").value = nombre;
  document.getElementById("editPrecio").value = precio;
  document.getElementById("editCategoria").value = categoria;
}
cerrarModal.addEventListener("click", () => modal.classList.remove("show"));

document.getElementById("formEditar").addEventListener("submit", async e => {
  e.preventDefault();
  if (!productoIdActual) return alert("ID de producto inválido");

  const actualizado = {
    nombre: document.getElementById("editNombre").value.trim(),
    precio: Number(document.getElementById("editPrecio").value),
    categoria: document.getElementById("editCategoria").value
  };

  // .select() devuelve filas afectadas; si viene vacío, algo (RLS) bloqueó la operación
  const { data, error } = await supabase
    .from("productos")
    .update(actualizado)
    .eq("id", productoIdActual)
    .select();

  if (error) { alert("Error al guardar: " + error.message); console.error(error); }
  else if (!data || !data.length) {
    alert("No se pudo actualizar. Si usas RLS, falta una política de UPDATE.");
  } else {
    modal.classList.remove("show");
    cargarProductos();
  }
});

// ========== DELEGACIÓN DE EVENTOS ==========
contenedor.addEventListener("click", async e => {
  // Eliminar
  if (e.target.closest(".btn-eliminar")) {
    const card = e.target.closest(".admin-card");
    const id = Number(card?.dataset?.id);
    if (!id) return alert("ID no encontrado");
    if (!confirm("¿Eliminar este producto?")) return;

    const { data, error } = await supabase.from("productos").delete().eq("id", id).select();
    if (error) { alert("Error eliminando: " + error.message); console.error(error); }
    else if (!data || !data.length) {
      alert("No se pudo eliminar. Si usas RLS, falta una política de DELETE.");
    } else {
      card.remove();
    }
  }

  // Editar → abrir modal
  if (e.target.closest(".btn-editar")) {
    const card = e.target.closest(".admin-card");
    const id = card?.dataset?.id;
    const nombre = card.querySelector("h3").textContent;
    const precio = card.querySelector("p").textContent.replace("₡", "");
    const categoria = card.closest(".admin-categoria").querySelector("h2").textContent.replace("🧺 ","");
    abrirModal({ id, nombre, precio, categoria });
  }
});

cargarProductos();
