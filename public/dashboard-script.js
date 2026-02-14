const token = localStorage.getItem("token");

// Crear curso
document.getElementById("formCrearCurso").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombreCurso = document.getElementById("nombreCurso").value.trim();

  if (!nombreCurso) {
    alert("Debes ingresar el nombre del curso");
    return;
  }

  const codigoCurso = generarCodigo();

  try {
    const res = await fetch("/api/cursos/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombreCurso,
        codigoCurso,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Curso creado correctamente");
    location.reload();
  } catch (error) {
    console.error(error);
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
