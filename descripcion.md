 
INGENIERÍA EN SOFTWARE
Aplicaciones Web
Proyecto Final de Primer Bimestre
Desarrollo de Videojuegos con Phaser.js

Tema: Videojuego top-down por rooms, donde cada cuarto es un nivel y el jugador debe derrotar a todos los slimes para conseguir una llave y avanzar al siguiente room.

Asignatura	Aplicaciones Web
Nivel	Proyecto final de primer bimestre
Tecnología central	Phaser.js + JavaScript
Autor	Jaime Sayago-Heredia
1. Tema del Proyecto
Desarrollar un videojuego original utilizando Phaser.js y tecnologías web modernas, inspirado en los ejercicios y conceptos revisados durante el curso.
El proyecto implementará un sistema simple de niveles por habitaciones, combate contra enemigos, desbloqueo de puertas mediante llaves y progresión por rooms.
2. Objetivos del Proyecto
El estudiante deberá demostrar competencias en:
•	Desarrollo de videojuegos 2D utilizando Phaser.js.
•	Arquitectura modular en aplicaciones web interactivas.
•	Manejo del game loop y escenas.
•	Implementación de físicas y colisiones.
•	Gestión de assets multimedia.
•	Diseño de interfaces HUD/UI.
•	Persistencia de datos.
•	Optimización y rendimiento.
•	Programación orientada a objetos aplicada a videojuegos.
•	Integración de controles táctiles y teclado.
3. Arquetipos de Juego
Cada grupo o estudiante deberá elegir uno de los siguientes arquetipos para construir su videojuego.
Arquetipo	Ejemplos de referencia	Características esperadas	Requisitos específicos
Arcade Shooter	Space Invaders, Galaga, Geometry Wars	Movimiento rápido, disparos, enemigos, power-ups, sistema de vidas.	Disparos, oleadas, power-ups y sistema de vidas.
Top-Down Adventure / RTS Lite	Zelda clásico, Age of Empires Lite, Survivors-like	Movimiento libre, IA básica, recolección, pathfinding simple, oleadas.	IA básica, enemigos dinámicos, recolección y minimapa opcional.
Puzzle Physics 2D	Angry Birds, Cut The Rope, Portal Lite	Física, resolución de puzzles, interacciones dinámicas y objetos físicos.	Objetos manipulables, interacción física y resolución progresiva.
Plataforma 2D	Mario Bros, Celeste, Hollow Knight Lite	Saltos, plataformas, colisiones, scroll lateral y enemigos.	Plataformas, saltos, scroll lateral y checkpoints.
4. Requisitos Técnicos Obligatorios
4.1 Arquitectura Phaser
•	Escenas Phaser.
•	Loader de assets.
•	Sistema de estados.
•	Menú principal.
•	Pausa.
•	Pantalla Game Over.
•	Reinicio del juego.
4.2 Estructura Profesional del Proyecto
La estructura mínima sugerida es la siguiente:
src/
│
├── scenes/
├── objects/
├── ui/
├── managers/
├── assets/
├── physics/
├── audio/
└── main.js
4.3 Mecánicas Obligatorias
•	Movimiento.
•	Colisiones.
•	Sistema de puntaje.
•	HUD.
•	Enemigos o retos.
•	Condición de victoria.
•	Condición de derrota.
•	Persistencia de progreso.
4.4 Física y Colisiones
•	Arcade Physics de Phaser.
•	Detección de colisiones.
•	Triggers.
•	Overlaps.
•	Rebotes o gravedad según el tipo de juego.
4.5 Audio
•	Música de fondo.
•	Mínimo dos efectos de sonido.
•	Botón de mute.
4.6 Persistencia
El proyecto debe utilizar localStorage para guardar:
•	High Score.
•	Nivel alcanzado.
•	Configuración de audio.
4.7 Responsive Design y Controles
El juego debe funcionar correctamente en escritorio, tablets y resoluciones móviles.
•	Desktop: teclado y mouse opcional.
•	Mobile: controles táctiles equivalentes.
4.8 Rendimiento
•	Mínimo 45 FPS.
•	Sin congelamientos durante la ejecución.
•	Carga eficiente de assets.
4.9 Accesibilidad Mínima
•	Contraste adecuado.
•	Instrucciones visibles.
•	Controles documentados.
•	Opción mute.
5. Requisitos Académicos
5.1 Programación
•	Modularidad.
•	Reutilización.
•	Separación de responsabilidades.
•	Buenas prácticas de desarrollo.
5.2 Código
•	Comentarios explicativos.
•	Nombres descriptivos.
•	Organización clara.
•	Uso adecuado de funciones, clases o módulos.
6. Entregables
Entregable	Descripción	Criterio de aceptación
Repositorio GitHub	Código fuente completo e historial de commits.	Repositorio accesible y organizado.
Proyecto comprimido	ZIP ejecutable del proyecto.	Debe poder ejecutarse localmente.
Video demo	Video de 45 a 90 segundos.	Debe mostrar gameplay, menús, audio y funcionalidades.
Capturas	Entre 4 y 6 imágenes del juego.	Deben evidenciar pantallas, niveles y mecánicas.
README.md	Guía de ejecución, controles, estructura y créditos.	Debe ser claro y completo.
Autoevaluación	Rúbrica completada por el estudiante.	Debe justificar fortalezas, limitaciones y mejoras futuras.
7. Tecnologías Permitidas
7.1 Obligatorias
•	Phaser.js.
•	JavaScript.
7.2 Recomendadas
•	Vite.
•	Visual Studio Code.
•	Git.
8. Assets Gratuitos Recomendados
•	Sprites: https://kenney.nl/assets
•	Audio: https://opengameart.org
•	Música: https://pixabay.com/music/
9. Rúbrica de Evaluación
Criterio	Porcentaje	Descripción de evaluación
Funcionalidad principal	20%	El juego funciona, cumple su propósito y permite jugar de inicio a fin.
Mecánicas de juego	15%	Implementa mecánicas coherentes con el arquetipo elegido.
Física y colisiones	10%	Usa adecuadamente Arcade Physics, overlaps, colisiones o gravedad.
Arquitectura y modularidad	15%	Organiza el código por escenas, objetos, UI y managers.
Rendimiento y optimización	10%	Mantiene al menos 45 FPS y evita bloqueos por carga.
UX/UI y experiencia de usuario	10%	Menús, HUD, navegación, pausa y game over son claros.
Audio e inmersión	5%	Incluye música, efectos y control de mute.
Responsividad y controles táctiles	5%	Funciona en escritorio y móvil con controles equivalentes.
Código limpio y documentación	5%	Código legible, comentado y con nombres descriptivos.
README, video y presentación	5%	Entrega documentación, capturas y demo adecuados.
10. Bonus
El estudiante podrá obtener hasta +10% adicional si implementa una o más funcionalidades avanzadas.
•	Multiplayer simple.
•	Leaderboard online.
•	PWA instalable.
•	IA avanzada.
•	Generación procedural.
•	Shader effects.
•	Minimap.
•	Boss final.
•	Sistema de inventario.
•	Guardado múltiple.
•	Arquitectura ECS.
•	Integración con API externa.
11. Restricciones
•	No usar templates completos descargados.
•	No reutilizar proyectos completos de internet.
•	No entregar proyectos incompletos.
•	No usar IA para generar el proyecto completo sin comprensión técnica.
12. Recomendaciones Técnicas
12.1 Arquitectura sugerida
Scene Manager
↓
Game Objects
↓
Physics
↓
UI/HUD
↓
Audio Manager
↓
Storage Manager
13. Competencias Evaluadas
•	Desarrollo Web.
•	Programación JavaScript.
•	Arquitectura de Software.
•	Interactividad.
•	Diseño de videojuegos.
•	Optimización.
•	UX/UI.
•	Programación orientada a objetos.
14. Fecha de Entrega
26 DE MAYO DE 2026
15. Observación Importante
El proyecto debe demostrar autoría, creatividad y comprensión técnica del framework Phaser.js y de las arquitecturas de aplicaciones web interactivas.
16. Realizado por
Jaime Sayago-Heredia
Docente — Aplicaciones Web
Escuela Politécnica Nacional (EPN)

