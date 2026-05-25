# Plan de Acción y Tareas: Votaciones en Tiempo Real (Zustand + Firebase)

¡Hola! He actualizado el plan de acción para incorporar **Zustand** como manejador del estado global en lugar de React Context, tal como solicitaste. Esto nos dará un flujo de datos mucho más limpio, reactivo, de alto rendimiento y libre de envoltorios innecesarios (wrapper hell).

Este proyecto utiliza:

- **React + TypeScript + Vite** como base de desarrollo.
- **Firebase Auth** para el inicio de sesión con Google.
- **Firebase Firestore** para almacenar las votaciones y los votos en tiempo real de forma segura y eficiente.
- **Zustand** para la gestión reactiva del estado global (Autenticación y Sesión).
- **Tailwind CSS** para un diseño visual premium y responsivo.
- **Lucide React** para iconografía moderna y limpia.

---

## 🔒 Arquitectura de Seguridad (Privacidad de Resultados)

Para cumplir rigurosamente con el requisito de que **"los usuarios no pueden ver los resultados hasta después de votar"**, implementaremos un diseño de seguridad a nivel de base de datos en Firestore:

1. Las votaciones públicas están en `polls/{pollId}`. Cualquier usuario autenticado puede leerlas para ver el título y las opciones disponibles.
2. Cada voto se registra en una subcolección `polls/{pollId}/votes/{userId}`, donde el ID del documento es el propio ID del usuario. Esto garantiza que un usuario solo pueda votar una vez.
3. La subcolección de votos `polls/{pollId}/votes` solo podrá ser consultada por:
   - El **creador de la votación** (acceso ilimitado).
   - El **votante**, _únicamente si ya existe su propio documento de voto_. Esto se valida en tiempo real en las reglas de seguridad de Firestore mediante la cláusula `exists()`.
   - **Resultado:** Ningún usuario malintencionado o astuto podrá consultar las estadísticas de votación a través de llamadas de red a la base de datos hasta que haya emitido su voto.

---

## 📋 Lista de Tareas y Pasos a Seguir

Puedes usar este archivo como lista de verificación a medida que avancemos paso a paso.

### Fase 1: Configuración Inicial del Proyecto

- [x] Instalar dependencias esenciales (`firebase`, `zustand`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`).
- [x] Configurar e integrar Tailwind CSS v4 en `vite.config.ts` y en `src/index.css`.
- [x] Limpiar el boilerplate innecesario de Vite (`src/App.css` y estilos iniciales de `src/App.tsx`).

Crea el archivo .env y el de produccion para que la compilacion lea estos datos desde las variables de entorno.

### Fase 2: Infraestructura y Autenticación con Firebase y Zustand

- [x] Configurar el archivo inicial de Firebase (`src/firebase.ts`) usando variables de entorno seguras de Vite.
- [x] Desarrollar la tienda global de Zustand para autenticación (`src/store/useAuthStore.ts`) con Google Sign-In.
- [x] Diseñar la pantalla de Login con estética premium y moderna (fondo gradiente, Glassmorphism, y micro-animaciones).
- [x] Implementar el sistema de enrutamiento basado en hash (`window.location.hash`) en `src/App.tsx` para permitir compartir enlaces directos como `#/poll/ID`.

### Fase 3: Dashboard y Gestión de Votaciones

- [x] Desarrollar el panel de administración principal (`src/components/Dashboard.tsx`) con estadísticas visuales y filtros de estado (Todas, Activas, Terminadas).
- [x] Construir el modal dinámico de creación de votaciones (`src/components/CreatePollModal.tsx`) con un formulario interactivo para agregar/remover opciones de votación.
- [x] Implementar la funcionalidad de copiar enlaces de votación al portapapeles y notificar al usuario de manera visual.
- [x] Implementar la acción de cerrar votación (pasar estado a Terminada) en tiempo real para los creadores.

### Fase 4: Votación en Tiempo Real y Resultados

- [x] Crear la vista detallada de la votación (`src/components/PollDetail.tsx`).
- [x] Diseñar la interfaz de votación con tarjetas interactivas animadas y botón de confirmación.
- [x] Escribir la lógica de registro de voto en la subcolección `votes/{userId}` de manera atómica.
- [x] Programar la vista de resultados interactivos con barras de progreso fluidas y animación del porcentaje de votación.
- [x] Enlazar el estado para ocultar/mostrar resultados según el rol del usuario (creador o votante verificado que ya votó).

### Fase 5: Reglas de Seguridad en la Nube

- [x] Crear el archivo `firestore.rules` con las reglas de privacidad avanzadas basadas en el UID y el estado de la votación.
- [x] Documentar los pasos de configuración necesarios en la consola de Firebase (Auth, Firestore) para activar el proyecto.

### Fase 6: Pruebas y Despliegue a Producción

- [ ] Realizar pruebas de adaptabilidad responsive en pantallas móviles, tabletas y de escritorio.
- [ ] Comprobar el comportamiento en tiempo real simulando múltiples votantes simultáneos.
- [ ] Compilar el proyecto (`pnpm run build`) para verificar que TypeScript no tenga advertencias ni errores.
- [ ] Documentar las instrucciones de despliegue a producción usando Firebase Hosting o plataformas similares.

---

## 🚀 Siguientes Pasos

He actualizado todos los archivos del plan de implementación con Zustand. Estoy listo en modo planificación esperando a que me des luz verde para comenzar con la **Fase 1: Configuración Inicial del Proyecto**.

1. **¿Qué opinas sobre el diseño de seguridad propuesto?** Almacenar los votos con el ID del usuario en Firestore y bloquear el acceso a los resultados hasta que vote es el estándar de seguridad más premium posible.
2. **¿Prefieres que la app tenga una estética oscura fija (más premium) o que implementemos un botón de cambio modo claro/oscuro?**
3. **¿Tienes a mano tus credenciales de Firebase**, o deseas que te ayude a crear un proyecto paso a paso desde la consola de Firebase antes de empezar a programar?
