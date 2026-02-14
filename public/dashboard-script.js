// ========== CONFIGURACIÓN ==========
const token = localStorage.getItem("token");

if (!token) {
  console.error('❌ No hay token');
  window.location.href = "/";
}

const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

console.log('✅ Dashboard cargado - API:', API_BASE_URL);

// ========== VARIABLES GLOBALES ==========
let cursosActuales = [];
let preguntasActuales = [];

// ========== TABS ==========
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  console.log('🎛️ Configurando', tabBtns.length, 'tabs');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      console.log('📑 Cambiando a tab:', targetTab);
      
      // Remover active de todos
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Activar el seleccionado
      btn.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Cargar datos del tab
      cargarDatosTab(targetTab);
    });
  });
}

function cargarDatosTab(tab) {
  console.log('📊 Cargando datos del tab:', tab);
  
  switch(tab) {
    case 'cursos':
      cargarCursos();
      break;
    case 'preguntas':
      cargarPreguntas();
      break;
    case 'analytics':
      // cargarAnalytics();
      break;
    case 'estudiantes':
      // cargarEstudiantes();
      break;
  }
}

// ========== MODALES ==========
function abrirModal(modalId) {
  console.log('📂 Abriendo modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
  }
}

function cerrarModal(modalId) {
  console.log('📁 Cerrando modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
}

window.addEventListener("click", (e) => {
  if (e.target.classList.contains('modal')) {
    cerrarModal(e.target.id);
  }
});

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando dashboard...');
  
  // Tabs
  setupTabs();
  
  // Botones crear/nuevo
  const crearCursoBtn = document.getElementById("crearCursoBtn");
  const nuevoCursoBtn = document.getElementById("nuevoCursoBtn");
  const nuevaPreguntaBtn = document.getElementById("nuevaPreguntaBtn");
  const invitarBtn = document.getElementById("invitarEstudianteBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const copiarBtn = document.getElementById("copiarCodigoBtn");
  
  if (crearCursoBtn) crearCursoBtn.onclick = () => abrirModal("modalCrearCurso");
  if (nuevoCursoBtn) nuevoCursoBtn.onclick = () => abrirModal("modalCrearCurso");
  if (nuevaPreguntaBtn) nuevaPreguntaBtn.onclick = () => abrirModal("modalPregunta");
  if (invitarBtn) invitarBtn.onclick = () => abrirModal("modalInvitar");
  if (logoutBtn) logoutBtn.onclick = cerrarSesion;
  if (copiarBtn) copiarBtn.onclick = copiarCodigoCurso;
  
  // Cerrar modales
  document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = (e) => {
      const modal = e.target.closest('.modal');
      if (modal) cerrarModal(modal.id);
    };
  });
  
  // Formularios
  const formCurso = document.getElementById("formCrearCurso");
  const formPregunta = document.getElementById("formPregunta");
  
  if (formCurso) formCurso.onsubmit = crearCurso;
  if (formPregunta) formPregunta.onsubmit = crearPregunta;
  
  // Cargar datos iniciales
  cargarCursos();
  cargarPreguntas();
  
  // Nombre usuario
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const nombreEl = document.getElementById('nombreDocente');
  if (nombreEl) nombreEl.textContent = userData.nombre || 'Docente';
  
  console.log('✅ Dashboard listo');
});

// ========== CREAR CURSO ==========
async function crearCurso(e) {
  e.preventDefault();
  
  const nombreCurso = document.getElementById("nombreCurso").value.trim();
  const nivelCurso = document.getElementById("nivelCurso")?.value.trim();
  const paraleloCurso = document.getElementById("paralelo Curso")?.value.trim();
  
  if (!nombreCurso) {
    alert("El nombre del curso es obligatorio");
    return;
  }
  
  let nombreCompleto = nombreCurso;
  if (nivelCurso && paraleloCurso) {
    nombreCompleto = `${nombreCurso} ${nivelCurso}° ${paraleloCurso}`;
  }
  
  const codigoCurso = generarCodigo();
  
  try {
    const res = await fetch(`${API_BASE_URL}/cursos/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombreCurso: nombreCompleto, codigoCurso }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.mensaje || "Error");
      return;
    }
    
    alert(`✅ Curso creado!\nNombre: ${nombreCompleto}\nCódigo: ${codigoCurso}`);
    cerrarModal("modalCrearCurso");
    cargarCursos();
    
  } catch (error) {
    console.error('❌', error);
    alert("Error al crear curso");
  }
}

// ========== CREAR PREGUNTA ==========
async function crearPregunta(e) {
  e.preventDefault();
  
  console.log('📝 Intentando crear pregunta...');
  
  // ✅ IDs CORRECTOS del HTML
  const titulo = document.getElementById("textoPregunta")?.value.trim();
  const categoria = document.getElementById("categoriaPregunta")?.value;
  const dificultad = document.getElementById("dificultadPregunta")?.value;
  
  const opciones = [
    document.getElementById("opcion0")?.value.trim(),
    document.getElementById("opcion1")?.value.trim(),
    document.getElementById("opcion2")?.value.trim(),
    document.getElementById("opcion3")?.value.trim(),
  ];
  
  const respuestaCorrecta = document.querySelector('input[name="respuestaCorrecta"]:checked')?.value;
  
  console.log('📋 Datos del formulario:', {
    titulo,
    categoria,
    dificultad,
    opciones,
    respuestaCorrecta
  });
  
  if (!titulo || !categoria || !dificultad || opciones.some(o => !o) || respuestaCorrecta === undefined) {
    console.error('❌ Faltan campos:', {
      titulo: !!titulo,
      categoria: !!categoria,
      dificultad: !!dificultad,
      opciones: opciones.map(o => !!o),
      respuestaCorrecta: !!respuestaCorrecta
    });
    alert("Todos los campos son obligatorios");
    return;
  }
  
  try {
    const body = {
      titulo,
      pregunta: titulo,
      categoria,
      dificultad,
      opciones,
      respuestaCorrecta,
    };
    
    console.log('📤 Enviando pregunta:', body);
    
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 Response:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(errorText);
    }
    
    const data = await res.json();
    console.log('✅ Pregunta creada:', data);
    
    alert("✅ Pregunta creada exitosamente!");
    cerrarModal("modalPregunta");
    cargarPreguntas();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert("Error al crear pregunta: " + error.message);
  }
}

// ========== CARGAR CURSOS ==========
async function cargarCursos() {
  try {
    console.log('📚 Cargando cursos...');
    
    const res = await fetch(`${API_BASE_URL}/cursos/docente`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    cursosActuales = await res.json();
    console.log('✅ Cursos:', cursosActuales.length);
    
    mostrarCursos(cursosActuales);
    
  } catch (error) {
    console.error('❌ Error cursos:', error);
    mostrarCursos([]);
  }
}

// ========== MOSTRAR CURSOS ==========
function mostrarCursos(cursos) {
  const container = document.getElementById("cursosGrid");
  if (!container) return;
  
  if (cursos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <p style="font-size: 18px;">📚 No hay cursos</p>
        <p style="opacity: 0.7;">Crea uno con el botón "Crear Curso"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = cursos.map(c => `
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
      <h3 style="color: white; margin: 0 0 15px 0;">${c.nombreCurso}</h3>
      <div style="margin: 10px 0;">
        <span style="background: rgba(102,126,234,0.3); color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
          ${c.codigoCurso}
        </span>
      </div>
      <p style="color: rgba(255,255,255,0.7); margin: 10px 0;">
        👥 ${c.totalEstudiantes || c.estudiantes?.length || 0} estudiantes
      </p>
      <button 
        onclick="copiarCodigo('${c.codigoCurso}')" 
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600;"
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
    console.log('✅ Preguntas:', preguntasActuales.length);
    
    mostrarPreguntas(preguntasActuales);
    
  } catch (error) {
    console.error('❌ Error preguntas:', error);
    mostrarPreguntas([]);
  }
}

// ========== MOSTRAR PREGUNTAS ==========
function mostrarPreguntas(preguntas) {
  const container = document.getElementById("preguntasGrid");
  if (!container) return;
  
  if (preguntas.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <p style="font-size: 18px;">❓ No hay preguntas</p>
        <p style="opacity: 0.7;">Crea una con el botón "Agregar Pregunta"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = preguntas.map(p => `
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
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
        ${p.opciones?.map((op, i) => `${String.fromCharCode(65+i)}. ${op}`).join(' • ') || ''}
      </div>
    </div>
  `).join('');
}

// ========== UTILIDADES ==========
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
    alert(`Código: ${codigo}\n(Copia manualmente)`);
  }
  
  document.body.removeChild(textarea);
}

function copiarCodigoCurso() {
  const input = document.getElementById("codigoCurso");
  if (input?.value) {
    copiarCodigo(input.value);
  }
}

function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/";
}

console.log('✅ Script cargado');
