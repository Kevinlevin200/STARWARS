# 🌟 Star Wars Search Engine


## 📋 Descripción del Proyecto

Esta aplicación web frontend permite a los usuarios explorar el extenso universo de Star Wars de manera intuitiva y visualmente atractiva. Desarrollada como parte de un proyecto Full-Stack, consume la API de SWAPI para mostrar información detallada sobre personajes, planetas, películas, especies, vehículos y naves espaciales.

## ✨ Características Principales

### 🔍 Funcionalidades de Búsqueda
- **Búsqueda global**: Explora todas las categorías simultáneamente
- **Filtros por categoría**: Personajes, Planetas, Películas, Especies, Vehículos, Naves
- **Búsquedas rápidas**: Botones predefinidos para elementos populares
- **Búsqueda en tiempo real**: Resultados instantáneos mientras escribes
- **Paginación inteligente**: Navegación fluida entre múltiples páginas de resultados

### 🎨 Diseño y Experiencia de Usuario
- **Totalmente responsive**: Optimizado para móviles, tablets y desktop
- **Tema espacial**: Colores rosa con efectos de brillo y gradientes galácticos
- **Animaciones suaves**: Transiciones y efectos hover para una experiencia premium
- **Tipografía futurista**: Fuente Orbitron para ambiente sci-fi auténtico
- **Interfaz intuitiva**: Diseño centrado en el usuario con navegación clara

### 🛠 Tecnología y Rendimiento
- **Vanilla JavaScript**: Manipulación eficiente del DOM sin dependencias externas
- **Cache inteligente**: Optimización de consultas API para mejor rendimiento
- **Manejo de errores robusto**: Feedback claro para todos los estados de la aplicación
- **Código modular**: Arquitectura orientada a objetos para fácil mantenimiento

## 🚀 Instalación y Configuración

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para consumir la API

### Instalación Local
1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/star-wars-search-engine.git
   cd star-wars-search-engine
   ```

2. **Ejecuta el proyecto**:
   - Opción 1: Abre `index.html` directamente en tu navegador
   - Opción 2: Usa un servidor local:
     ```bash
     # Con Python
     python -m http.server 8000
     # Con Node.js (http-server)
     npx http-server
     # Con Live Server (VS Code)
     ```

3. **Accede a la aplicación**:
   - Navegador directo: `file:///ruta/al/proyecto/index.html`
   - Servidor local: `http://localhost:8000`

## 📖 Guía de Uso

### Búsqueda Básica
1. **Campo de búsqueda**: Escribe cualquier término relacionado con Star Wars
2. **Presiona Enter** o haz click en el botón "🔍 Buscar"
3. **Explora los resultados** en las tarjetas interactivas

### Búsqueda Avanzada
1. **Selecciona una categoría** del dropdown (opcional)
2. **Introduce tu término de búsqueda**
3. **Usa los filtros** para refinar resultados

### Búsquedas Rápidas
- **Luke Skywalker**: Personaje icónico
- **Tatooine**: Planeta desértico
- **Millennium Falcon**: Nave legendaria
- **A New Hope**: Primera película

### Navegación de Resultados
- **Click en tarjetas**: Ver información detallada en modal
- **Paginación**: Navega entre múltiples páginas
- **Scroll suave**: Retorno automático al inicio en cambio de página

## 🏗 Arquitectura del Proyecto

```
star-wars-search-engine/
│
├── index.html              # Estructura principal HTML
├── README.md              # Documentación del proyecto
├── styles/
│   └── embedded-styles    # Estilos CSS integrados
├── scripts/
│   └── embedded-js        # Lógica JavaScript integrada
└── assets/
    └── fonts/            # Fuentes personalizadas (Google Fonts)
```

### Componentes Principales

#### `StarWarsSearchEngine` (Clase Principal)
- **Constructor**: Inicialización de la aplicación
- **bindEvents()**: Vinculación de event listeners
- **performSearch()**: Lógica principal de búsqueda
- **fetchData()**: Comunicación con SWAPI API
- **displayResults()**: Renderizado de resultados
- **showModal()**: Sistema de modales detallados

#### Métodos de Utilidad
- **getCategoryIcon()**: Iconos temáticos por categoría
- **formatKey()**: Traducción de campos API
- **setupPagination()**: Sistema de paginación
- **cache**: Sistema de cache en memoria

## 🌐 API Utilizada

**SWAPI (Star Wars API)**: https://swapi.py4e.com

### Endpoints Consumidos
- `/people/` - Personajes
- `/planets/` - Planetas  
- `/films/` - Películas
- `/species/` - Especies
- `/vehicles/` - Vehículos
- `/starships/` - Naves espaciales

### Características de la Integración
- **Manejo de errores**: Respuestas HTTP y timeouts
- **Cache inteligente**: Evita consultas duplicadas
- **Búsqueda optimizada**: Parámetros de query eficientes
- **Paginación automática**: Manejo de resultados extensos


### Efectos Especiales
- **Glow Text**: Texto con brillo neón
- **Glow Border**: Bordes luminosos
- **Card Hover**: Efectos de elevación en tarjetas
- **Loading Spinner**: Animación de carga temática
- **Fade In**: Animaciones de entrada suaves

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Adaptaciones por Dispositivo
- **Mobile**: Layout vertical, botones táctiles, menús colapsibles
- **Tablet**: Grid de 2 columnas, navegación optimizada
- **Desktop**: Grid de 3 columnas, efectos hover completos


### Compatibilidad de Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Pruebas Realizadas
- **Funcionalidad**: Todas las búsquedas y filtros
- **Responsive**: Múltiples dispositivos y orientaciones
- **Performance**: Tiempo de carga y fluidez de animaciones
- **Accesibilidad**: Contraste de colores y navegación por teclado

## 🔧 Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Estilos avanzados con Grid y Flexbox
- **JavaScript ES6+**: Lógica de aplicación moderna
- **Tailwind CSS**: Framework de utilidades CSS

### APIs 
- **SWAPI**: Star Wars API oficial

### Herramientas de Desarrollo
- Vs code

## 👨‍💻 Autores

-Kevin Santiago Rivero Rueda
-Connie Tatiana Carrillo Bohorquez