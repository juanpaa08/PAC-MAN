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
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.isRunning = false;

        // Dimensiones del mapa
        this.mapWidth = 28;
        this.mapHeight = 31;
        this.tileSize = Math.floor(Math.min(canvas.width / this.mapWidth, canvas.height / this.mapHeight));

        // Offset para centrar el mapa
        this.offsetX = (canvas.width - this.mapWidth * this.tileSize) / 2;
        this.offsetY = (canvas.height - this.mapHeight * this.tileSize) / 2;

        // Inicializar el mapa
        this.initializeMap();

        // Inicializar Pacman en la posición original (13.5, 23)
        this.pacman = new Pacman(13.5, 23, this.tileSize);

        // Inicializa a los fantasmas
        this.ghosts = this.initializeGhosts();

        // Configurar controles manuales para pruebas
        this.setupControls();

        console.log('Motor del juego inicializado');
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
     * Actualiza el estado del juego
     */
    update() {

        // Actualizar Pacman
        this.pacman.update(this.map);

        // Actualiza a los fantasmas
        this.ghosts.forEach(ghost => {
            ghost.update(this.map, this.pacman);
        });

        this.checkCollisions();
    }


    /**
    * Verifica colisiones entre Pac-Man y los fantasmas
    */
   checkCollisions() {
    this.ghosts.forEach(ghost => {
        const distance = Math.sqrt(
            Math.pow(this.pacman.x - ghost.x, 2) +
            Math.pow(this.pacman.y - ghost.y, 2)
        );

        const collisionDistance = this.pacman.radius + ghost.radius;

        if(distance < collisionDistance) {
            if (ghost.isVulnerable) {
                // Si Pac-Man se come al fantasma
                console.log(`¡Pac-man se comió a ${ghost.name}!`);
                ghost.reset();
            } else {
                // Fantasma atrapa a Pac-Man
                console.log(`¡${ghost.name} atrapó a Pac-Man`);
                this.pacman.reset();
            }
        }
    });
   }

    /**
     * Renderiza el juego en el canvas
     */
    render() {
        // Limpiar canvas con fondo negro
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
     * Dibuja el mapa del laberinto estilo Pac-Man clásico 1980
     */
    drawMap() {
        const wallThickness = 3; // Grosor de las paredes

        // Primero dibujar pellets en los caminos
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = this.map[y][x];
                const drawX = this.offsetX + x * this.tileSize;
                const drawY = this.offsetY + y * this.tileSize;

                if (tile === 0) {
                    // Pellets pequeños en los caminos
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
}