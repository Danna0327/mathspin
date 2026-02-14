// Variables globales
let currentUser = null
let currentCourse = null
let courses = []
let questions = []
const students = []

// Configuración de la API - Detecta automáticamente si es local o Railway
const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:5000/api"
  : `${window.location.origin}/api`;

console.log('🔍 Dashboard API URL:', API_BASE_URL);

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  console.log('📱 Dashboard DOM cargado');
  initializeDashboard();
  setupEventListeners();
});

// Inicializar dashboard
async function initializeDashboard() {
  try {
    console.log('🚀 Inicializando dashboard...');
    
    // Verificar autenticación
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('❌ No hay token, redirigiendo...');
      window.location.href = "/";
      return;
    }

    console.log('✅ Token encontrado');

    // Obtener datos del usuario
    await loadUserData();
    await loadCourses();

    // Configurar interfaz inicial
    setupTabs();

    showNotification("Dashboard cargado correctamente", "success");
    console.log('✅ Dashboard inicializado completamente');
  } catch (error) {
    console.error("❌ Error al inicializar dashboard:", error);
    showNotification("Error al cargar el dashboard", "error");
  }
}

// Cargar datos del usuario (CORREGIDO - No redirige si falla)
async function loadUserData() {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error('❌ No hay token en loadUserData');
      window.location.href = "/";
      return;
    }

    console.log('👤 Cargando datos del usuario...');

    // Intentar obtener datos del usuario del servidor
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('📡 Response /users/me:', response.status);

    if (response.ok) {
      currentUser = await response.json();
      console.log('✅ Usuario cargado del servidor:', currentUser);
      
      const nombreElemento = document.getElementById("nombreDocente");
      if (nombreElemento) {
        nombreElemento.textContent = currentUser.nombre || currentUser.nombreUsuario || 'Docente';
      }
    } else {
      // ⚠️ FIX CRÍTICO: No redirigir, usar datos del localStorage
      console.warn('⚠️ Endpoint /users/me no disponible (', response.status, '), usando localStorage');
      
      const userData = JSON.parse(localStorage.getItem("currentUser") || '{}');
      
      if (userData && userData.nombreUsuario) {
        currentUser = userData;
        console.log('✅ Usando datos de localStorage:', currentUser);
        
        const nombreElemento = document.getElementById("nombreDocente");
        if (nombreElemento) {
          nombreElemento.textContent = currentUser.nombre || currentUser.nombreUsuario || 'Docente';
        }
      } else {
        // Crear usuario básico con los datos que tenemos
        currentUser = {
          nombreUsuario: 'Docente',
          rol: 'docente'
        };
        console.log('⚠️ Usando datos de usuario básicos');
        
        const nombreElemento = document.getElementById("nombreDocente");
        if (nombreElemento) {
          nombreElemento.textContent = 'Docente';
        }
      }
    }
  } catch (error) {
    console.error("❌ Error en loadUserData:", error);
    
    // ⚠️ FIX CRÍTICO: Intentar usar localStorage en vez de redirigir
    try {
      const userData = JSON.parse(localStorage.getItem("currentUser") || '{}');
      
      if (userData && userData.nombreUsuario) {
        currentUser = userData;
        console.log('✅ Recuperado de localStorage tras error:', currentUser);
        
        const nombreElemento = document.getElementById("nombreDocente");
        if (nombreElemento) {
          nombreElemento.textContent = currentUser.nombre || currentUser.nombreUsuario || 'Docente';
        }
        return; // NO redirigir, continuar
      }
    } catch (e) {
      console.error('Error leyendo localStorage:', e);
    }
    
    // Solo redirigir si REALMENTE no podemos saber quién es
    console.warn('⚠️ No se puede determinar usuario, pero continuando...');
    currentUser = { nombreUsuario: 'Docente', rol: 'docente' };
    
    const nombreElemento = document.getElementById("nombreDocente");
    if (nombreElemento) {
      nombreElemento.textContent = 'Docente';
    }
  }
}

// Cargar cursos del docente (MEJORADO con mejor logging)
async function loadCourses() {
  try {
    const token = localStorage.getItem("token");
    console.log('📚 Cargando cursos...');
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');
    
    const response = await fetch(`${API_BASE}/cursos/docente`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('📊 Response cursos:', response.status);

    if (response.ok) {
      courses = await response.json();
      console.log('✅ Cursos cargados:', courses.length);
      updateCourseSelector();
      updateCoursesGrid();
    } else {
      const errorText = await response.text();
      console.error('❌ Error cargando cursos:', response.status, errorText);
      
      // No mostrar error si es 401, simplemente no hay cursos
      if (response.status !== 401) {
        showNotification("Error al cargar cursos", "error");
      } else {
        console.warn('⚠️ Error 401 al cargar cursos - token inválido o endpoint requiere configuración');
      }
      
      courses = [];
      updateCourseSelector();
      updateCoursesGrid();
    }
  } catch (error) {
    console.error("❌ Error al cargar cursos:", error);
    courses = [];
    updateCourseSelector();
    updateCoursesGrid();
  }
}

// Actualizar selector de cursos
function updateCourseSelector() {
  const selector = document.getElementById("cursoSelect");
  if (!selector) return;
  
  selector.innerHTML = '<option value="">Seleccionar curso...</option>';

  courses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course._id;
    option.textContent = `${course.nombreCurso} - ${course.codigoCurso}`;
    selector.appendChild(option);
  });
}

// Configurar event listeners
function setupEventListeners() {
  console.log('🎛️ Configurando event listeners...');
  
  // Selector de curso
  const cursoSelect = document.getElementById("cursoSelect");
  if (cursoSelect) {
    cursoSelect.addEventListener("change", handleCourseChange);
  }

  // Botones principales
  const crearCursoBtn = document.getElementById("crearCursoBtn");
  if (crearCursoBtn) {
    crearCursoBtn.addEventListener("click", () => openModal("modalCrearCurso"));
  }

  const nuevoCursoBtn = document.getElementById("nuevoCursoBtn");
  if (nuevoCursoBtn) {
    nuevoCursoBtn.addEventListener("click", () => openModal("modalCrearCurso"));
  }

  const nuevaPreguntaBtn = document.getElementById("nuevaPreguntaBtn");
  if (nuevaPreguntaBtn) {
    nuevaPreguntaBtn.addEventListener("click", () => openModal("modalPregunta"));
  }

  const invitarEstudianteBtn = document.getElementById("invitarEstudianteBtn");
  if (invitarEstudianteBtn) {
    invitarEstudianteBtn.addEventListener("click", showInviteModal);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Formularios
  const formCrearCurso = document.getElementById("formCrearCurso");
  if (formCrearCurso) {
    formCrearCurso.addEventListener("submit", handleCreateCourse);
  }

  const formPregunta = document.getElementById("formPregunta");
  if (formPregunta) {
    formPregunta.addEventListener("submit", handleSaveQuestion);
  }

  // Filtros
  const periodoSelect = document.getElementById("periodoSelect");
  if (periodoSelect) {
    periodoSelect.addEventListener("change", loadAnalytics);
  }

  const categoriaFiltro = document.getElementById("categoriaFiltro");
  if (categoriaFiltro) {
    categoriaFiltro.addEventListener("change", loadQuestions);
  }

  const dificultadFiltro = document.getElementById("dificultadFiltro");
  if (dificultadFiltro) {
    dificultadFiltro.addEventListener("change", loadQuestions);
  }

  const busquedaInput = document.getElementById("busquedaInput");
  if (busquedaInput) {
    busquedaInput.addEventListener("input", debounce(loadQuestions, 300));
  }

  // Copiar código
  const copiarCodigoBtn = document.getElementById("copiarCodigoBtn");
  if (copiarCodigoBtn) {
    copiarCodigoBtn.addEventListener("click", copyCode);
  }

  // Cerrar modales
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });
  
  console.log('✅ Event listeners configurados');
}

// Configurar tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // Actualizar botones
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Actualizar contenido
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === targetTab) {
          content.classList.add("active");

          // Cargar datos específicos del tab
          loadTabData(targetTab);
        }
      });
    });
  });
}

// Cargar datos específicos del tab
async function loadTabData(tab) {
  if (!currentCourse) {
    console.log('⚠️ No hay curso seleccionado');
    return;
  }

  console.log('📑 Cargando datos del tab:', tab);

  switch (tab) {
    case "analytics":
      await loadAnalytics();
      break;
    case "estudiantes":
      await loadStudents();
      break;
    case "preguntas":
      await loadQuestions();
      break;
    case "cursos":
      updateCoursesGrid();
      break;
  }
}

// Manejar cambio de curso
async function handleCourseChange(e) {
  const courseId = e.target.value;

  if (courseId) {
    currentCourse = courses.find((c) => c._id === courseId);
    console.log('✅ Curso seleccionado:', currentCourse);

    // Cargar datos del curso actual
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
      await loadTabData(activeTab.dataset.tab);
    }

    showNotification(`Curso ${currentCourse.nombreCurso} seleccionado`, "success");
  } else {
    currentCourse = null;
    clearDashboard();
  }
}

// Limpiar dashboard
function clearDashboard() {
  // Limpiar KPIs
  const totalEstudiantes = document.getElementById("totalEstudiantes");
  const totalSesiones = document.getElementById("totalSesiones");
  const promedioGeneral = document.getElementById("promedioGeneral");
  const tiempoPromedio = document.getElementById("tiempoPromedio");

  if (totalEstudiantes) totalEstudiantes.textContent = "0";
  if (totalSesiones) totalSesiones.textContent = "0";
  if (promedioGeneral) promedioGeneral.textContent = "0%";
  if (tiempoPromedio) tiempoPromedio.textContent = "0min";

  // Limpiar grids
  const estudiantesGrid = document.getElementById("estudiantesGrid");
  const preguntasGrid = document.getElementById("preguntasGrid");

  if (estudiantesGrid) {
    estudiantesGrid.innerHTML = '<p style="color: white; text-align: center;">Selecciona un curso para ver los estudiantes</p>';
  }
  if (preguntasGrid) {
    preguntasGrid.innerHTML = '<p style="color: white; text-align: center;">Selecciona un curso para gestionar preguntas</p>';
  }
}

// Cargar analytics
async function loadAnalytics() {
  if (!currentCourse) return;

  try {
    const periodo = document.getElementById("periodoSelect")?.value || "semana";
    const response = await fetch(`${API_BASE}/cursos/${currentCourse._id}/analytics?periodo=${periodo}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      const data = await response.json();
      updateAnalytics(data);
    }
  } catch (error) {
    console.error("Error al cargar analytics:", error);
    showNotification("Error al cargar analytics", "error");
  }
}

// Actualizar analytics en la interfaz
function updateAnalytics(data) {
  // Actualizar KPIs
  const totalEstudiantes = document.getElementById("totalEstudiantes");
  const totalSesiones = document.getElementById("totalSesiones");
  const promedioGeneral = document.getElementById("promedioGeneral");
  const tiempoPromedio = document.getElementById("tiempoPromedio");

  if (totalEstudiantes && data.kpis) totalEstudiantes.textContent = data.kpis.totalEstudiantes || 0;
  if (totalSesiones && data.kpis) totalSesiones.textContent = data.kpis.totalSesiones || 0;
  if (promedioGeneral && data.kpis) promedioGeneral.textContent = `${Math.round(data.kpis.promedioGeneral || 0)}%`;
  if (tiempoPromedio && data.kpis) tiempoPromedio.textContent = `${Math.round((data.kpis.tiempoPromedio || 0) / 60)}min`;

  // Actualizar gráfico de categorías
  if (data.estadisticasPorCategoria) {
    updateCategoryChart(data.estadisticasPorCategoria);
  }

  // Actualizar ranking
  if (data.topEstudiantes) {
    updateRanking(data.topEstudiantes);
  }

  // Actualizar tabla de sesiones
  if (data.sesionesRecientes) {
    updateSessionsTable(data.sesionesRecientes);
  }
}

// Actualizar gráfico de categorías
function updateCategoryChart(data) {
  const ctx = document.getElementById("categoriaChart");
  if (!ctx) return;

  const context = ctx.getContext("2d");

  // Destruir gráfico anterior si existe
  if (window.categoryChart) {
    window.categoryChart.destroy();
  }

  const labels = Object.keys(data).map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1));
  const scores = Object.values(data).map((cat) => cat.promedioScore || 0);

  if (typeof Chart !== 'undefined') {
    window.categoryChart = new Chart(context, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Promedio de Puntuación",
            data: scores,
            backgroundColor: [
              "rgba(102, 126, 234, 0.8)",
              "rgba(118, 75, 162, 0.8)",
              "rgba(56, 161, 105, 0.8)",
              "rgba(237, 137, 54, 0.8)",
              "rgba(229, 62, 62, 0.8)",
            ],
            borderColor: [
              "rgba(102, 126, 234, 1)",
              "rgba(118, 75, 162, 1)",
              "rgba(56, 161, 105, 1)",
              "rgba(237, 137, 54, 1)",
              "rgba(229, 62, 62, 1)",
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + "%",
            },
          },
        },
      },
    });
  }
}

// Actualizar ranking
function updateRanking(students) {
  const container = document.getElementById("topEstudiantes");
  if (!container) return;
  
  container.innerHTML = "";

  students.forEach((student, index) => {
    const item = document.createElement("div");
    item.className = "ranking-item";
    item.innerHTML = `
      <div class="ranking-position">${index + 1}</div>
      <div class="ranking-info">
        <h4>${student.nombre}</h4>
        <p>${student.promedio}% promedio • ${student.totalSesiones} sesiones</p>
      </div>
    `;
    container.appendChild(item);
  });
}

// Actualizar tabla de sesiones
function updateSessionsTable(sessions) {
  const tbody = document.querySelector("#sesionesTable tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  sessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.estudiante}</td>
      <td><span class="categoria-badge">${session.categoria}</span></td>
      <td><span class="dificultad-badge ${session.dificultad}">${session.dificultad}</span></td>
      <td>${session.puntuacion}%</td>
      <td>${new Date(session.fecha).toLocaleDateString()}</td>
    `;
    tbody.appendChild(row);
  });
}

// Cargar estudiantes
async function loadStudents() {
  if (!currentCourse) return;

  const container = document.getElementById("estudiantesGrid");
  if (!container) return;
  
  container.innerHTML = "";

  if (!currentCourse.estudiantes || currentCourse.estudiantes.length === 0) {
    container.innerHTML = '<p style="color: white; text-align: center;">No hay estudiantes en este curso</p>';
    return;
  }

  currentCourse.estudiantes.forEach((student) => {
    const card = createStudentCard(student);
    container.appendChild(card);
  });
}

// Crear tarjeta de estudiante
function createStudentCard(student) {
  const card = document.createElement("div");
  card.className = "estudiante-card";

  const initials = student.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const lastConnection = new Date(student.ultimaConexion || Date.now()).toLocaleDateString();

  card.innerHTML = `
    <div class="estudiante-header">
      <div class="estudiante-avatar">${initials}</div>
      <div class="estudiante-info">
        <h4>${student.nombre}</h4>
        <p>Última conexión: ${lastConnection}</p>
      </div>
    </div>
    <div class="estudiante-stats">
      <div class="stat-item">
        <div class="value">${student.estadisticas?.totalSesiones || 0}</div>
        <div class="label">Sesiones</div>
      </div>
      <div class="stat-item">
        <div class="value">${Math.round(student.estadisticas?.promedioGeneral || 0)}%</div>
        <div class="label">Promedio</div>
      </div>
    </div>
    <div class="estudiante-actions">
      <button class="btn-primary btn-small" onclick="viewStudentHistory('${student._id}')">
        <i class="fas fa-chart-line"></i> Historial
      </button>
      <button class="btn-secondary btn-small" onclick="removeStudent('${student._id}')">
        <i class="fas fa-user-minus"></i> Remover
      </button>
    </div>
  `;

  return card;
}

// Cargar preguntas
async function loadQuestions() {
  try {
    const categoria = document.getElementById("categoriaFiltro")?.value || "todas";
    const dificultad = document.getElementById("dificultadFiltro")?.value || "todas";
    const busqueda = document.getElementById("busquedaInput")?.value || "";

    const params = new URLSearchParams();
    if (categoria !== "todas") params.append("categoria", categoria);
    if (dificultad !== "todas") params.append("dificultad", dificultad);
    if (busqueda) params.append("busqueda", busqueda);

    console.log('📝 Cargando preguntas con filtros:', { categoria, dificultad, busqueda });

    const response = await fetch(`${API_BASE}/questions?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      questions = await response.json();
      console.log('✅ Preguntas cargadas:', questions.length);
      updateQuestionsGrid();
    } else {
      console.error('❌ Error cargando preguntas:', response.status);
      questions = [];
      updateQuestionsGrid();
    }
  } catch (error) {
    console.error("Error al cargar preguntas:", error);
    showNotification("Error al cargar preguntas", "error");
    questions = [];
    updateQuestionsGrid();
  }
}

// Actualizar grid de preguntas
function updateQuestionsGrid() {
  const container = document.getElementById("preguntasGrid");
  if (!container) return;
  
  container.innerHTML = "";

  if (questions.length === 0) {
    container.innerHTML = '<p style="color: white; text-align: center;">No se encontraron preguntas. Crea tu primera pregunta usando el botón "Agregar Pregunta".</p>';
    return;
  }

  questions.forEach((question) => {
    const card = createQuestionCard(question);
    container.appendChild(card);
  });
}

// Crear tarjeta de pregunta
function createQuestionCard(question) {
  const card = document.createElement("div");
  card.className = "pregunta-card";

  card.innerHTML = `
    <div class="pregunta-header">
      <div class="pregunta-meta">
        <span class="categoria-badge">${question.categoria}</span>
        <span class="dificultad-badge ${question.dificultad}">${question.dificultad}</span>
      </div>
      <div class="pregunta-actions">
        <button class="btn-primary btn-small" onclick="editQuestion('${question._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-secondary btn-small" onclick="deleteQuestion('${question._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="pregunta-texto">${question.pregunta || question.titulo}</div>
    <div class="pregunta-opciones">
      ${question.opciones
        .map(
          (opcion, index) => `
          <div class="opcion-item ${index === question.respuestaCorrecta ? "correcta" : ""}">
            ${String.fromCharCode(65 + index)}. ${opcion}
          </div>
        `,
        )
        .join("")}
    </div>
  `;

  return card;
}

// Actualizar grid de cursos
function updateCoursesGrid() {
  const container = document.getElementById("cursosGrid");
  if (!container) return;
  
  container.innerHTML = "";

  if (courses.length === 0) {
    container.innerHTML = '<p style="color: white; text-align: center;">No tienes cursos creados. Crea tu primer curso usando el botón "Crear Curso".</p>';
    return;
  }

  courses.forEach((course) => {
    const card = createCourseCard(course);
    container.appendChild(card);
  });
}

// Crear tarjeta de curso
function createCourseCard(course) {
  const card = document.createElement("div");
  card.className = "curso-card";

  card.innerHTML = `
    <div class="curso-header">
      <div class="curso-info">
        <h3>${course.nombreCurso}</h3>
        <span class="curso-codigo">${course.codigoCurso}</span>
      </div>
    </div>
    <div class="curso-stats">
      <div class="curso-stat">
        <div class="value">${course.estudiantes?.length || 0}</div>
        <div class="label">Estudiantes</div>
      </div>
    </div>
    <div class="curso-actions">
      <button class="btn-primary btn-small" onclick="selectCourse('${course._id}')">
        <i class="fas fa-eye"></i> Ver
      </button>
      <button class="btn-secondary btn-small" onclick="shareCourse('${course._id}')">
        <i class="fas fa-share"></i> Compartir
      </button>
    </div>
  `;

  return card;
}

// Manejar creación de curso
async function handleCreateCourse(e) {
  e.preventDefault();
  console.log('📝 Creando curso...');

  const formData = new FormData(e.target);
  const courseData = {
    nombreCurso: formData.get("nombreCurso"),
    codigoCurso: generateCourseCode(),
  };

  console.log('📦 Datos del curso:', courseData);

  try {
    const response = await fetch(`${API_BASE}/cursos/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(courseData),
    });

    console.log('📡 Response crear curso:', response.status);

    if (response.ok) {
      const newCourse = await response.json();
      console.log('✅ Curso creado:', newCourse);
      showNotification("Curso creado exitosamente", "success");
      closeModal("modalCrearCurso");
      await loadCourses();
      e.target.reset();
    } else {
      const errorText = await response.text();
      console.error('❌ Error creando curso:', errorText);
      throw new Error("Error al crear curso");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Error al crear curso", "error");
  }
}

// Generar código de curso aleatorio
function generateCourseCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Manejar guardado de pregunta
async function handleSaveQuestion(e) {
  e.preventDefault();
  console.log('📝 Guardando pregunta...');

  const formData = new FormData(e.target);
  const questionData = {
    titulo: formData.get("tituloPregunta") || formData.get("textoPregunta"),
    pregunta: formData.get("textoPregunta"),
    categoria: formData.get("categoriaPregunta"),
    dificultad: formData.get("dificultadPregunta"),
    opciones: [
      formData.get("opcion0") || formData.get("opcionA"),
      formData.get("opcion1") || formData.get("opcionB"),
      formData.get("opcion2") || formData.get("opcionC"),
      formData.get("opcion3") || formData.get("opcionD")
    ],
    respuestaCorrecta: formData.get("respuestaCorrecta"),
  };

  console.log('📦 Datos de pregunta:', questionData);

  try {
    const questionId = e.target.dataset.questionId;
    const url = questionId ? `${API_BASE}/questions/${questionId}` : `${API_BASE}/questions`;
    const method = questionId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(questionData),
    });

    console.log('📡 Response guardar pregunta:', response.status);

    if (response.ok) {
      console.log('✅ Pregunta guardada');
      showNotification("Pregunta guardada exitosamente", "success");
      closeModal("modalPregunta");
      await loadQuestions();
      e.target.reset();
      delete e.target.dataset.questionId;
    } else {
      const errorText = await response.text();
      console.error('❌ Error guardando pregunta:', errorText);
      throw new Error("Error al guardar pregunta");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Error al guardar pregunta", "error");
  }
}

// Editar pregunta
async function editQuestion(questionId) {
  const question = questions.find((q) => q._id === questionId);
  if (!question) return;

  console.log('✏️ Editando pregunta:', questionId);

  // Llenar formulario
  const textoPregunta = document.getElementById("textoPregunta");
  const categoriaPregunta = document.getElementById("categoriaPregunta");
  const dificultadPregunta = document.getElementById("dificultadPregunta");

  if (textoPregunta) textoPregunta.value = question.pregunta || question.titulo;
  if (categoriaPregunta) categoriaPregunta.value = question.categoria;
  if (dificultadPregunta) dificultadPregunta.value = question.dificultad;

  question.opciones.forEach((opcion, index) => {
    const opcionInput = document.getElementById(`opcion${index}`);
    if (opcionInput) opcionInput.value = opcion;
  });

  const respuestaInput = document.querySelector(`input[name="respuestaCorrecta"][value="${question.respuestaCorrecta}"]`);
  if (respuestaInput) respuestaInput.checked = true;

  // Configurar formulario para edición
  const tituloModal = document.getElementById("tituloModalPregunta");
  if (tituloModal) tituloModal.textContent = "Editar Pregunta";
  
  const formPregunta = document.getElementById("formPregunta");
  if (formPregunta) formPregunta.dataset.questionId = questionId;

  openModal("modalPregunta");
}

// Eliminar pregunta
async function deleteQuestion(questionId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) return;

  console.log('🗑️ Eliminando pregunta:', questionId);

  try {
    const response = await fetch(`${API_BASE}/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      console.log('✅ Pregunta eliminada');
      showNotification("Pregunta eliminada exitosamente", "success");
      await loadQuestions();
    } else {
      throw new Error("Error al eliminar pregunta");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Error al eliminar pregunta", "error");
  }
}

// Mostrar modal de invitación
function showInviteModal() {
  if (!currentCourse) {
    showNotification("Selecciona un curso primero", "error");
    return;
  }

  const codigoCursoInput = document.getElementById("codigoCurso");
  if (codigoCursoInput) {
    codigoCursoInput.value = currentCourse.codigoCurso;
  }
  
  openModal("modalInvitar");
}

// Copiar código
function copyCode() {
  const input = document.getElementById("codigoCurso");
  if (!input) return;
  
  input.select();
  document.execCommand("copy");
  showNotification("Código copiado al portapapeles", "success");
}

// Seleccionar curso
function selectCourse(courseId) {
  const cursoSelect = document.getElementById("cursoSelect");
  if (!cursoSelect) return;
  
  cursoSelect.value = courseId;
  cursoSelect.dispatchEvent(new Event("change"));

  // Cambiar a tab de analytics
  const analyticsTab = document.querySelector('.tab-btn[data-tab="analytics"]');
  if (analyticsTab) analyticsTab.click();
}

// Compartir curso
function shareCourse(courseId) {
  const course = courses.find((c) => c._id === courseId);
  if (course) {
    const codigoCursoInput = document.getElementById("codigoCurso");
    if (codigoCursoInput) {
      codigoCursoInput.value = course.codigoCurso;
    }
    openModal("modalInvitar");
  }
}

// Remover estudiante
async function removeStudent(studentId) {
  if (!confirm("¿Estás seguro de que quieres remover este estudiante del curso?")) return;

  try {
    const response = await fetch(`${API_BASE}/cursos/${currentCourse._id}/estudiante/${studentId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      showNotification("Estudiante removido del curso", "success");
      await loadCourses();
      await loadStudents();
    } else {
      throw new Error("Error al remover estudiante");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Error al remover estudiante", "error");
  }
}

// Ver historial de estudiante
function viewStudentHistory(studentId) {
  showNotification("Función de historial en desarrollo", "info");
}

// Funciones de modal
function openModal(modalId) {
  console.log('📂 Abriendo modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  console.log('📁 Cerrando modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";

    // Limpiar formularios
    const form = modal.querySelector("form");
    if (form) {
      form.reset();
      delete form.dataset.questionId;
    }

    // Resetear título de modal de pregunta
    if (modalId === "modalPregunta") {
      const tituloModal = document.getElementById("tituloModalPregunta");
      if (tituloModal) tituloModal.textContent = "Nueva Pregunta";
    }
  }
}

// Logout
function logout() {
  console.log('👋 Cerrando sesión...');
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "/";
}

// Mostrar notificación
function showNotification(message, type = "success") {
  console.log(`[${type.toUpperCase()}]`, message);
  
  const notification = document.getElementById("notification");
  const text = document.getElementById("notificationText");

  if (notification && text) {
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  } else {
    // Fallback si no existe el elemento de notificación
    alert(message);
  }
}

// Función debounce para búsqueda
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
