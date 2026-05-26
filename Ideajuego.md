🛰️ Documento de Concepto Definitivo: Cuartos y Llaves

Mecánica Central del Juego (Loop Principal)
El juego será un top-down sencillo basado en cuartos. Cada cuadro o room funciona como un nivel independiente. En cada nivel aparecen varios enemigos slimes y el objetivo es derrotarlos a todos para que aparezca una llave. Cuando el jugador recoge la llave, puede abrir la puerta del cuarto y pasar al siguiente room.

Estructura del Progreso
Room 1 será el primer nivel del juego. Al completarlo, el jugador avanza al siguiente cuarto, donde la misma lógica se repite con otra distribución de enemigos. La idea es mantener el avance por niveles cortos, claros y rápidos de jugar.

Objetivo de Victoria y Derrota
Condición de Victoria: completar todos los rooms definidos.
Condición de Derrota: si la vida del jugador llega a cero, aparece Game Over y se puede reiniciar la partida.

👾 Enemigos
El enemigo principal será el slime, usando los diferentes PNG que ya tienen para mostrar sus acciones o estados. La idea es usar variantes visuales del slime para diferenciar movimiento, ataque o daño sin complicar la programación.

⚡ Reglas del Nivel
1. El jugador entra al room.
2. Aparecen los slimes del nivel.
3. El jugador elimina a todos los enemigos.
4. Se genera una llave.
5. El jugador recoge la llave y pasa al siguiente room.

💡 Recomendación técnica
Cada room puede manejarse como un mapa independiente, reutilizando la misma estructura base. Eso permite hacer más niveles sin cambiar la lógica principal, solo ajustando enemigos, posición de la llave y decoración.