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
      cargarAnalytics();
      break;
    case 'estudiantes':
      cargarEstudiantes();
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
  if (invitarBtn) invitarBtn.onclick = () => abrirModalInvitar();
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
  const formEditarCurso = document.getElementById("formEditarCurso");
  const formPregunta = document.getElementById("formPregunta");
  
  if (formCurso) formCurso.onsubmit = crearCurso;
  if (formEditarCurso) formEditarCurso.onsubmit = editarCurso;
  if (formPregunta) formPregunta.onsubmit = crearPregunta;
  
  // Cargar datos iniciales
  cargarCursos();
  cargarPreguntas();
  cargarAnalytics(); // ← cargar analytics al inicio

  // Listener selector de curso → recargar analytics
  const cursoSelect = document.getElementById('cursoSelect');
  if (cursoSelect) {
    cursoSelect.addEventListener('change', () => {
      cargarAnalytics();
    });
  }

  // Listener periodo → recargar analytics
  const periodoSelect = document.getElementById('periodoSelect');
  if (periodoSelect) {
    periodoSelect.addEventListener('change', () => {
      cargarAnalytics();
    });
  }
  
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
  console.log('📋 Formulario:', e.target);
  
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
  
  console.log('📋 Datos capturados:', {
    titulo,
    categoria,
    dificultad,
    opciones,
    respuestaCorrecta,
    tiposOpciones: opciones.map(o => typeof o),
    longitudesOpciones: opciones.map(o => o?.length)
  });
  
  // Validación con logging detallado
  const validacion = {
    titulo: !!titulo,
    categoria: !!categoria,
    dificultad: !!dificultad,
    opcion0: !!opciones[0],
    opcion1: !!opciones[1],
    opcion2: !!opciones[2],
    opcion3: !!opciones[3],
    respuestaCorrecta: respuestaCorrecta !== undefined && respuestaCorrecta !== null
  };
  
  console.log('✅ Validación:', validacion);
  
  if (!titulo || !categoria || !dificultad || opciones.some(o => !o) || respuestaCorrecta === undefined) {
    console.error('❌ Faltan campos:', validacion);
    alert(`Faltan campos obligatorios:\n${Object.entries(validacion).filter(([k,v]) => !v).map(([k]) => k).join('\n')}`);
    return;
  }
  
  try {
    const body = {
      titulo,
      pregunta: titulo,
      categoria,
      dificultad,
      opciones,
      respuestaCorrecta: String(respuestaCorrecta),  // ✅ Asegurar que sea string
    };
    
    console.log('📤 Enviando pregunta:', JSON.stringify(body, null, 2));
    
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error del servidor:', errorText);
      alert(`Error: ${errorText}`);
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
    console.log('📋 Cursos recibidos:', cursosActuales);
    
    // Actualizar tanto el grid como el selector
    mostrarCursos(cursosActuales);
    actualizarSelectorCursos(cursosActuales);
    
  } catch (error) {
    console.error('❌ Error cursos:', error);
    mostrarCursos([]);
    actualizarSelectorCursos([]);
  }
}

// ========== ACTUALIZAR SELECTOR DE CURSOS ==========
function actualizarSelectorCursos(cursos) {
  const selector = document.getElementById("cursoSelect");
  
  if (!selector) {
    console.warn('⚠️ Selector de cursos no encontrado');
    return;
  }
  
  console.log('📝 Actualizando selector con', cursos.length, 'cursos');
  
  // Limpiar opciones existentes
  selector.innerHTML = '<option value="">Seleccionar curso...</option>';
  
  // Agregar cada curso
  cursos.forEach(curso => {
    const codigo = curso.codigoCurso || curso.codigo || 'SIN-CODIGO';
    const option = document.createElement('option');
    option.value = curso._id;
    option.textContent = `${curso.nombreCurso} - ${codigo}`;
    selector.appendChild(option);
    console.log('➕ Opción agregada:', option.textContent);
  });
  
  console.log('✅ Selector actualizado con', selector.options.length - 1, 'cursos');
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
  
  container.innerHTML = cursos.map(c => {
    const codigo = c.codigoCurso || c.codigo || 'SIN-CODIGO';
    
    return `
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
      <h3 style="color: white; margin: 0 0 15px 0;">${c.nombreCurso}</h3>
      <div style="margin: 10px 0;">
        <span style="background: rgba(102,126,234,0.3); color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
          ${codigo}
        </span>
      </div>
      <p style="color: rgba(255,255,255,0.7); margin: 10px 0;">
        👥 ${c.totalEstudiantes || c.estudiantes?.length || 0} estudiantes
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button 
          onclick="copiarCodigo('${codigo}')" 
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600;"
        >
          📋 Copiar
        </button>
        <button 
          onclick='abrirModalEditarCurso(${JSON.stringify(c).replace(/'/g, "&apos;")})'
          style="background: rgba(251,191,36,0.2); color: #fbbf24; border: 1px solid #fbbf24; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600;"
        >
          ✏️ Editar
        </button>
      </div>
    </div>
  `}).join('');
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

// ========== MODAL INVITAR ESTUDIANTE ==========
function abrirModalInvitar() {
  // Llenar el selector de cursos en el modal
  const selectCurso = document.getElementById("selectorCursoInvitar");
  if (selectCurso) {
    selectCurso.innerHTML = '<option value="">Selecciona un curso...</option>';
    cursosActuales.forEach(curso => {
      const codigo = curso.codigoCurso || curso.codigo || '';
      const opt = document.createElement('option');
      opt.value = codigo;
      opt.textContent = `${curso.nombreCurso} (${codigo})`;
      selectCurso.appendChild(opt);
    });

    // Al cambiar curso, mostrar su código
    selectCurso.onchange = () => {
      const codigo = selectCurso.value;
      const inputCodigo = document.getElementById("codigoCurso");
      if (inputCodigo) inputCodigo.value = codigo;
      const infoEl = document.getElementById("cursoSeleccionadoInfo");
      if (infoEl) {
        if (codigo) {
          infoEl.innerHTML = `
            <div style="background: rgba(102,126,234,0.15); border: 2px solid #667eea; border-radius: 10px; padding: 15px; margin-top: 15px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Código para compartir:</p>
              <div style="font-size: 2em; font-weight: 900; letter-spacing: 6px; color: #667eea; font-family: monospace;">${codigo}</div>
              <p style="margin: 10px 0 0 0; font-size: 0.85em; color: #666;">El estudiante debe ingresar este código al registrarse o iniciar sesión</p>
            </div>
          `;
        } else {
          infoEl.innerHTML = '';
        }
      }
    };
  }
  abrirModal("modalInvitar");
}

function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// ========== ANALYTICS ==========
let chartInstance = null; // Para destruir el chart anterior

async function cargarAnalytics() {
  const cursoSelect = document.getElementById('cursoSelect');
  const periodoSelect = document.getElementById('periodoSelect');
  const cursoId = cursoSelect?.value;
  const periodo = periodoSelect?.value || 'mes';

  // Sin curso seleccionado → mostrar mensaje
  if (!cursoId) {
    mostrarAnalyticsVacio('Selecciona un curso en el menú superior para ver las estadísticas');
    return;
  }

  try {
    console.log(`📊 Cargando analytics: curso=${cursoId}, periodo=${periodo}`);

    const res = await fetch(`${API_BASE_URL}/cursos/${cursoId}/analytics?periodo=${periodo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    console.log('✅ Analytics recibidos:', data);

    renderizarAnalytics(data);

  } catch (error) {
    console.error('❌ Error analytics:', error);
    mostrarAnalyticsVacio('Error al cargar estadísticas. Intenta de nuevo.');
  }
}

function mostrarAnalyticsVacio(mensaje) {
  // KPIs en cero
  document.getElementById('totalEstudiantes').textContent = '0';
  document.getElementById('totalSesiones').textContent = '0';
  document.getElementById('promedioGeneral').textContent = '0%';
  document.getElementById('tiempoPromedio').textContent = '0s';

  // Top estudiantes vacío
  const topEl = document.getElementById('topEstudiantes');
  if (topEl) topEl.innerHTML = `
    <div style="text-align:center; padding:30px; color:#aaa;">
      <p>${mensaje}</p>
    </div>
  `;

  // Tabla vacía
  const tbody = document.querySelector('#sesionesTable tbody');
  if (tbody) tbody.innerHTML = `
    <tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;">${mensaje}</td></tr>
  `;

  // Limpiar chart
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

function renderizarAnalytics(data) {
  const { kpis, rendimientoCategorias, topEstudiantes, sesionesRecientes } = data;

  // ── KPIs ──
  document.getElementById('totalEstudiantes').textContent = kpis.totalEstudiantes;
  document.getElementById('totalSesiones').textContent = kpis.totalSesiones;
  document.getElementById('promedioGeneral').textContent = kpis.promedioGeneral + '%';
  
  // ✅ Formato legible para tiempo promedio
  const segundos = kpis.tiempoPromedio;
  let textoTiempo;
  if (segundos < 60) {
    textoTiempo = segundos + 's';
  } else if (segundos < 3600) {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    textoTiempo = segs > 0 ? `${minutos}m ${segs}s` : `${minutos}m`;
  } else {
    const horas = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    textoTiempo = mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
  }
  document.getElementById('tiempoPromedio').textContent = textoTiempo;

  // ── Gráfico de categorías ──
  const canvas = document.getElementById('categoriaChart');
  if (canvas) {
    if (chartInstance) chartInstance.destroy();

    if (rendimientoCategorias.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#aaa';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos en este periodo', canvas.width / 2, canvas.height / 2);
    } else {
      chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: rendimientoCategorias.map(c => c.nombre),
          datasets: [{
            label: 'Promedio (%)',
            data: rendimientoCategorias.map(c => c.promedio),
            backgroundColor: [
              'rgba(102,126,234,0.7)',
              'rgba(118,75,162,0.7)',
              'rgba(52,211,153,0.7)',
              'rgba(251,191,36,0.7)',
              'rgba(239,68,68,0.7)',
            ],
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y}% promedio`
              }
            }
          },
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
          }
        }
      });
    }
  }

  // ── Top 5 Estudiantes ──
  const topEl = document.getElementById('topEstudiantes');
  if (topEl) {
    if (topEstudiantes.length === 0) {
      topEl.innerHTML = '<div style="text-align:center; padding:20px; color:#aaa;">Sin actividad en este periodo</div>';
    } else {
      const medallas = ['🥇','🥈','🥉','4️⃣','5️⃣'];
      topEl.innerHTML = topEstudiantes.map((est, i) => `
        <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0;">
          <span style="font-size:1.4em;">${medallas[i]}</span>
          <div style="flex:1;">
            <p style="margin:0; font-weight:600; color:#333;">${est.nombre} ${est.apellido}</p>
            <p style="margin:2px 0 0; font-size:0.8em; color:#888;">@${est.nombreUsuario} · ${est.sesiones} sesión${est.sesiones !== 1 ? 'es' : ''}</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:1.1em; font-weight:700; color:#667eea;">${est.promedio}%</span>
          </div>
        </div>
      `).join('');
    }
  }

  // ── Sesiones Recientes ──
  const tbody = document.querySelector('#sesionesTable tbody');
  if (tbody) {
    if (sesionesRecientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;">Sin sesiones en este periodo</td></tr>';
    } else {
      tbody.innerHTML = sesionesRecientes.map(s => {
        const fecha = new Date(s.createdAt).toLocaleDateString('es-EC', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const colorPct = s.porcentaje >= 70 ? '#10b981' : s.porcentaje >= 40 ? '#f59e0b' : '#ef4444';
        return `
          <tr>
            <td>${s.nombreEstudiante}</td>
            <td style="text-transform:capitalize;">${s.categoria || '-'}</td>
            <td style="text-transform:capitalize;">${s.dificultad || '-'}</td>
            <td style="font-weight:700; color:${colorPct};">${s.porcentaje || 0}%</td>
            <td style="font-size:0.85em; color:#888;">${fecha}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

// ========== EDITAR CURSO ==========
function abrirModalEditarCurso(curso) {
  console.log('✏️ Abriendo modal editar para:', curso);
  
  // Llenar formulario
  document.getElementById('editarCursoId').value = curso._id;
  document.getElementById('editarNombreCurso').value = curso.nombre || curso.nombreCurso?.split(' ')[0] || '';
  document.getElementById('editarNivelCurso').value = curso.nivel || '';
  document.getElementById('editarParaleloCurso').value = curso.paralelo || '';
  
  // Marcar categorías activas
  const categoriasActivas = curso.categoriasActivas || ['algebra', 'geometria', 'estadistica', 'numeros', 'funciones', 'trigonometria'];
  document.querySelectorAll('input[name="editarCategorias"]').forEach(checkbox => {
    checkbox.checked = categoriasActivas.includes(checkbox.value);
  });
  
  abrirModal('modalEditarCurso');
}

async function editarCurso(e) {
  e.preventDefault();
  
  const cursoId = document.getElementById('editarCursoId').value;
  const nombre = document.getElementById('editarNombreCurso').value.trim();
  const nivel = document.getElementById('editarNivelCurso').value.trim();
  const paralelo = document.getElementById('editarParaleloCurso').value.trim();
  
  // Obtener categorías seleccionadas
  const categoriasActivas = Array.from(document.querySelectorAll('input[name="editarCategorias"]:checked'))
    .map(cb => cb.value);
  
  if (categoriasActivas.length === 0) {
    alert('Debes seleccionar al menos una categoría');
    return;
  }
  
  try {
    console.log('📝 Editando curso:', cursoId);
    
    const res = await fetch(`${API_BASE_URL}/cursos/${cursoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, nivel, paralelo, categoriasActivas })
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Curso editado:', data);
    
    cerrarModal('modalEditarCurso');
    cargarCursos(); // Recargar lista
    
    alert('✅ Curso actualizado correctamente');
    
  } catch (error) {
    console.error('❌ Error editando curso:', error);
    alert('Error al editar el curso');
  }
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/";
}

// ========== CARGAR ESTUDIANTES ==========
async function cargarEstudiantes() {
  try {
    console.log('👥 Cargando estudiantes...');

    const container = document.getElementById("estudiantesGrid");
    if (container) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:white;">
          <p style="font-size:18px;">⏳ Cargando estudiantes...</p>
        </div>
      `;
    }

    const res = await fetch(`${API_BASE_URL}/cursos/estudiantes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    console.log('✅ Datos de estudiantes recibidos:', data);

    mostrarEstudiantes(data);

  } catch (error) {
    console.error('❌ Error cargando estudiantes:', error);
    const container = document.getElementById("estudiantesGrid");
    if (container) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:white;">
          <p style="font-size:18px;">❌ Error al cargar estudiantes</p>
          <button onclick="cargarEstudiantes()" style="margin-top:10px; padding:8px 16px; background:#667eea; color:white; border:none; border-radius:8px; cursor:pointer;">
            🔄 Reintentar
          </button>
        </div>
      `;
    }
  }
}

// ========== MOSTRAR ESTUDIANTES ==========
function mostrarEstudiantes(data) {
  const container = document.getElementById("estudiantesGrid");
  if (!container) return;

  const cursos = data.cursos || [];
  const totalEstudiantes = data.totalEstudiantes || 0;

  // Sin cursos
  if (cursos.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:50px; color:white;">
        <div style="font-size:3em; margin-bottom:15px;">👥</div>
        <p style="font-size:1.3em; font-weight:600;">No hay cursos aún</p>
        <p style="opacity:0.7; margin-top:8px;">Crea un curso y comparte el código con tus estudiantes</p>
      </div>
    `;
    return;
  }

  // Header con total
  let html = `
    <div style="grid-column:1/-1; margin-bottom:10px;">
      <div style="background:rgba(255,255,255,0.1); border-radius:12px; padding:15px 20px; display:flex; align-items:center; gap:15px;">
        <span style="font-size:2em;">👨‍🎓</span>
        <div>
          <p style="color:white; font-size:1.1em; font-weight:700; margin:0;">
            ${totalEstudiantes} estudiante${totalEstudiantes !== 1 ? 's' : ''} en total
          </p>
          <p style="color:rgba(255,255,255,0.6); font-size:0.85em; margin:4px 0 0 0;">
            ${cursos.length} curso${cursos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  `;

  // Una tarjeta por curso
  cursos.forEach(curso => {
    const sinEstudiantes = curso.estudiantes.length === 0;

    html += `
      <div style="
        grid-column: 1/-1;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 10px;
      ">
        <!-- Encabezado del curso -->
        <div style="
          background: linear-gradient(135deg, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.4) 100%);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <h3 style="color:white; margin:0; font-size:1.1em;">${curso.nombreCurso}</h3>
            <span style="
              background: rgba(255,255,255,0.2); color:white;
              padding: 2px 10px; border-radius:20px; font-size:0.8em;
              font-weight:700; letter-spacing:2px; font-family:monospace;
            ">${curso.codigo}</span>
          </div>
          <div style="
            background: rgba(255,255,255,0.2); color:white;
            padding: 5px 14px; border-radius:20px; font-size:0.85em; font-weight:600;
          ">
            👥 ${curso.totalEstudiantes} estudiante${curso.totalEstudiantes !== 1 ? 's' : ''}
          </div>
        </div>

        <!-- Lista de estudiantes -->
        <div style="padding: 15px 20px;">
          ${sinEstudiantes ? `
            <div style="text-align:center; padding:20px; color:rgba(255,255,255,0.5);">
              <p style="margin:0;">Ningún estudiante inscrito aún</p>
              <p style="margin:5px 0 0 0; font-size:0.85em;">Comparte el código <strong>${curso.codigo}</strong> para que se unan</p>
            </div>
          ` : `
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:10px;">
              ${curso.estudiantes.map(est => `
                <div style="
                  background: rgba(255,255,255,0.08);
                  border-radius: 10px; padding: 12px 15px;
                  display: flex; align-items: center; gap: 12px;
                ">
                  <!-- Avatar -->
                  <div style="
                    width:42px; height:42px; border-radius:50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display:flex; align-items:center; justify-content:center;
                    font-size:1.1em; font-weight:700; color:white; flex-shrink:0;
                  ">
                    ${(est.nombre || '?')[0].toUpperCase()}${(est.apellido || '')[0]?.toUpperCase() || ''}
                  </div>
                  <!-- Info -->
                  <div style="flex:1; min-width:0;">
                    <p style="color:white; margin:0; font-weight:600; font-size:0.95em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${est.nombre} ${est.apellido}
                    </p>
                    <p style="color:rgba(255,255,255,0.6); margin:2px 0 0 0; font-size:0.8em;">
                      @${est.nombreUsuario}
                      ${est.paralelo !== '-' ? ` · Paralelo ${est.paralelo}` : ''}
                    </p>
                  </div>
                  <!-- Botón eliminar -->
                  <button
                    onclick="eliminarEstudiante('${curso._id}', '${est._id}', '${est.nombre} ${est.apellido}')"
                    title="Eliminar del curso"
                    style="
                      background: rgba(239,68,68,0.2); border: none; color: #fca5a5;
                      width:30px; height:30px; border-radius:8px; cursor:pointer;
                      font-size:0.9em; flex-shrink:0;
                      display:flex; align-items:center; justify-content:center;
                    "
                  >✕</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ========== ELIMINAR ESTUDIANTE DE UN CURSO ==========
async function eliminarEstudiante(cursoId, estudianteId, nombre) {
  if (!confirm(`¿Eliminar a "${nombre}" del curso?`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/cursos/${cursoId}/estudiante/${estudianteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    console.log('✅ Estudiante eliminado');
    cargarEstudiantes(); // Recargar la lista

  } catch (error) {
    console.error('❌ Error eliminando estudiante:', error);
    alert('Error al eliminar estudiante');
  }
}

console.log('✅ Script cargado');
