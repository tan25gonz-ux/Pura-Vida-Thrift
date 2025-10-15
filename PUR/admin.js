import { supabase } from "./supabase.js";

const form = document.getElementById("formProducto");
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

let fileSelected = null;

// --- Zona Drag & Drop ---
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("over");
});
dropArea.addEventListener("dragleave", () => dropArea.classList.remove("over"));
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  fileSelected = e.dataTransfer.files[0];
  mostrarPreview(fileSelected);
  dropArea.classList.remove("over");
});
fileInput.addEventListener("change", e => {
  fileSelected = e.target.files[0];
  mostrarPreview(fileSelected);
});

function mostrarPreview(file) {
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// --- Subir imagen a Supabase Storage ---
async function subirImagen(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("Imagenes").upload(fileName, file);
  if (error) {
    alert("Error al subir imagen: " + error.message);
    return null;
  }
  const { data: urlData } = supabase.storage.from("Imagenes").getPublicUrl(fileName);
  return urlData.publicUrl;
}

// --- Guardar producto ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);

  if (!fileSelected) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  status.textContent = "Subiendo imagen...";
  const imagenUrl = await subirImagen(fileSelected);
  if (!imagenUrl) return;

  const { error } = await supabase.from("productos").insert([
    { nombre, categoria, precio, imagen: imagenUrl }
  ]);

  if (error) {
    alert("Error al guardar producto: " + error.message);
  } else {
    status.textContent = "✅ Producto agregado correctamente.";
    form.reset();
    preview.style.display = "none";
    fileSelected = null;
  }
});
