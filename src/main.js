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
        
        // Luego hay que inicializar gráfico de fitness si es necesario
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
        this.ga = new GeneticAlgorithm(config);
        this.gameEngine = new GameEngine(this.canvas, config);
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        console.log('Iniciando evolución con configuración:', config);
        this.runGeneration();
    }

    /**
     * Ejecuta una generación del algoritmo genético
     */
    runGeneration() {
        if (!this.isRunning) return;

        // Luego hay que implementar lógica de evaluación de individuos
        this.ga.evolve();
        this.currentGeneration++;
        
        this.updateMetrics();
        
        // Continuar con la siguiente generación si no hemos llegado al límite
        if (this.currentGeneration < this.ga.config.generations) {
            requestAnimationFrame(() => this.runGeneration());
        } else {
            this.finishEvolution();
        }
    }

    /**
     * Actualiza las métricas en la interfaz de usuario
     */
    updateMetrics() {
        // Se deben obtener las métricas reales del algoritmo genético
        const bestFitness = this.ga.population.getBestFitness().toFixed(2);
        const avgFitness = this.ga.population.getAverageFitness().toFixed(2);
        
        document.getElementById('bestFitness').textContent = bestFitness;
        document.getElementById('avgFitness').textContent = avgFitness;
        document.getElementById('currentGeneration').textContent = this.currentGeneration;
        
        // Posteriormente hay que actualizar gráfico de fitness
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
            elitismCount: 1       
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
        
        // Liego hay que resetar las métricas de la UI
        document.getElementById('bestFitness').textContent = '0';
        document.getElementById('avgFitness').textContent = '0';
        document.getElementById('currentGeneration').textContent = '0';
        
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
        
        // Luego debe implementarse la exportación del mejor individuo
        const bestIndividual = this.ga.population.getBestIndividual();
        console.log('Exportando mejor individuo:', bestIndividual);
        alert('Funcionalidad de exportación en desarrollo');
    }

    /**
     * Ejecuta una demostración con el mejor individuo
     */
    demoBest() {
        if (!this.ga) {
            alert('Primero debe ejecutar el algoritmo genético');
            return;
        }
        
        // Hay que implementar demo del mejor individuo
        console.log('Iniciando demo del mejor individuo');
        alert('Funcionalidad de demo en desarrollo');
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