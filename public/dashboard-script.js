// Obtener token
const token = localStorage.getItem("token");

// Verificar autenticación al cargar
if (!token) {
  console.error('❌ No hay token, redirigiendo...');
  window.location.href = "/";
}

console.log('🔍 Token encontrado:', token ? 'Sí' : 'No');
console.log('🌐 Origin:', window.location.origin);

// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

console.log('🔗 API URL:', API_BASE_URL);

// ========== MODAL CREAR CURSO ==========
const modal = document.getElementById("modalCrearCurso");
const btnAbrirModal = document.getElementById("nuevoCursoBtn");
const spanCerrar = document.querySelector("#modalCrearCurso .close");

if (btnAbrirModal) {
  btnAbrirModal.addEventListener("click", () => {
    console.log('📂 Abriendo modal crear curso');
    modal.style.display = "flex";
  });
}

if (spanCerrar) {
  spanCerrar.addEventListener("click", () => {
    console.log('📁 Cerrando modal');
    modal.style.display = "none";
  });
}

// Cerrar con click fuera
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ========== CREAR CURSO ==========
const formCrearCurso = document.getElementById("formCrearCurso");
if (formCrearCurso) {
  formCrearCurso.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log('📝 Intentando crear curso...');

    const nombreCurso = document.getElementById("nombreCurso").value.trim();
    const nivelCurso = document.getElementById("nivelCurso")?.value.trim();
    const paraleloCurso = document.getElementById("paraleloCurso")?.value.trim();

    if (!nombreCurso) {
      alert("El nombre del curso es obligatorio");
      return;
    }

    // Nombre completo del curso
    let nombreCompleto = nombreCurso;
    if (nivelCurso && paraleloCurso) {
      nombreCompleto = `${nombreCurso} ${nivelCurso}° ${paraleloCurso}`;
    }

    const codigoCurso = generarCodigo();

    console.log('📦 Datos del curso:', { nombreCompleto, codigoCurso });

    try {
      const res = await fetch(`${API_BASE_URL}/cursos/crear`, {
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
      console.log('📡 Response:', res.status, data);

      if (!res.ok) {
        alert(data.mensaje || data.message || "Error al crear curso");
        return;
      }

      alert(`✅ Curso creado correctamente!\nCódigo: ${codigoCurso}`);
      modal.style.display = "none";
      formCrearCurso.reset();
      
      // Recargar cursos
      cargarCursos();
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert("Error al crear curso. Revisa la consola.");
    }
  });
}

// ========== CARGAR CURSOS ==========
async function cargarCursos() {
  try {
    console.log('📚 Cargando cursos...');
    
    const res = await fetch(`${API_BASE_URL}/cursos/docente`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📡 Response cursos:', res.status);

    if (!res.ok) {
      if (res.status === 401) {
        console.error('❌ Token inválido');
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      throw new Error(`Error ${res.status}`);
    }

    const cursos = await res.json();
    console.log('✅ Cursos cargados:', cursos.length);
    
    mostrarCursos(cursos);
    
  } catch (error) {
    console.error('❌ Error cargando cursos:', error);
    // No mostrar error si es la primera carga y no hay cursos
  }
}

// ========== MOSTRAR CURSOS ==========
function mostrarCursos(cursos) {
  const container = document.getElementById("cursosContainer") || 
                    document.getElementById("cursosGrid");
  
  if (!container) {
    console.warn('⚠️ No se encontró contenedor de cursos');
    return;
  }

  if (cursos.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: white;">
        <p>No tienes cursos creados.</p>
        <p>Crea tu primer curso usando el botón "Crear Curso".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cursos.map(curso => `
    <div class="curso-card" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 10px;">
      <h3 style="color: white; margin: 0 0 10px 0;">${curso.nombreCurso}</h3>
      <p style="color: #ccc; margin: 5px 0;">
        <strong>Código:</strong> ${curso.codigoCurso}
      </p>
      <p style="color: #ccc; margin: 5px 0;">
        <strong>Estudiantes:</strong> ${curso.estudiantes?.length || 0}
      </p>
      <button 
        onclick="copiarCodigo('${curso.codigoCurso}')" 
        style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px;"
      >
        📋 Copiar Código
      </button>
    </div>
  `).join('');
}

// ========== COPIAR CÓDIGO ==========
function copiarCodigo(codigo) {
  // Crear elemento temporal
  const textarea = document.createElement('textarea');
  textarea.value = codigo;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    alert(`✅ Código copiado: ${codigo}`);
  } catch (err) {
    console.error('Error copiando:', err);
    alert(`Código del curso: ${codigo}\n(Copia manualmente)`);
  }
  
  document.body.removeChild(textarea);
}

// ========== GENERAR CÓDIGO ==========
function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// ========== LOGOUT ==========
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    console.log('👋 Cerrando sesión...');
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  });
}

// ========== CARGAR AL INICIO ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Dashboard cargado');
  
  // Cargar cursos automáticamente
  cargarCursos();
  
  // Actualizar nombre de usuario si existe
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const nombreDocente = document.getElementById('nombreDocente');
  if (nombreDocente && userData.nombre) {
    nombreDocente.textContent = userData.nombre;
  }
});

// ========== ERROR HANDLER GLOBAL ==========
window.addEventListener('error', (e) => {
  console.error('❌ Error global:', e.error);
});

console.log('✅ Dashboard script cargado completamente');
