/**
 * Punto de entrada principal de la aplicación GA-Pacman
 * @module main
 */

import { Config } from './utils/Config.js';
import { GeneticAlgorithm } from './genetic/GeneticAlgorithm.js';
import { GameEngine } from './game/GameEngine.js';

/**
 * Clase principal de la aplicación que coordina el algoritmo genético y el juego
 */
class GameApp {
    constructor() {
        this.ga = null;              // Instancia del algoritmo genético
        this.gameEngine = null;      // Motor del juego Pac-Man
        this.isRunning = false;      // Estado de la evolución
        this.currentGeneration = 0;

        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Inicializa los elementos del DOM
     */
    initializeElements() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.demoBtn = document.getElementById('demoBtn');

        // Mostrar vista previa del mapa al iniciar
        this.showMapPreview();

        // Luego hay que inicializar gráfico de fitness si es necesario
    }

    /**
     * Muestra una vista previa del mapa antes de iniciar la evolución
     */
    showMapPreview() {
        const previewConfig = {
            fps: 30,
            populationSize: 1,
            generations: 1
        };
        const previewEngine = new GameEngine(this.canvas, previewConfig);
        previewEngine.render();
    }

    /**
     * Configura los event listeners para los controles
     */
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startEvolution());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.exportBtn.addEventListener('click', () => this.exportBest());
        this.demoBtn.addEventListener('click', () => this.demoBest());
    }

    /**
     * Inicia el proceso de evolución del algoritmo genético
     */
    startEvolution() {
        const config = this.getConfig();
        this.ga = new GeneticAlgorithm(config, null);
        this.gameEngine = new GameEngine(this.canvas, config);

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        console.log('Iniciando evolución con configuración:', config);

        // NO iniciar render durante entrenamiento
        // this.gameEngine.start();

        this.runGeneration();
    }

    /**
     * Ejecuta una generación del algoritmo genético
     */
    runGeneration() {
        if (!this.isRunning) return;

        console.log(`\n>>> Iniciando generación ${this.ga.generation + 1}/${this.ga.config.generations}`);
        
        // Evolucionar una generación
        this.ga.evolve();
        this.currentGeneration = this.ga.generation;

        // Actualizar métricas en la UI
        this.updateMetrics();
        this.updateFitnessChart();

        // Continuar con la siguiente generación si no hemos llegado al límite
        if (this.currentGeneration < this.ga.config.generations) {
            // Usar setTimeout para no bloquear la UI
            setTimeout(() => this.runGeneration(), 10);
        } else {
            this.finishEvolution();
        }
    }

    /**
     * Actualiza las métricas en la interfaz de usuario
     */
    updateMetrics() {
        const stats = this.ga.getCurrentStats();
        
        document.getElementById('bestFitness').textContent = stats.bestFitness.toFixed(2);
        document.getElementById('avgFitness').textContent = stats.avgFitness.toFixed(2);
        document.getElementById('currentGeneration').textContent = this.currentGeneration;
    }

    /**
     * Actualiza el gráfico de fitness
     */
    updateFitnessChart() {
        const chartCanvas = document.getElementById('fitnessChart');
        const ctx = chartCanvas.getContext('2d');
        const history = this.ga.fitnessHistory;
        
        if (history.length === 0) return;

        // Limpiar canvas
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

        // Configuración del gráfico
        const padding = 40;
        const chartWidth = chartCanvas.width - 2 * padding;
        const chartHeight = chartCanvas.height - 2 * padding;

        // Encontrar valores min y max
        let maxFitness = Math.max(...history.map(h => h.best));
        let minFitness = Math.min(...history.map(h => h.worst));
        const fitnessRange = maxFitness - minFitness || 1;

        // Dibujar ejes
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, chartCanvas.height - padding);
        ctx.lineTo(chartCanvas.width - padding, chartCanvas.height - padding);
        ctx.stroke();

        // Dibujar líneas
        const drawLine = (data, color) => {
            if (data.length < 2) return;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((value, i) => {
                const x = padding + (i / (history.length - 1)) * chartWidth;
                const y = chartCanvas.height - padding - ((value - minFitness) / fitnessRange) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        };

        // Dibujar líneas de fitness
        drawLine(history.map(h => h.best), '#00ff00');     // Verde: mejor
        drawLine(history.map(h => h.average), '#ffcc00');  // Amarillo: promedio
        drawLine(history.map(h => h.worst), '#ff0000');    // Rojo: peor

        // Leyenda
        ctx.font = '12px Arial';
        ctx.fillStyle = '#00ff00';
        ctx.fillText('Mejor', chartCanvas.width - 100, 20);
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('Promedio', chartCanvas.width - 100, 35);
        ctx.fillStyle = '#ff0000';
        ctx.fillText('Peor', chartCanvas.width - 100, 50);

        // Etiquetas de ejes
        ctx.fillStyle = '#fff';
        ctx.fillText('Gen: ' + this.currentGeneration, padding, chartCanvas.height - 10);
        ctx.fillText('Fitness: ' + maxFitness.toFixed(0), 5, padding);
    }

    /**
     * Obtiene la configuración de los parámetros del UI
     * @returns {Object} Configuración para el algoritmo genético
     */
    getConfig() {
        return {
            populationSize: parseInt(document.getElementById('populationSize').value),
            generations: parseInt(document.getElementById('generations').value),
            seed: parseInt(document.getElementById('seed').value),
            fps: parseInt(document.getElementById('fps').value),
            mutationRate: 0.1,
            crossoverRate: 0.7,
            elitismCount: 1,
            tournamentSize: 3,
            episodesPerIndividual: 1
        };
    }

    /**
     * Pausa o reanuda la evolución
     */
    togglePause() {
        this.isRunning = !this.isRunning;
        this.pauseBtn.textContent = this.isRunning ? 'Pausar' : 'Reanudar';

        if (this.isRunning) {
            this.runGeneration();
        }
    }

    /**
     * Reinicia la aplicación al estado inicial
     */
    reset() {
        this.isRunning = false;
        this.currentGeneration = 0;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pausar';

        // Resetar las métricas de la UI
        document.getElementById('bestFitness').textContent = '0';
        document.getElementById('avgFitness').textContent = '0';
        document.getElementById('currentGeneration').textContent = '0';

        // Mostrar vista previa del mapa nuevamente
        this.showMapPreview();

        console.log('Aplicación reiniciada');
    }

    /**
     * Exporta el mejor individuo a un archivo JSON
     */
    exportBest() {
        if (!this.ga) {
            alert('Primero debe ejecutar el algoritmo genético');
            return;
        }

        const bestIndividual = this.ga.getBestIndividual();
        if (!bestIndividual) {
            alert('No hay individuo para exportar');
            return;
        }

        const exportData = {
            fitness: bestIndividual.fitness,
            genes: bestIndividual.genes,
            generation: this.currentGeneration,
            timestamp: new Date().toISOString(),
            config: this.ga.config
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `best-individual-gen${this.currentGeneration}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('Mejor individuo exportado con fitness:', bestIndividual.fitness);
    }

    /**
     * Ejecuta una demostración con el mejor individuo
     */
    demoBest() {
        if (!this.ga) {
            alert('Primero debe ejecutar el algoritmo genético');
            return;
        }

        const bestIndividual = this.ga.getBestIndividual();
        if (!bestIndividual) {
            alert('No hay mejor individuo para demostrar');
            return;
        }

        console.log('Iniciando demo del mejor individuo con fitness:', bestIndividual.fitness);
        
        // Detener cualquier evolución en curso
        this.isRunning = false;
        
        // Ejecutar demo visual usando el GameEngine con canvas
        this.ga.runDemo(this.gameEngine);
    }

    /**
     * Finaliza el proceso de evolución
     */
    finishEvolution() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;

        console.log('Evolución completada después de', this.currentGeneration, 'generaciones');

        // Hay que mostrar un resumen final de resultados
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.GA_Pacman_App = new GameApp();
    console.log('GA-Pacman aplicación inicializada');
});