/**
 * Motor del juego Pac-Man
 * @module GameEngine
 */

import { Pacman } from './Pacman.js';
import { Ghost } from './Ghost.js';

/**
 * Clase principal del motor del juego
 */
export class GameEngine {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
        this.config = config;
        this.isRunning = false;
        this.renderMode = canvas ? true : false; // false = evaluación rápida

        // Dimensiones del mapa
        this.mapWidth = 28;
        this.mapHeight = 31;
        this.scoreboardHeight = 35; // Espacio para el marcador
        this.tileSize = canvas ? Math.floor(Math.min(canvas.width / this.mapWidth, (canvas.height - this.scoreboardHeight) / this.mapHeight)) : 20;

        // Offset para centrar el mapa (con espacio para el marcador)
        this.offsetX = canvas ? (canvas.width - this.mapWidth * this.tileSize) / 2 : 0;
        this.offsetY = canvas ? this.scoreboardHeight + ((canvas.height - this.scoreboardHeight - this.mapHeight * this.tileSize) / 2) : 0;

        // Inicializar el mapa
        this.initializeMap();
        this.initializePellets();

        // Inicializar Pacman en la posición original (13.5, 23)
        this.pacman = new Pacman(13.5, 23, this.tileSize);

        // Inicializa a los fantasmas
        this.ghosts = this.initializeGhosts();

        // Estado del episodio
        this.score = 0;
        this.pelletsEaten = 0;
        this.steps = 0;
        this.isDead = false;
        this.maxSteps = 1000; // Límite de pasos por episodio

        // Sistema de una sola vida
        this.lives = 1;
        this.gameOver = false;

        // Configurar controles manuales para pruebas (solo si hay canvas)
        if (canvas) {
            this.setupControls();
        }

        console.log('Motor del juego inicializado (render:', this.renderMode, ')');
    }

    /**
     * Inicializa los pellets en el mapa
     */
    initializePellets() {
        this.pellets = [];
        this.powerPellets = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.pellets[y] = [];
            this.powerPellets[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                // Colocar pellet si es camino (0)
                this.pellets[y][x] = this.map[y][x] === 0 ? 1 : 0;
                this.powerPellets[y][x] = 0;
            }
        }

        // Coloca 4 power pellets en las esquinas
        const powerPelletPositions = [
            {x: 1, y: 3},   // Esquina superior izquierda
            {x: 26, y: 3},  // Esquina superior derecha
            {x: 1, y: 23},  // Esquina inferior izquierda
            {x: 26, y: 23}  // Esquina inferior derecha
        ];

        powerPelletPositions.forEach(pos => {
            if (this.map[pos.y] && this.map[pos.y][pos.x] == 0) {
                this.powerPellets[pos.y][pos.x] = 1;
                // Quita los pellet normales de esa posición
                this.pellets[pos.y][pos.x] = 0;
            }
        });

        this.totalPellets = this.pellets.flat().reduce((a, b) => a + b, 0);
        this.totalPowerPellets = this.powerPellets.flat().reduce((a,b) => a + b, 0);
    }

    /**
     * Inicializa el mapa del laberinto estilo Pac-Man clásico 1980
     * 1 = pared (negro), 0 = camino (azul)
     */
    initializeMap() {
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    /**
    * Inicializa los 4 fantasmas clásicos
    */
    initializeGhosts() {
        const ghosts = [];
        const ghostData = [
            { x: 13, y: 11, color: '#FF0000', name: 'Blinky' },  // Rojo
            { x: 13, y: 15, color: '#FFB8FF', name: 'Pinky' },   // Rosado
            { x: 13, y: 14, color: '#00FFFF', name: 'Inky' },    // Celeste
            { x: 13, y: 15, color: '#FFB852', name: 'Clyde' },   // Naranja
        ];

        ghostData.forEach(ghost => {
            ghosts.push(new Ghost(ghost.x, ghost.y, this.tileSize, ghost.color, ghost.name));
        });

        return ghosts;
    }

    /**
     * Inicia el juego
     */
    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    /**
     * Detiene el juego
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Bucle principal del juego
     */
    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.render();

        // Control de FPS
        setTimeout(() => {
            requestAnimationFrame(() => this.gameLoop());
        }, 1000 / this.config.fps);
    }

    /**
     * Reinicia el episodio para evaluación
     */
    resetEpisode() {
        this.pacman.reset();
        this.ghosts.forEach(ghost => ghost.reset());
        this.initializePellets();
        this.score = 0;
        this.pelletsEaten = 0;
        this.steps = 0;
        this.isDead = false;
        this.gameOver = false;
        this.lives = 1;
        this.lastPositions = [];
        this.lastAction = null;
        this.sameActionCount = 0;
        this.pelletsEatenStreak = 0;
        this.lastPelletsEaten = 0;
    }

    /**
     * Ejecuta un paso del juego con una acción específica
     * @param {string} action - 'UP', 'DOWN', 'LEFT', 'RIGHT', o 'STOP'
     * @returns {Object} - Información del paso: {reward, done, pelletsEaten, score}
     */
    step(action) {
        if (this.isDead || this.steps >= this.maxSteps) {
            return { reward: 0, done: true, pelletsEaten: this.pelletsEaten, score: this.score };
        }

        // Establece la dirección de Pac-Man
        if (action && action !== 'STOP') {
            this.pacman.setDirection(action);
        }

        // Actualizar Pacman
        this.pacman.update(this.map);

        // Actualiza a los fantasmas
        this.ghosts.forEach(ghost => {
            ghost.update(this.map, this.pacman);

            // Se reduce el timer de vulnerabilidad si están en ese estado
            if (ghost.isVulnerable && ghost.vulnerableTimer > 0) {
                ghost.vulnerableTimer--;
                if (ghost.vulnerableTimer <= 0) {
                    ghost.isVulnerable = false;
                }
            }
        });

        this.steps++;

        // === SISTEMA DE RECOMPENSAS MEJORADO ===
        let reward = 0;
        
        // 1. BONUS DE SUPERVIVENCIA (aumenta con el tiempo)
        const survivalBonus = 0.1 * (1 + this.steps / 1000);
        reward += survivalBonus;

        // Verificar si Pac-Man come pellet
        const gridX = Math.floor(this.pacman.x / this.tileSize);
        const gridY = Math.floor(this.pacman.y / this.tileSize);
        
        let atePelletThisStep = false;
        
        if (gridX >= 0 && gridX < this.mapWidth && gridY >= 0 && gridY < this.mapHeight) {
            // Verifica si come pellet normal
            if (this.pellets[gridY][gridX] === 1) {
                this.pellets[gridY][gridX] = 0;
                this.pelletsEaten++;
                this.score += 10;
                reward += 10; // Recompensa por comer pellet
                atePelletThisStep = true;
                this.pelletsEatenStreak++;
                
                // 2. COMBO BONUS: Recompensa extra por comer pellets consecutivos
                if (this.pelletsEatenStreak > 1) {
                    const comboBonus = Math.min(this.pelletsEatenStreak * 2, 20);
                    reward += comboBonus;
                }
            }

            // Verifica si come power pellet
            if (this.powerPellets[gridY][gridX] == 1) {
                this.powerPellets[gridY][gridX] = 0;
                this.score += 50;
                reward += 50;  // Gran recompensa por power pellet
                atePelletThisStep = true;

                // Hace a todos los fantasmas vulnerables
                this.ghosts.forEach(ghost => {
                    ghost.makeVulnerable(300);  // 300 frames , que son como 10 segundos
                });
            }
        }
        
        // Resetear streak si no comió pellet
        if (!atePelletThisStep) {
            this.pelletsEatenStreak = 0;
        }

        // 3. PENALIZACIÓN POR MOVIMIENTO REPETITIVO
        if (action === this.lastAction) {
            this.sameActionCount++;
            // Penalizar si hace la misma acción muchas veces sin comer pellets
            if (this.sameActionCount > 10 && this.pelletsEaten === this.lastPelletsEaten) {
                reward -= 0.5;
            }
        } else {
            this.sameActionCount = 0;
        }
        this.lastAction = action;
        this.lastPelletsEaten = this.pelletsEaten;

        // 4. PENALIZACIÓN POR ESTAR EN LOOP (misma posición visitada recientemente)
        const currentPos = `${gridX},${gridY}`;
        this.lastPositions.push(currentPos);
        if (this.lastPositions.length > 20) {
            this.lastPositions.shift();
            // Contar cuántas veces ha visitado esta posición recientemente
            const posCount = this.lastPositions.filter(pos => pos === currentPos).length;
            if (posCount > 5) {
                reward -= 2; // Penalización por estar atrapado en un loop
            }
        }

        // 5. PENALIZACIÓN POR ESTAR EN ESQUINAS CON PELIGRO
        const freeDirections = [
            this.pacman.canMove(0, -1, this.map),
            this.pacman.canMove(0, 1, this.map),
            this.pacman.canMove(-1, 0, this.map),
            this.pacman.canMove(1, 0, this.map)
        ].filter(d => d).length;
        
        if (freeDirections <= 2) {
            // Verificar si hay fantasmas cercanos
            const nearbyGhosts = this.ghosts.filter(ghost => {
                const gx = ghost.x / this.tileSize;
                const gy = ghost.y / this.tileSize;
                const dist = Math.sqrt(Math.pow(gridX - gx, 2) + Math.pow(gridY - gy, 2));
                return dist < 3 && !ghost.isVulnerable;
            });
            
            if (nearbyGhosts.length > 0) {
                reward -= 5; // Penalización por estar atrapado cerca de fantasmas
            }
        }

        // Verificar colisiones con fantasmas
        const collision = this.checkCollisions();
        if (collision) {
            this.isDead = true;
            reward = -100; // Penalización fuerte por morir
        }

        // 6. BONUS POR PROGRESO: Recompensa extra por comer porcentaje significativo
        const progressPercent = this.pelletsEaten / this.totalPellets;
        if (progressPercent > 0.25 && progressPercent <= 0.5) {
            reward += 10;
        } else if (progressPercent > 0.5 && progressPercent <= 0.75) {
            reward += 20;
        } else if (progressPercent > 0.75) {
            reward += 30;
        }

        const done = this.isDead || this.steps >= this.maxSteps || 
        (this.pelletsEaten === this.totalPellets && 
            this.powerPellets.flat().reduce((a, b) => a + b,0) === 0);

        return { 
            reward, 
            done, 
            pelletsEaten: this.pelletsEaten, 
            score: this.score,
            isDead: this.isDead
        };
    }

    /**
     * Obtiene las features observables del estado actual
     * @returns {Object} - Features para la política
     */
    getObservableState() {
        const pacX = this.pacman.x / this.tileSize;
        const pacY = this.pacman.y / this.tileSize;

        // Verificar direcciones bloqueadas
        const blockedUp = !this.pacman.canMove(0, -1, this.map);
        const blockedDown = !this.pacman.canMove(0, 1, this.map);
        const blockedLeft = !this.pacman.canMove(-1, 0, this.map);
        const blockedRight = !this.pacman.canMove(1, 0, this.map);

        // Encontrar fantasma más cercano
        let minGhostDist = Infinity;
        let closestGhost = null;
        this.ghosts.forEach(ghost => {
            const gx = ghost.x / this.tileSize;
            const gy = ghost.y / this.tileSize;
            const dist = Math.sqrt(Math.pow(pacX - gx, 2) + Math.pow(pacY - gy, 2));
            if (dist < minGhostDist) {
                minGhostDist = dist;
                closestGhost = ghost;
            }
        });

        const dxGhost = closestGhost ? (closestGhost.x / this.tileSize - pacX) : 0;
        const dyGhost = closestGhost ? (closestGhost.y / this.tileSize - pacY) : 0;
        const ghostIsVulnerable = closestGhost ? (closestGhost.isVulnerable ? 1 : 0) : 0;

        // Encontrar pellet más cercano
        let minPelletDist = Infinity;
        let dxPellet = 0;
        let dyPellet = 0;
        
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.pellets[y][x] === 1) {
                    const dist = Math.sqrt(Math.pow(pacX - x, 2) + Math.pow(pacY - y, 2));
                    if (dist < minPelletDist) {
                        minPelletDist = dist;
                        dxPellet = x - pacX;
                        dyPellet = y - pacY;
                    }
                }
            }
        }

        return {
            blockedUp: blockedUp ? 1 : 0,
            blockedDown: blockedDown ? 1 : 0,
            blockedLeft: blockedLeft ? 1 : 0,
            blockedRight: blockedRight ? 1 : 0,
            distGhost: minGhostDist,
            dxGhost,
            dyGhost,
            distPellet: minPelletDist === Infinity ? 0 : minPelletDist,
            dxPellet,
            dyPellet,
            ghostIsVulnerable
        };
    }

    /**
     * Actualiza el estado del juego
     */
    update() {

        // Actualizar Pacman
        this.pacman.update(this.map);

        // Actualiza a los fantasmas
        this.ghosts.forEach(ghost => {
            ghost.update(this.map, this.pacman);
        });

        const deadlyCollision = this.checkCollisions();
        if (deadlyCollision) {
            this.isDead = true;
            this.isRunning = false; // DETENER EL JUEGO
        }
    }

    /**
     * Verifica colisiones entre Pac-Man y fantasmas + pellets
     * @returns {boolean} - true si hay colisión mortal con fantasma
     */
    checkCollisions() {
        let deadly = false;
        
        // Verifica los pellets primero
        const gridX = Math.floor(this.pacman.x / this.tileSize);
        const gridY = Math.floor(this.pacman.y / this.tileSize);
        
        if (gridX >= 0 && gridX < this.mapWidth && gridY >= 0 && gridY < this.mapHeight) {
            // Verifica el pellet normal
            if (this.pellets[gridY][gridX] === 1) {
                this.pellets[gridY][gridX] = 0;
                this.pelletsEaten++;
                this.score += 10;
                if (this.renderMode) {
                    console.log(`¡Pellet comido! Score: ${this.score}`);
                }
            }
            
            // Verifica el power pellet
            if (this.powerPellets[gridY][gridX] === 1) {
                this.powerPellets[gridY][gridX] = 0;
                this.score += 50;
                if (this.renderMode) {
                    console.log('¡Power pellet comido! Fantasmas vulnerables');
                }
                
                // Hace a todos los fantasmas vulnerables
                this.ghosts.forEach(ghost => {
                    ghost.makeVulnerable(300);
                });
            }
        }
        
        // Verifica las colisiones con fantasmas
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) +
                Math.pow(this.pacman.y - ghost.y, 2)
            );

            const collisionDistance = this.pacman.radius + ghost.radius;

            if (distance < collisionDistance) {
                if (ghost.isVulnerable) {
                    // Pac-Man come al fantasma
                    if (this.renderMode) {
                        console.log(`¡Pac-man se comió a ${ghost.name}! +50 puntos`);
                    }
                    ghost.reset();
                    this.score += 50;
                } else {
                    // Fantasma atrapa a Pac-Man
                    if (this.renderMode) {
                        console.log(`¡${ghost.name} atrapó a Pac-Man!`);
                    }
                    deadly = true;
                }
            }
        });
        
        // Maneja la muerte si hay colision mortal
        if (deadly && !this.isDead && !this.gameOver) {
            this.handleDeath();
        }
        
        return deadly;
    }

    /**
     * Renderiza el juego en el canvas
     */
    render() {
        // Limpiar canvas con fondo negro
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar contador de puntos en la parte superior
        this.drawScoreBoard();

        // Dibujar el mapa
        this.drawMap();

        // Dibujar Pacman
        this.pacman.draw(this.ctx, this.offsetX, this.offsetY);

        // Dibuja a los Fantasmas
        this.ghosts.forEach(ghost => {
            ghost.draw(this.ctx, this.offsetX, this.offsetY);
        });
    }

    /**
     * Dibuja el marcador de puntos estilo Pac-Man original
     */
    drawScoreBoard() {
        // Fondo negro en la parte superior
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, 30);

        // Texto "SCORE" en blanco
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px "Courier New", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SCORE', 10, 24);

        // Puntuación actual en blanco
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 22px "Courier New", monospace';
        const scoreText = this.score.toString().padStart(5, '0');
        this.ctx.fillText(scoreText, 90, 24);

        // Texto "HIGH SCORE" en el centro
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HIGH SCORE', this.canvas.width / 2, 24);

        // High score (por ahora igual al score)
        this.ctx.font = 'bold 22px "Courier New", monospace';
        const highScoreText = Math.max(this.score, 0).toString().padStart(5, '0');
        this.ctx.fillText(highScoreText, this.canvas.width / 2 + 100, 24);

        // Vidas restantes (representadas con íconos de Pac-Man pequeños)
        this.ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < this.lives; i++) {
            const x = this.canvas.width - 40 - (i * 25);
            const y = 17;
            
            // Dibuja mini Pac-Man
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0.2 * Math.PI, 1.8 * Math.PI);
            this.ctx.lineTo(x, y);
            this.ctx.fill();
        }

        // Resetear alineación de texto
        this.ctx.textAlign = 'left';
    }

    /**
     * Dibuja el mapa del laberinto estilo Pac-Man clásico 1980
     */
    drawMap() {
        const wallThickness = 3; // Grosor de las paredes

        // Primero dibuja pellets en los caminos
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = this.map[y][x];
                const drawX = this.offsetX + x * this.tileSize;
                const drawY = this.offsetY + y * this.tileSize;

                if (tile === 0) {
                    // Verificar si el pellet normal existe
                    if (this.pellets && this.pellets[y] && this.pellets[y][x] === 1) {
                        this.ctx.fillStyle = '#ffb897';
                        this.ctx.beginPath();
                        this.ctx.arc(
                            drawX + this.tileSize / 2,
                            drawY + this.tileSize / 2,
                            2,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.fill();
                    }
                    
                    // Verifica si el power pellet existe  
                    if (this.powerPellets && this.powerPellets[y] && this.powerPellets[y][x] === 1) {
                        this.ctx.fillStyle = '#ff6b6b';
                        this.ctx.beginPath();
                        this.ctx.arc(
                            drawX + this.tileSize / 2,
                            drawY + this.tileSize / 2,
                            6,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.fill();
                    }
                }
            }
        }

        // Dibujar las paredes como líneas continuas
        this.ctx.strokeStyle = '#2121ff';
        this.ctx.lineWidth = wallThickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.map[y][x] === 1) {
                    const centerX = this.offsetX + x * this.tileSize + this.tileSize / 2;
                    const centerY = this.offsetY + y * this.tileSize + this.tileSize / 2;

                    // Verificar paredes adyacentes y dibujar líneas conectadas
                    const hasTop = y > 0 && this.map[y - 1][x] === 1;
                    const hasBottom = y < this.mapHeight - 1 && this.map[y + 1][x] === 1;
                    const hasLeft = x > 0 && this.map[y][x - 1] === 1;
                    const hasRight = x < this.mapWidth - 1 && this.map[y][x + 1] === 1;

                    this.ctx.beginPath();

                    // Dibujar líneas hacia las paredes adyacentes
                    if (hasTop) {
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX, centerY - this.tileSize / 2);
                    }
                    if (hasBottom) {
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX, centerY + this.tileSize / 2);
                    }
                    if (hasLeft) {
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX - this.tileSize / 2, centerY);
                    }
                    if (hasRight) {
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX + this.tileSize / 2, centerY);
                    }

                    // Si es una pared aislada, dibujar un punto
                    if (!hasTop && !hasBottom && !hasLeft && !hasRight) {
                        this.ctx.arc(centerX, centerY, wallThickness / 2, 0, Math.PI * 2);
                    }

                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Ejecuta un episodio del juego con un individuo específico
     * @param {Individual} individual - Individuo a evaluar
     * @returns {number} Fitness obtenido
     */
    runEpisode(individual) {
        // Implementar luego la evaluación de un individuo
        console.log('Ejecutando episodio para individuo');
        return Math.random() * 100; // Fitness temporal
    }

    /**
     * Configura controles de teclado para pruebas manuales
     */
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    e.preventDefault(); // Prevenir scroll del navegador
                    break;
            }

            switch (e.key) {
                case 'ArrowUp':
                    this.pacman.setDirection('UP');
                    break;
                case 'ArrowDown':
                    this.pacman.setDirection('DOWN');
                    break;
                case 'ArrowLeft':
                    this.pacman.setDirection('LEFT');
                    break;
                case 'ArrowRight':
                    this.pacman.setDirection('RIGHT');
                    break;
            }
        });
    }


    /**
     * Maneja la muerte de Pac-Man
     */
    handleDeath() {
        this.lives = 0;
        this.gameOver = true;
        this.isRunning = false;
        this.isDead = true;
        
        if (this.renderMode) {
            console.log('GAME OVER - Episodio terminado');
            
            // Esperar 2 segundos y luego reiniciar automáticamente
            setTimeout(() => {
                if (window.GA_Pacman_App) {
                    window.GA_Pacman_App.reset();
                }
            }, 2000);
        }
    }


}