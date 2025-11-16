/**
 * Motor del juego Pac-Man
 * @module GameEngine
 */

/**
 * Clase principal del motor del juego
 */
export class GameEngine {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.isRunning = false;
        
        console.log('Motor del juego inicializado');
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
        // Implementar la lógica de actualización del juego
    }

    /**
     * Renderiza el juego en el canvas
     */
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Implementar luego el renderizado del juego
        
        // Texto temporal
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Motor del juego Pac-Man', 50, 50);
        this.ctx.fillText('En desarrollo...', 50, 80);
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
}