// ========== CONFIGURACIÓN ==========
const token = localStorage.getItem("token");

// Verificar autenticación
if (!token) {
  console.error('❌ No hay token, redirigiendo...');
  window.location.href = "/";
}

// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

console.log('✅ Dashboard cargado');
console.log('🔗 API URL:', API_BASE_URL);

// ========== VARIABLES GLOBALES ==========
let cursosActuales = [];
let preguntasActuales = [];

// ========== FUNCIONES DE MODAL ==========
function abrirModal(modalId) {
  console.log('📂 Abriendo modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error('❌ Modal no encontrado:', modalId);
  }
}

function cerrarModal(modalId) {
  console.log('📁 Cerrando modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    
    // Limpiar formulario si existe
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (e) => {
  if (e.target.classList.contains('modal')) {
    cerrarModal(e.target.id);
  }
});

// ========== EVENT LISTENERS DE BOTONES ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎛️ Configurando botones...');
  
  // Botón Crear Curso (header)
  const crearCursoBtn = document.getElementById("crearCursoBtn");
  if (crearCursoBtn) {
    crearCursoBtn.addEventListener("click", () => abrirModal("modalCrearCurso"));
    console.log('✅ Botón crearCursoBtn configurado');
  }
  
  // Botón Nuevo Curso (en tab cursos)
  const nuevoCursoBtn = document.getElementById("nuevoCursoBtn");
  if (nuevoCursoBtn) {
    nuevoCursoBtn.addEventListener("click", () => abrirModal("modalCrearCurso"));
    console.log('✅ Botón nuevoCursoBtn configurado');
  }
  
  // Botón Nueva Pregunta
  const nuevaPreguntaBtn = document.getElementById("nuevaPreguntaBtn");
  if (nuevaPreguntaBtn) {
    nuevaPreguntaBtn.addEventListener("click", () => abrirModal("modalPregunta"));
    console.log('✅ Botón nuevaPreguntaBtn configurado');
  }
  
  // Botón Invitar Estudiante
  const invitarEstudianteBtn = document.getElementById("invitarEstudianteBtn");
  if (invitarEstudianteBtn) {
    invitarEstudianteBtn.addEventListener("click", () => abrirModal("modalInvitar"));
    console.log('✅ Botón invitarEstudianteBtn configurado');
  }
  
  // Botón Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", cerrarSesion);
    console.log('✅ Botón logoutBtn configurado');
  }
  
  // Botón Copiar Código
  const copiarCodigoBtn = document.getElementById("copiarCodigoBtn");
  if (copiarCodigoBtn) {
    copiarCodigoBtn.addEventListener("click", copiarCodigoCurso);
    console.log('✅ Botón copiarCodigoBtn configurado');
  }
  
  // Botones cerrar modales
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        cerrarModal(modal.id);
      }
    });
  });
  
  // Formularios
  setupFormularios();
  
  // Cargar datos iniciales
  cargarCursos();
  cargarPreguntas();
  actualizarNombreUsuario();
  
  console.log('✅ Dashboard inicializado completamente');
});

// ========== FORMULARIOS ==========
function setupFormularios() {
  // Formulario Crear Curso
  const formCrearCurso = document.getElementById("formCrearCurso");
  if (formCrearCurso) {
    formCrearCurso.addEventListener("submit", crearCurso);
    console.log('✅ Form crearCurso configurado');
  }
  
  // Formulario Crear Pregunta
  const formPregunta = document.getElementById("formPregunta");
  if (formPregunta) {
    formPregunta.addEventListener("submit", crearPregunta);
    console.log('✅ Form pregunta configurado');
  }
}

// ========== CREAR CURSO ==========
async function crearCurso(e) {
  e.preventDefault();
  console.log('📝 Creando curso...');
  
  const nombreCurso = document.getElementById("nombreCurso").value.trim();
  
  if (!nombreCurso) {
    alert("El nombre del curso es obligatorio");
    return;
  }
  
  const codigoCurso = generarCodigo();
  
  try {
    const res = await fetch(`${API_BASE_URL}/cursos/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombreCurso, codigoCurso }),
    });
    
    const data = await res.json();
    console.log('📡 Response crear curso:', res.status, data);
    
    if (!res.ok) {
      alert(data.mensaje || "Error al crear curso");
      return;
    }
    
    alert(`✅ Curso creado!\nNombre: ${nombreCurso}\nCódigo: ${codigoCurso}`);
    cerrarModal("modalCrearCurso");
    cargarCursos();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert("Error al crear curso");
  }
}

// ========== CREAR PREGUNTA ==========
async function crearPregunta(e) {
  e.preventDefault();
  console.log('📝 Creando pregunta...');
  
  const titulo = document.getElementById("tituloPregunta")?.value.trim();
  const categoria = document.getElementById("categoriaPregunta")?.value;
  const dificultad = document.getElementById("dificultadPregunta")?.value;
  
  const opciones = [
    document.getElementById("opcionA")?.value.trim(),
    document.getElementById("opcionB")?.value.trim(),
    document.getElementById("opcionC")?.value.trim(),
    document.getElementById("opcionD")?.value.trim(),
  ];
  
  const respuestaCorrecta = document.querySelector('input[name="respuestaCorrecta"]:checked')?.value;
  
  if (!titulo || !categoria || !dificultad || opciones.some(o => !o) || !respuestaCorrecta) {
    alert("Todos los campos son obligatorios");
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        titulo,
        pregunta: titulo,
        categoria,
        dificultad,
        opciones,
        respuestaCorrecta,
      }),
    });
    
    const data = await res.json();
    console.log('📡 Response crear pregunta:', res.status, data);
    
    if (!res.ok) {
      alert(data.mensaje || "Error al crear pregunta");
      return;
    }
    
    alert("✅ Pregunta creada exitosamente!");
    cerrarModal("modalPregunta");
    cargarPreguntas();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert("Error al crear pregunta");
  }
}

// ========== CARGAR CURSOS ==========
async function cargarCursos() {
  try {
    console.log('📚 Cargando cursos...');
    
    const res = await fetch(`${API_BASE_URL}/cursos/docente`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        alert('Sesión expirada');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      throw new Error(`Error ${res.status}`);
    }
    
    cursosActuales = await res.json();
    console.log('✅ Cursos cargados:', cursosActuales.length);
    
    mostrarCursos(cursosActuales);
    
  } catch (error) {
    console.error('❌ Error cargando cursos:', error);
  }
}

// ========== MOSTRAR CURSOS ==========
function mostrarCursos(cursos) {
  const container = document.getElementById("cursosGrid");
  
  if (!container) {
    console.warn('⚠️ Container cursosGrid no encontrado');
    return;
  }
  
  if (cursos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <p style="font-size: 18px; margin-bottom: 10px;">📚 No tienes cursos creados</p>
        <p style="opacity: 0.7;">Crea tu primer curso usando el botón "Crear Curso"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = cursos.map(curso => `
    <div class="curso-card" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
      <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">${curso.nombreCurso}</h3>
      <div style="margin: 10px 0;">
        <span style="background: rgba(102,126,234,0.3); color: #fff; padding: 5px 10px; border-radius: 5px; font-size: 14px; font-weight: bold;">
          ${curso.codigoCurso}
        </span>
      </div>
      <p style="color: rgba(255,255,255,0.7); margin: 10px 0; font-size: 14px;">
        👥 ${curso.estudiantes?.length || 0} estudiantes
      </p>
      <button 
        onclick="copiarCodigo('${curso.codigoCurso}')" 
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; margin-top: 10px; font-weight: 600; width: 100%;"
      >
        📋 Copiar Código
      </button>
    </div>
  `).join('');
}

// ========== CARGAR PREGUNTAS ==========
async function cargarPreguntas() {
  try {
    console.log('📝 Cargando preguntas...');
    
    const res = await fetch(`${API_BASE_URL}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    preguntasActuales = await res.json();
    console.log('✅ Preguntas cargadas:', preguntasActuales.length);
    
    mostrarPreguntas(preguntasActuales);
    
  } catch (error) {
    console.error('❌ Error cargando preguntas:', error);
  }
}

// ========== MOSTRAR PREGUNTAS ==========
function mostrarPreguntas(preguntas) {
  const container = document.getElementById("preguntasGrid");
  
  if (!container) return;
  
  if (preguntas.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <p style="font-size: 18px; margin-bottom: 10px;">❓ No hay preguntas creadas</p>
        <p style="opacity: 0.7;">Crea preguntas usando el botón "Agregar Pregunta"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = preguntas.map(p => `
    <div class="pregunta-card" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
      <div style="margin-bottom: 10px;">
        <span style="background: rgba(102,126,234,0.3); color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 12px; margin-right: 5px;">
          ${p.categoria}
        </span>
        <span style="background: rgba(118,75,162,0.3); color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 12px;">
          ${p.dificultad}
        </span>
      </div>
      <p style="color: white; font-weight: 600; margin: 10px 0;">${p.titulo || p.pregunta}</p>
      <div style="font-size: 13px; color: rgba(255,255,255,0.7);">
        ${p.opciones.map((op, i) => `${String.fromCharCode(65+i)}. ${op}`).join(' • ')}
      </div>
    </div>
  `).join('');
}

// ========== COPIAR CÓDIGO ==========
function copiarCodigo(codigo) {
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
    alert(`Código del curso: ${codigo}\n(Copia manualmente)`);
  }
  
  document.body.removeChild(textarea);
}

function copiarCodigoCurso() {
  const input = document.getElementById("codigoCurso");
  if (input && input.value) {
    copiarCodigo(input.value);
  } else {
    alert("No hay código para copiar");
  }
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

// ========== CERRAR SESIÓN ==========
function cerrarSesion() {
  console.log('👋 Cerrando sesión...');
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "/";
}

// ========== ACTUALIZAR NOMBRE USUARIO ==========
function actualizarNombreUsuario() {
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const nombreDocente = document.getElementById('nombreDocente');
  
  if (nombreDocente) {
    nombreDocente.textContent = userData.nombre || userData.nombreUsuario || 'Docente';
  }
}

// ========== ERROR HANDLER GLOBAL ==========
window.addEventListener('error', (e) => {
  console.error('❌ Error global:', e.error);
});

console.log('✅ Dashboard script cargado');
