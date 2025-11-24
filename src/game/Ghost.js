/**
 * Clase que representa un fantasma en el juego Pac-Man
 * @module Ghost
 */
export class Ghost {
    constructor(x, y, tileSize, color, name) {
        this.startX = x;
        this.startY = y;
        this.x = x * tileSize + tileSize / 2;
        this.y = y * tileSize + tileSize / 2;
        this.tileSize = tileSize;
        this.color = color;
        this.name = name;
        this.radius = tileSize * 0.4;
        this.speed = tileSize / 6;
        this.direction = this.getRandomDirection();
        this.isVulnerable = false;
        this.vulnerableTimer = 0;
    }

    /**
    * Obtiene una dirección aleatoria que evita quedar atrapado
    */
    getRandomDirection() {
        const directions = [
            { x: 1, y: 0 },   // Derecha
            { x: -1, y: 0 },  // Izquierda  
            { x: 0, y: 1 },   // Abajo
            { x: 0, y: -1 }   // Arriba
        ];
        
        // Si el fantasma está en la zona de spawn, fuerza la dirección de salida
        if (this.isInSpawnZone()) {
            return this.getSpawnExitDirection();
        }
        
        return directions[Math.floor(Math.random() * directions.length)];
    }

    /**
     * Verifica si el fantasma está en la zona de spawn inicial
     */
    isInSpawnZone() {
        const gridX = Math.floor(this.x / this.tileSize);
        const gridY = Math.floor(this.y / this.tileSize);
        
        // Zona del spawn de fantasmas (área rectangular)
        return gridY >= 13 && gridY <= 15 && gridX >= 10 && gridX <= 16;
    }


    /**
     * Obtiene dirección para salir del spawn
     */
    getSpawnExitDirection() {
        // Fuerza el movimiento hacia arriba para salir del spawn
        return { x: 0, y: -1 };
    }
    


    /**
     * Actualiza la posición del fantasma
     * @param {Array} map - Matriz del mapa
     * @param {Pacman} pacman - Referencia a Pac-Man
     */
    update(map, pacman) {

        // Comportamiento distinto si es vulnerable
        if (this.isVulnerable) {
            // Huye de Pac-Man en lugar de perseguirlo
            if (Math.random() < 0.1) {  // 10% de probabilidades de cambiar de dirección
                this.direction = this.getFleeDirection(pacman);
            }
        } else {
            // Comportamiento normal, de persecución aleatoria
            if (Math.random() < 0.02) { // 2% de oportunidad en cada frame
                this.direction = this.getRandomDirection();
            }
        }

        

        // Intenta mover en la dirección actual
        if (this.canMove(this.direction.x, this.direction.y, map)) {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
        } else {
            // Si no puede moverse, cambia la dirección
            this.direction = this.getRandomDirection();
        }

        const mapWidthPixel = map[0].length * this.tileSize;
        if (this.x < 0) this.x = mapWidthPixel;
        if (this.x > mapWidthPixel) this.x = 0;

        // Timer de vulnerabilidad
        if (this.isVulnerable) {
            this.vulnerableTimer--;
            if (this.vulnerableTimer <= 0) {
                this.isVulnerable = false;
            }
        }
    }

    /**
    * Obtiene dirección para huir de Pac-Man
    */
    getFleeDirection(pacman) {
        const directions = [
            { x: 1, y: 0},   // Derecha
            { x: -1, y: 0},  // Izquierda
            { x: 0, y: 1},   // Abajo
            { x: 0, y: -1}   // Arriba
        ];

        // Calcula la dirección opuesta a Pac-Man
        const dx = this.x - pacman.x;
        const dy = this.y - pacman.y;

        // Prefiere direcciones que se alejen de Pac-Man
        const scoredDirections = directions.map(dir => {
            let score = 0;
            if (Math.sign(dir.x) === Math.sign(dx)) score += 2;
            if (Math.sign(dir.y) === Math.sign(dy)) score += 2;
            return { direction: dir, score };
        });

        // Elige la dirección con mejor score
        scoredDirections.sort((a, b) => b.score - a.score);
        return scoredDirections[0].direction;
    }

    /**
     * Verifica si puede moverse en una dirección
     */
    canMove(dx, dy, map) {
        // Posición futura del centro del fantasma
        const nextX = this.x + dx * this.speed;
        const nextY = this.y + dy * this.speed;
        
        // Convierte las coordenadas
        const col = Math.floor(nextX / this.tileSize);
        const row = Math.floor(nextY / this.tileSize);
        
        // Verifica que esté dentro de los límites del mapa
        if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
            return false;
        }
        
        // Verifica que no sea una pared
        return map[row][col] !== 1;
    }

    /**
     * Dibuja el fantasma
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} offsetX 
     * @param {number} offsetY 
     */
    draw(ctx, offsetX, offsetY) {
        const drawX = offsetX + this.x;
        const drawY = offsetY + this.y;

        // Cuerpo del fantasma (parte redonda)
        ctx.fillStyle = this.isVulnerable ? '#0000FF' : this.color; // Azul si está vulnerable
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, Math.PI, 0, false); // Media luna superior
        ctx.lineTo(drawX + this.radius, drawY + this.radius);
        
        // Se crea el efecto de parte inferior del fantasma
        const legWidth = this.radius * 0.5;
        ctx.lineTo(drawX + legWidth, drawY + this.radius * 0.7);
        ctx.lineTo(drawX, drawY + this.radius);
        ctx.lineTo(drawX - legWidth, drawY + this.radius * 0.7);
        ctx.lineTo(drawX - this.radius, drawY + this.radius);
        
        ctx.closePath();
        ctx.fill();

        // Ojos
        const eyeOffsetX = this.radius * 0.3;
        const eyeOffsetY = this.radius * 0.3;
        const eyeRadius = this.radius * 0.2;

        ctx.fillStyle = 'white';
        
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(drawX - eyeOffsetX, drawY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(drawX + eyeOffsetX, drawY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Dirección de pupilas
        const pupilOffset = this.radius * 0.15;
        ctx.fillStyle = 'black';
        
        // Pupila izquierda
        ctx.beginPath();
        ctx.arc(
            drawX - eyeOffsetX + (this.direction.x * pupilOffset), 
            drawY - eyeOffsetY + (this.direction.y * pupilOffset), 
            eyeRadius * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Pupila derecha
        ctx.beginPath();
        ctx.arc(
            drawX + eyeOffsetX + (this.direction.x * pupilOffset), 
            drawY - eyeOffsetY + (this.direction.y * pupilOffset), 
            eyeRadius * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
    }

    /**
     * Hace al fantasma vulnerable por un tiempo
     * @param {number} duration - Duración en frames
     */
    makeVulnerable(duration) {
        this.isVulnerable = true;
        this.vulnerableTimer = duration;
    }

    /**
     * Reinicia el fantasma a su posición inicial
     */
    reset() {
        this.x = this.startX * this.tileSize + this.tileSize / 2;
        this.y = this.startY * this.tileSize + this.tileSize / 2;
        this.direction = this.getRandomDirection();
        this.isVulnerable = false;
        this.vulnerableTimer = 0;
    }
}