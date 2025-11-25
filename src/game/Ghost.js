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
        this.lastDirectionChange = 0;
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
        
        // Si el fantasma está en la zona de spawn, fuerza la dirección de salida (ARRIBA)
        if (this.isInSpawnZone()) {
            return { x: 0, y: -1 }; // Siempre arriba para salir del spawn
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
     * Actualiza la posición del fantasma
     * @param {Array} map - Matriz del mapa
     * @param {Pacman} pacman - Referencia a Pac-Man
     */
    update(map, pacman) {
        this.lastDirectionChange++;

        // FORZAR SALIDA DEL SPAWN - PRIORIDAD MÁXIMA
        if (this.isInSpawnZone()) {
            // Mientras esté en spawn, solo moverse hacia ARRIBA
            if (this.canMove(0, -1, map)) {
                this.direction = { x: 0, y: -1 };
            }
            // Mover en la dirección actual (arriba)
            if (this.canMove(this.direction.x, this.direction.y, map)) {
                this.x += this.direction.x * this.speed;
                this.y += this.direction.y * this.speed;
            }
            return; // No hacer nada más hasta salir del spawn
        }

        // Comportamiento normal FUERA del spawn
        if (this.isVulnerable) {
            // Huye de Pac-Man
            if (this.lastDirectionChange > 10 && Math.random() < 0.3) {  
                this.direction = this.getFleeDirection(pacman, map);
                this.lastDirectionChange = 0;
            }
        } else {
            // Persecución inteligente
            if (this.lastDirectionChange > 15) {
                if (Math.random() < 0.7) {
                    this.direction = this.getChaseDirection(pacman, map);
                } else {
                    this.direction = this.getRandomDirection();
                }
                this.lastDirectionChange = 0;
            }
        }

        // Movimiento normal
        if (this.canMove(this.direction.x, this.direction.y, map)) {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
        } else {
            this.direction = this.getRandomDirection();
            this.lastDirectionChange = 0;
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
     * Persecución inteligente hacia Pac-Man
     */
    getChaseDirection(pacman, map) {
        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
        ];

        // Calcula la dirección hacia Pac-Man
        const dx = pacman.x - this.x;
        const dy = pacman.y - this.y;
        const distanceToPacman = Math.sqrt(dx * dx + dy * dy);

        // Prefiere direcciones que acerquen a Pac-Man
        const scoredDirections = directions.map(dir => {
            if (!this.canMove(dir.x, dir.y, map)) {
                return { direction: dir, score: -1000 };
            }

            let score = 0;
            
            // Comportamientos específicos por Fantasma
            switch(this.name) {
                case 'Blinky': // Rojo
                    // Siempre persigue directamente
                    const dotProduct = dir.x * dx + dir.y * dy;
                    if (dotProduct > 0) score += 25;
                    // Más agresivo cuando está cerca
                    if (distanceToPacman < 150) score += 15;
                    break;
                    
                case 'Pinky': // Rosado
                    // Predice posición futura de Pac-Man, 4 celdas adelante
                    const predictX = pacman.x + pacman.direction.x * this.tileSize * 4;
                    const predictY = pacman.y + pacman.direction.y * this.tileSize * 4;
                    const predictDx = predictX - this.x;
                    const predictDy = predictY - this.y;
                    
                    const predictDot = dir.x * predictDx + dir.y * predictDy;
                    if (predictDot > 0) score += 20;
                    break;
                    
                case 'Inky': // Celeste
                    // Combinación de persecución y aleatoriedad
                    const baseDot = dir.x * dx + dir.y * dy;
                    if (baseDot > 0) score += 15;
                    // Componente aleatorio
                    score += Math.random() * 10;
                    // A veces se comporta como Blinky
                    if (Math.random() < 0.3) {
                        if (baseDot > 0) score += 10;
                    }
                    break;
                    
                case 'Clyde': // Naranja
                    // Huye cuando está cerca, persigue cuando está lejos
                    if (distanceToPacman < 120) {
                        // Huye de Pac-Man
                        const fleeDot = dir.x * -dx + dir.y * -dy;
                        if (fleeDot > 0) score += 20;
                    } else {
                        // Persigue normalmente
                        const chaseDot = dir.x * dx + dir.y * dy;
                        if (chaseDot > 0) score += 18;
                    }
                    break;
            }
            
            // Prefiere continuar en misma dirección
            if (dir.x === this.direction.x && dir.y === this.direction.y) {
                score += 8;
            }
            
            // Evita cambios bruscos de dirección
            const isOpposite = 
                (dir.x === -this.direction.x && dir.y === -this.direction.y) ||
                (dir.x === this.direction.x && dir.y === -this.direction.y) ||
                (dir.x === -this.direction.x && dir.y === this.direction.y);
                
            if (isOpposite) {
                score -= 5; // Penaliza dirección opuesta
            }

            return { direction: dir, score };
        });

        // Elige dirección con mejor score
        scoredDirections.sort((a, b) => b.score - a.score);
        return scoredDirections[0].score > -1000 ? scoredDirections[0].direction : this.getRandomDirection();
    }


    /**
     * Obtiene dirección para huir de Pac-Man
     */
    getFleeDirection(pacman, map) {
        const directions = [
            { x: 1, y: 0}, { x: -1, y: 0}, { x: 0, y: 1}, { x: 0, y: -1}
        ];

        // Calcula la dirección opuesta a Pac-Man
        const dx = this.x - pacman.x;
        const dy = this.y - pacman.y;
        const distanceToPacman = Math.sqrt(dx * dx + dy * dy);

        // Prefiere direcciones que se alejen de Pac-Man
        const scoredDirections = directions.map(dir => {
            if (!this.canMove(dir.x, dir.y, map)) {
                return { direction: dir, score: -1000 };
            }

            let score = 0;
            
            // Comportamientos diferenciados al huir
            switch(this.name) {
                case 'Blinky': // El rojo huye erraticamente
                    if (Math.sign(dir.x) === Math.sign(dx)) score += 12;
                    if (Math.sign(dir.y) === Math.sign(dy)) score += 12;
                    // Movimiento más errático
                    score += Math.random() * 8;
                    break;
                    
                case 'Pinky': // El rosado huye hacia esquinas
                    if (Math.sign(dir.x) === Math.sign(dx)) score += 10;
                    if (Math.sign(dir.y) === Math.sign(dy)) score += 10;
                    // Prefiere esquinas
                    if ((dir.x !== 0 && dir.y !== 0)) score += 5;
                    break;
                    
                case 'Inky': // El celeste huye de manera impredecible
                    score += Math.random() * 15;
                    if (Math.sign(dir.x) === Math.sign(dx)) score += 8;
                    if (Math.sign(dir.y) === Math.sign(dy)) score += 8;
                    break;
                    
                case 'Clyde': // El naranja huye consistentemente
                    if (Math.sign(dir.x) === Math.sign(dx)) score += 15;
                    if (Math.sign(dir.y) === Math.sign(dy)) score += 15;
                    break;
            }
            
            // Prefiere continuar en misma dirección
            if (dir.x === this.direction.x && dir.y === this.direction.y) {
                score += 6;
            }
            
            return { direction: dir, score };
        });

        // Elige la dirección con mejor score
        scoredDirections.sort((a, b) => b.score - a.score);
        return scoredDirections[0].score > -1000 ? scoredDirections[0].direction : this.getRandomDirection();
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

        // Cuerpo del fantasma, parte redonda
        ctx.fillStyle = this.isVulnerable ? '#0000FF' : this.color;
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, Math.PI, 0, false);
        ctx.lineTo(drawX + this.radius, drawY + this.radius);
        
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

        // Pupilas
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
        this.lastDirectionChange = 0;
    }
}