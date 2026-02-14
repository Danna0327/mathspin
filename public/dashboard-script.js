const token = localStorage.getItem("token");

const modal = document.getElementById("modalCrearCurso");
const btnAbrirModal = document.getElementById("nuevoCursoBtn");
const spanCerrar = document.querySelector("#modalCrearCurso .close");

// Abrir modal
btnAbrirModal.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Cerrar modal
spanCerrar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Cerrar con click fuera
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Crear curso
document
  .getElementById("formCrearCurso")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreCurso = document.getElementById("nombreCurso").value.trim();
    const nivelCurso = document.getElementById("nivelCurso").value.trim();
    const paraleloCurso = document.getElementById("paraleloCurso").value.trim();

    if (!nombreCurso || !nivelCurso || !paraleloCurso) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const nombreCompleto = `${nombreCurso} ${nivelCurso}° ${paraleloCurso}`;

    const codigoCurso = generarCodigo();

    try {
      const res = await fetch("/api/cursos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreCurso: nombreCompleto,
          codigoCurso,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Curso creado correctamente");
      modal.style.display = "none";
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear curso");
    }
  });

// Generar código aleatorio
function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}
