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

</div>

> ⚠️ **IMPORTANTE:** Este repositorio GitHub contiene el código fuente. Para jugar, usa el link de arriba que abre la aplicación en Railway.

---

## 🎓 ¿Qué es MathSpin?

MathSpin es una aplicación educativa interactiva diseñada para ayudar a estudiantes de primaria a reforzar sus habilidades matemáticas de forma divertida y dinámica mediante retos, preguntas y sistema de puntuación.

### ✨ Características Principales

- 🎡 **Ruleta Interactiva** - Selección aleatoria de categoría matemática
- 📚 **6 Categorías** - Álgebra, Geometría, Trigonometría, Estadísticas, Números, Funciones
- 🎯 **3 Niveles de Dificultad** - Básico (10s), Medio (20s), Avanzado (30s)
- 👥 **Multi-Usuario** - Sistema de estudiantes, docentes y administradores
- 📊 **Seguimiento en Tiempo Real** - Estadísticas y análisis de rendimiento
- 🔌 **Integración Arduino** - Soporte para controlador físico (opcional)
- 🖼️ **Contenido Rico** - Imágenes y ecuaciones LaTeX

---

## 🚀 Inicio Rápido

### Para Estudiantes

1. Ir a: **https://mathspin-production.up.railway.app/**
2. Click en **"Registrarse"**
3. Completar datos y seleccionar **"Estudiante"**
4. Ingresar **código de curso** (proporcionado por tu docente)
5. ¡Girar la ruleta y jugar!

### Para Docentes

1. Ir a: **https://mathspin-production.up.railway.app/**
2. Registrarse como **"Docente"**
3. Crear un curso → Obtener código de curso
4. Agregar preguntas en **"Gestión de Preguntas"**
5. Compartir código con estudiantes

---

## 🏫 Instalación en Colegio

MathSpin **NO requiere instalación** en las computadoras. Solo necesitas:

### Opción 1: Acceso Directo (Recomendado)

En cada PC del colegio:
1. Click derecho en Escritorio → Nuevo → Acceso directo
2. Ubicación: `https://mathspin-production.up.railway.app/`
3. Nombre: `MathSpin`
4. ✅ ¡Listo!

### Opción 2: Favoritos del Navegador

1. Abrir: https://mathspin-production.up.railway.app/
2. Presionar **Ctrl + D**
3. Guardar en Barra de Favoritos

📖 **Guía Completa:** Ver [INSTALACION-COLEGIO-WEB.md](docs/INSTALACION-COLEGIO-WEB.md)

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** v18+ con Express.js
- **MongoDB Atlas** - Base de datos en la nube
- **Socket.IO** - Comunicación en tiempo real
- **JWT** - Autenticación segura
- **SerialPort** - Integración Arduino (opcional)

### Frontend
- **HTML5 / CSS3 / JavaScript** Vanilla
- **Particles.js** - Efectos visuales
- **Font Awesome** - Iconos
- **Google Fonts** - Tipografía Poppins

### Deployment
- **Railway** - Hosting de aplicación
- **MongoDB Atlas** - Base de datos cloud
- **GitHub** - Control de versiones

---

## 📖 Documentación

- 📘 [Resumen del Proyecto](docs/MathSpin-Resumen-Proyecto.md)
- 💻 [Documentación Frontend](docs/MathSpin-Documentacion-Frontend.md)
- 🏗️ [Análisis de Arquitectura](docs/MathSpin-Analisis-Arquitectura.md)
- 🚀 [Guía de Despliegue Railway](docs/DESPLIEGUE-RAILWAY-PASO-A-PASO.md)
- 🏫 [Instalación en Colegio](docs/INSTALACION-COLEGIO-WEB.md)

---

## 🎮 Capturas de Pantalla

### Pantalla Principal
![Pantalla Principal](https://via.placeholder.com/800x400/667eea/ffffff?text=MathSpin+-+Pantalla+Principal)

### Ruleta de Categorías
![Ruleta](https://via.placeholder.com/800x400/764ba2/ffffff?text=Ruleta+de+Categorías)

### Panel del Docente
![Panel Docente](https://via.placeholder.com/800x400/f093fb/ffffff?text=Panel+del+Docente)

---

## 💻 Desarrollo Local

### Requisitos
- Node.js 18+
- Cuenta MongoDB Atlas
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/Danna0327/mathspin.git
cd mathspin

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
npm start
```

La aplicación estará disponible en: `http://localhost:5000`

---

## 🌐 URLs del Proyecto

| Tipo | URL |
|------|-----|
| 🎮 **Aplicación en Vivo** | https://mathspin-production.up.railway.app/ |
| 📂 **Código Fuente** | https://github.com/Danna0327/mathspin |
| 📖 **Documentación** | https://github.com/Danna0327/mathspin/tree/main/docs |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crear rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Add: nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abrir Pull Request

---

## 📊 Roadmap

### ✅ Versión 1.0 (Actual)
- [x] Sistema de autenticación JWT
- [x] Ruleta de categorías interactiva
- [x] Preguntas de múltiple opción
- [x] Panel de docente completo
- [x] Estadísticas y analytics
- [x] Integración Arduino opcional
- [x] Despliegue en Railway

---

## 🐛 Reportar Problemas

Si encuentras un bug:
1. Verificar que no esté ya reportado en [Issues](https://github.com/Danna0327/mathspin/issues)
2. Crear nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Capturas de pantalla

---

## 📄 Licencia

Todos los derechos reservados © 2026


---

## ⭐ Apóyanos

Si MathSpin te ha sido útil:
- ⭐ Da una estrella al repositorio
- 🐛 Reporta bugs
- 💡 Sugiere nuevas características
- 📖 Mejora la documentación
- 🤝 Comparte con otros educadores

---

<div align="center">


[![Aplicación](https://img.shields.io/badge/🎮-Jugar%20Ahora-success?style=for-the-badge)](https://mathspin-production.up.railway.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Código%20Fuente-181717?style=for-the-badge&logo=github)](https://github.com/Danna0327/mathspin)

[⬆ Volver arriba](#-mathspin---la-ruleta-del-saber)

</div>
