# 🎯 MathSpin - La Ruleta del Saber

<div align="center">

![MathSpin Banner](https://img.shields.io/badge/MathSpin-La%20Ruleta%20del%20Saber-purple?style=for-the-badge)
![Estado](https://img.shields.io/badge/Estado-En%20Línea-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

**Juego Educativo de Matemáticas para Estudiantes de Décimo Año EGB**

*Universidad Politécnica Salesiana - Proyecto TIC-InnovaEdu*

</div>

---

## 🎮 JUGAR AHORA

<div align="center">

### 🌐 **[ABRIR MATHSPIN](https://mathspin-production.up.railway.app/)**

**Link directo:** https://mathspin-production.up.railway.app/

[![Jugar Ahora](https://img.shields.io/badge/🎮-JUGAR%20AHORA-success?style=for-the-badge&labelColor=667eea)](https://mathspin-production.up.railway.app/)

</div>

> ⚠️ **IMPORTANTE:** Este repositorio GitHub contiene el código fuente. Para jugar, usa el link de arriba que abre la aplicación en Railway.

---

## 🎓 ¿Qué es MathSpin?

MathSpin es una aplicación educativa interactiva diseñada para ayudar a estudiantes de décimo año a reforzar sus habilidades matemáticas de forma divertida y dinámica mediante una ruleta de categorías, preguntas cronometradas y sistema de puntuación.

### ✨ Características Principales

- 🎡 **Ruleta Interactiva** - Selección aleatoria de categoría matemática con animaciones
- 📚 **6 Categorías** - Álgebra, Geometría, Trigonometría, Estadísticas, Números, Funciones
- 🎯 **3 Niveles de Dificultad** - Básico (10s), Medio (20s), Avanzado (30s)
- 👥 **Sistema Multi-Usuario** - Estudiantes, docentes y administradores
- 📊 **Analytics en Tiempo Real** - Estadísticas y seguimiento de rendimiento
- 🔌 **Integración Arduino** - Soporte opcional para controlador físico
- 🖼️ **Contenido Rico** - Soporte para imágenes y ecuaciones LaTeX
- ☁️ **100% Web** - No requiere instalación, funciona en navegador

---

## 🎮 Capturas de Pantalla

### Pantalla Principal
![Pantalla Principal](screenshots/pantalla-principal.png)
*Pantalla de bienvenida con acceso a registro e inicio de sesión*

### Inicio de Sesión
![Inicio de Sesión](screenshots/inicio-de-sesion.png)
*Formulario de autenticación para estudiantes y docentes*

### Ruleta de Categorías
![Ruleta](screenshots/ruleta-categorias.png)
*Ruleta interactiva con 6 categorías matemáticas y animaciones visuales*

### Panel del Docente
![Panel Docente](screenshots/panel-docente.png)
*Dashboard completo para gestión de cursos, preguntas y análisis de estudiantes*

---

## 🚀 Inicio Rápido

### Para Estudiantes

1. Ir a: **[mathspin-production.up.railway.app](https://mathspin-production.up.railway.app/)**
2. Click en **"Registrarse"**
3. Completar datos personales
4. Seleccionar **"Estudiante"** como tipo de usuario
5. Ingresar **código de curso** (proporcionado por tu docente)
6. ¡Girar la ruleta y empezar a jugar!

### Para Docentes

1. Ir a: **[mathspin-production.up.railway.app](https://mathspin-production.up.railway.app/)**
2. Registrarse como **"Docente"**
3. Acceder al **Panel del Docente**
4. **Crear un curso** → Se genera código automáticamente
5. **Agregar preguntas** en "Gestión de Preguntas"
6. Compartir código de curso con estudiantes
7. Monitorear progreso en **Analytics**

---

## 🏫 Instalación en Colegio

MathSpin **NO requiere instalación** de software en las computadoras. Es 100% web.

### ✅ Opción 1: Acceso Directo (Recomendado)

En cada PC del colegio:

1. **Click derecho** en el Escritorio → **Nuevo** → **Acceso directo**
2. **Ubicación:** `https://mathspin-production.up.railway.app/`
3. **Nombre:** `MathSpin - La Ruleta del Saber`
4. **Finalizar**

**Personalizar icono (opcional):**
- Click derecho → Propiedades → Cambiar icono
- Buscar: `C:\Windows\System32\imageres.dll`
- Seleccionar icono de calculadora (#109)

### ✅ Opción 2: Favoritos del Navegador

1. Abrir: https://mathspin-production.up.railway.app/
2. Presionar **Ctrl + D**
3. Guardar en **Barra de Favoritos**
4. Renombrar a: **"🎯 MathSpin"**

### ✅ Opción 3: Página de Inicio

**Chrome/Edge:**
- Configuración → Al iniciar → Abrir página específica
- Agregar: `https://mathspin-production.up.railway.app/`

📖 **Guía Completa de Instalación:** [INSTALACION-COLEGIO-WEB.md](INSTALACION-COLEGIO-WEB.md)

---

## 🛠️ Stack Tecnológico

### Backend
```
├── Node.js v18+          - Runtime JavaScript
├── Express.js v4.18      - Framework web
├── MongoDB Atlas         - Base de datos en la nube
├── Mongoose v8.0         - ODM para MongoDB
├── Socket.IO v4.6        - Comunicación en tiempo real
├── JWT v9.0              - Autenticación segura
├── bcrypt v5.1           - Hash de contraseñas
└── SerialPort v12.0      - Integración Arduino (opcional)
```

### Frontend
```
├── HTML5                 - Estructura
├── CSS3                  - Estilos modernos con variables
├── JavaScript ES6+       - Lógica de aplicación (Vanilla)
├── Particles.js          - Efectos visuales de fondo
├── Font Awesome 6        - Iconos
├── Google Fonts          - Tipografía Poppins
└── Socket.IO Client      - Conexión en tiempo real
```

### Deployment & Infrastructure
```
├── Railway               - Hosting de aplicación
├── MongoDB Atlas         - Base de datos cloud
├── GitHub                - Control de versiones
└── Git                   - Sistema de versiones
```

---

## 📖 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| 📘 [Resumen del Proyecto](docs/MathSpin-Resumen-Proyecto.md) | Visión general, arquitectura y características |
| 💻 [Documentación Frontend](docs/MathSpin-Documentacion-Frontend.md) | Estructura, componentes y flujos del cliente |
| 🏗️ [Análisis de Arquitectura](docs/MathSpin-Analisis-Arquitectura.md) | Arquitectura completa del sistema |
| 🚀 [Despliegue en Railway](docs/DESPLIEGUE-RAILWAY-PASO-A-PASO.md) | Guía paso a paso para deployment |
| 🏫 [Instalación en Colegio](docs/INSTALACION-COLEGIO-WEB.md) | Cómo instalar en múltiples PCs |
| 🔧 [Solución de Errores](docs/SOLUCION-ERROR-RAILWAY.md) | Troubleshooting común |

---

## 💻 Desarrollo Local

### Requisitos Previos

- Node.js 18 o superior
- Cuenta MongoDB Atlas (gratis)
- Git instalado
- Editor de código (VS Code recomendado)

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/Danna0327/mathspin.git
cd mathspin

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Editar .env con tus credenciales
# Necesitas:
# - MONGO_URI (de MongoDB Atlas)
# - JWT_SECRET (una clave secreta)
# - PORT (5000 por defecto)

# 5. Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en: `http://localhost:5000`

### Variables de Entorno Requeridas

```env
PORT=5000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/mathspin
JWT_SECRET=tu_clave_secreta_muy_segura
SERIAL_PORT=NONE
SERIAL_BAUD=9600
```

---

## 🌐 URLs del Proyecto

| Tipo | URL | Descripción |
|------|-----|-------------|
| 🎮 **Aplicación en Vivo** | [mathspin-production.up.railway.app](https://mathspin-production.up.railway.app/) | Aplicación funcionando - **JUGAR AQUÍ** |
| 📂 **Código Fuente** | [github.com/Danna0327/mathspin](https://github.com/Danna0327/mathspin) | Repositorio del proyecto |
| 📖 **Documentación** | [github.com/Danna0327/mathspin/tree/main/docs](https://github.com/Danna0327/mathspin/tree/main/docs) | Docs técnicas |
| 📊 **Railway Dashboard** | [railway.app](https://railway.app) | Panel de control deployment |

---

## 🎯 Categorías del Juego

El juego incluye 6 categorías matemáticas con códigos de color únicos:

| Categoría | Color | Temas Incluidos |
|-----------|-------|-----------------|
| 🔴 **Álgebra** | Rojo-Púrpura | Ecuaciones, expresiones, factorización |
| 🟠 **Trigonometría** | Naranja-Rosa | Funciones trigonométricas, identidades |
| 🟡 **Geometría** | Amarillo-Naranja | Figuras, áreas, volúmenes, teoremas |
| 🟢 **Estadísticas** | Verde-Turquesa | Probabilidad, medidas, gráficos |
| 🔵 **Números** | Azul-Púrpura | Operaciones, propiedades, conjuntos |
| 🟣 **Funciones** | Púrpura-Rosa | Dominio, rango, transformaciones |

Cada categoría tiene preguntas en 3 niveles:
- 🟢 **Básico** - 10 segundos por pregunta
- 🟡 **Medio** - 20 segundos por pregunta
- 🔴 **Avanzado** - 30 segundos por pregunta

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el proyecto
2. Crear rama feature: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -m 'Add: descripción del cambio'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abrir **Pull Request**

### Áreas donde Puedes Contribuir

- 🐛 Reportar y arreglar bugs
- ✨ Proponer nuevas características
- 📖 Mejorar documentación
- 🎨 Mejorar diseño UI/UX
- 🌍 Agregar traducciones
- ✅ Agregar pruebas unitarias
- 🔧 Optimizar rendimiento

---

## 📊 Roadmap

### ✅ Versión 1.0 (Actual - Febrero 2026)

- [x] Sistema de autenticación con JWT
- [x] Ruleta de categorías animada
- [x] Preguntas de múltiple opción
- [x] Panel de docente completo
- [x] Sistema de cursos con códigos
- [x] Estadísticas y analytics
- [x] Integración Arduino opcional
- [x] Responsive design
- [x] Despliegue en Railway
- [x] Base de datos MongoDB Atlas


---

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verificar que no esté ya reportado en [Issues](https://github.com/Danna0327/mathspin/issues)
2. Crear **nuevo issue** con:
   - ✅ Título descriptivo
   - ✅ Descripción clara del problema
   - ✅ Pasos para reproducir
   - ✅ Comportamiento esperado vs actual
   - ✅ Capturas de pantalla (si aplica)
   - ✅ Navegador y versión
   - ✅ Sistema operativo

**Ejemplo de buen reporte:**
```
Título: Error al girar ruleta en Firefox
Descripción: Al hacer clic en "Girar Ruleta" en Firefox 110, 
la animación no se reproduce correctamente.
Pasos: 1. Abrir en Firefox, 2. Login, 3. Click girar ruleta
Esperado: Animación suave de 3 segundos
Actual: Ruleta salta directamente al resultado
```

---

## 💡 Características Destacadas

### 🎡 Ruleta Interactiva

- Animación suave con CSS transforms
- 6 sectores de colores con gradientes
- Rotación aleatoria entre 1440° y 1800°
- Determinación matemática del ganador
- Efectos visuales y sonoros

### 📊 Analytics del Docente

- Estadísticas en tiempo real
- Gráficos de rendimiento por categoría
- Top estudiantes por puntuación
- Sesiones recientes detalladas
- Filtros por curso y fecha
- Exportación de datos

### 🔐 Seguridad

- Autenticación JWT
- Hash de contraseñas con bcrypt
- Rutas protegidas
- Validación de inputs
- CORS configurado
- Variables de entorno

### 🎯 Sistema de Puntuación

- 1 punto por respuesta correcta
- Penalización por timeout
- Porcentaje de éxito calculado
- Historial completo de sesiones
- Ranking por curso

---

## 📱 Compatibilidad

### Navegadores Soportados

| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome | 90+ | ✅ Completamente soportado |
| Edge | 90+ | ✅ Completamente soportado |
| Firefox | 88+ | ✅ Completamente soportado |
| Safari | 14+ | ✅ Completamente soportado |
| Opera | 76+ | ✅ Completamente soportado |

### Dispositivos

- 💻 **Desktop:** Windows, macOS, Linux
- 📱 **Mobile:** iOS, Android (responsive)
- 📱 **Tablets:** iPad, Android tablets
- 🖥️ **Resoluciones:** Desde 1024x768 hasta 4K

### Requisitos Técnicos

- ✅ Conexión a Internet (mínimo 2 Mbps)
- ✅ JavaScript habilitado
- ✅ Cookies habilitadas
- ❌ NO requiere instalación
- ❌ NO requiere plugins

---

## 🔧 Solución de Problemas Comunes

### "No carga la aplicación"

**Posibles causas:**
1. Sin conexión a internet → Verificar conectividad
2. Railway en mantenimiento → Esperar unos minutos
3. Caché del navegador → Presionar Ctrl + F5

### "No puedo registrarme"

**Verificar:**
- Nombre de usuario único (no existe ya)
- Contraseña mínimo 8 caracteres
- Código de curso correcto (si eres estudiante)
- Todos los campos completos

### "No aparecen preguntas"

**Causa:** El docente no ha agregado preguntas en esa categoría/dificultad

**Solución:** 
- Docente debe ir a Panel → Gestión de Preguntas
- Agregar al menos 5 preguntas por categoría

### "El temporizador no funciona"

**Solución:**
- Refrescar página (F5)
- Limpiar caché del navegador
- Probar en modo incógnito

---

## 📄 Licencia

**Todos los derechos reservados © 2026**

Uso permitido con fines educativos. Para otros usos, contactar a los autores.

---

## 👥 Equipo

### Desarrolladores

- **Danna** - [@Danna0327](https://github.com/Danna0327) - Desarrollo Full Stack

---

## 📞 Contacto y Soporte

### Enlaces Oficiales

- 🎮 **Aplicación:** https://mathspin-production.up.railway.app/
- 📂 **GitHub:** https://github.com/Danna0327/mathspin
- 🐛 **Issues:** https://github.com/Danna0327/mathspin/issues

---

## ⭐ Apoya el Proyecto

Si MathSpin te ha sido útil, considera:

- ⭐ **Dar estrella** al repositorio
- 🐛 **Reportar bugs** que encuentres
- 💡 **Sugerir mejoras** en Issues
- 📖 **Mejorar documentación**
- 🤝 **Compartir** con otros educadores
- 💬 **Dejar feedback** sobre tu experiencia

### Estadísticas del Proyecto

![GitHub Stars](https://img.shields.io/github/stars/Danna0327/mathspin?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Danna0327/mathspin?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Danna0327/mathspin)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Danna0327/mathspin)


---

<div align="center">

## 🎓 Hecho con ❤️ para la Educación


[![Aplicación](https://img.shields.io/badge/🎮-JUGAR%20AHORA-success?style=for-the-badge)](https://mathspin-production.up.railway.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Código%20Fuente-181717?style=for-the-badge&logo=github)](https://github.com/Danna0327/mathspin)
[![Documentación](https://img.shields.io/badge/📖-Documentación-blue?style=for-the-badge)](https://github.com/Danna0327/mathspin/tree/main/docs)

---

### 🌟 ¡Transforma el aprendizaje de matemáticas en una experiencia divertida!

[⬆ Volver arriba](#-mathspin---la-ruleta-del-saber)

</div>>
