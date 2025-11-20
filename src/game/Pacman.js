/**
 * Clase que representa al Pac-Man
 * @module Pacman
 */
export class Pacman {
    constructor(x, y, tileSize) {
        this.startX = x;
        this.startY = y;
        this.tileSize = tileSize;

        this.x = x * tileSize + tileSize / 2;
        this.y = y * tileSize + tileSize / 2;
        this.radius = tileSize * 0.4;
        this.speed = tileSize / 5; // Velocidad relativa al tamaño de la celda

        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.currentDirName = 'STOP'; // UP, DOWN, LEFT, RIGHT, STOP
    }

    /**
     * Actualiza la posición del Pac-Man
     * @param {Array} map - Matriz del mapa
     */
    update(map) {
        // Intentar cambiar a la dirección deseada si es posible
        if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
            if (this.canMove(this.nextDirection.x, this.nextDirection.y, map)) {
                this.direction = { ...this.nextDirection };
                this.nextDirection = { x: 0, y: 0 };
            }
        }

        // Moverse en la dirección actual si es posible
        if (this.canMove(this.direction.x, this.direction.y, map)) {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
        } else {
            // Si chocamos, nos detenemos y alineamos al centro de la celda
            // Esto ayuda a corregir pequeños desalineamientos
            // this.alignToGrid(); 
            // (Simplificación: por ahora solo detenemos)
            // this.direction = { x: 0, y: 0 };
        }

        // Wrap around (túnel)
        const mapWidthPixel = map[0].length * this.tileSize;
        if (this.x < 0) this.x = mapWidthPixel;
        if (this.x > mapWidthPixel) this.x = 0;
    }

    /**
     * Verifica si es posible moverse en una dirección
     */
    canMove(dx, dy, map) {
        // Calcular la posición futura del centro
        const nextX = this.x + dx * this.speed;
        const nextY = this.y + dy * this.speed;

        // Verificar colisiones con las esquinas del cuadrado que encierra al círculo
        // Esto es un poco más permisivo que verificar el círculo exacto
        const margin = 2; // Margen para evitar pegarse demasiado
        const size = this.tileSize;

        // Puntos a verificar (esquinas del bounding box del pacman)
        // Usamos coordenadas de grilla
        const col1 = Math.floor((nextX - this.radius + margin) / size);
        const col2 = Math.floor((nextX + this.radius - margin) / size);
        const row1 = Math.floor((nextY - this.radius + margin) / size);
        const row2 = Math.floor((nextY + this.radius - margin) / size);

        // Verificar límites del array
        if (row1 < 0 || row2 >= map.length) {
            return false;
        }

        // Manejo del túnel (wrap-around)
        // Si estamos saliendo por los lados (col < 0 o col >= width)
        if (col1 < 0 || col2 >= map[0].length) {
            // Permitir solo si estamos en la fila del túnel (fila 14)
            // Verificamos que ambas filas (top y bottom del pacman) estén en la fila 14
            if (row1 === 14 && row2 === 14) {
                return true;
            }
            return false;
        }

        // Si alguna de las celdas ocupadas es una pared (1), hay colisión
        if (map[row1][col1] === 1 || map[row1][col2] === 1 ||
            map[row2][col1] === 1 || map[row2][col2] === 1) {
            return false;
        }

        return true;
    }

    /**
     * Dibuja al Pac-Man
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} offsetX - Desplazamiento X del mapa
     * @param {number} offsetY - Desplazamiento Y del mapa
     */
    draw(ctx, offsetX, offsetY) {
        ctx.fillStyle = '#FFFF00';

        // Calcular ángulo de rotación
        let angle = 0;
        if (this.direction.x === -1) angle = Math.PI;
        if (this.direction.y === -1) angle = -Math.PI / 2;
        if (this.direction.y === 1) angle = Math.PI / 2;

        // Guardar el contexto actual
        ctx.save();

        // Trasladar al centro del Pacman
        const centerX = offsetX + this.x;
        const centerY = offsetY + this.y;
        ctx.translate(centerX, centerY);

        // Rotar
        ctx.rotate(angle);

        // Dibujar Pacman (centrado en 0,0 relativo)
        ctx.beginPath();
        ctx.arc(
            0,
            0,
            this.radius,
            0.2 * Math.PI,
            1.8 * Math.PI
        );
        ctx.lineTo(0, 0);
        ctx.fill();

        // Restaurar el contexto
        ctx.restore();
    }

    /**
     * Establece la siguiente dirección de movimiento
     * @param {string} dir - 'UP', 'DOWN', 'LEFT', 'RIGHT'
     */
    setDirection(dir) {
        switch (dir) {
            case 'UP': this.nextDirection = { x: 0, y: -1 }; break;
            case 'DOWN': this.nextDirection = { x: 0, y: 1 }; break;
            case 'LEFT': this.nextDirection = { x: -1, y: 0 }; break;
            case 'RIGHT': this.nextDirection = { x: 1, y: 0 }; break;
        }
    }

    reset() {
        this.x = this.startX * this.tileSize + this.tileSize / 2;
        this.y = this.startY * this.tileSize + this.tileSize / 2;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
    }
}
