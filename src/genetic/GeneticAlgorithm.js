/**
 * Algoritmo Genético principal
 * @module GeneticAlgorithm
 */

import { Population } from './Population.js';
import { Individual } from './Individual.js';
import { GameEngine } from '../game/GameEngine.js';

/**
 * Clase que implementa el algoritmo genético
 */
export class GeneticAlgorithm {
    constructor(config, canvas = null) {
        this.config = config;
        this.generation = 0;
        
        // Crear GameEngine para evaluación (sin canvas = modo rápido)
        this.evaluationEngine = new GameEngine(null, config);
        
        // Crear población
        this.population = new Population(config, this.evaluationEngine);
        
        // Inicializar generador de números aleatorios con semilla
        this.seed = config.seed || 12345;
        this.rng = this.seededRandom(this.seed);
        
        // Historial de fitness
        this.fitnessHistory = [];
        
        console.log('Algoritmo Genético inicializado con configuración:', config);
    }

    /**
     * Generador de números aleatorios con semilla (para reproducibilidad)
     * @param {number} seed - Semilla
     * @returns {Function} Función que genera números aleatorios
     */
    seededRandom(seed) {
        let value = seed;
        return () => {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    /**
     * Inicializa el algoritmo genético
     */
    initialize() {
        console.log('Inicializando AG con semilla:', this.seed);
        this.generation = 0;
        this.fitnessHistory = [];
    }

    /**
     * Evalúa la población actual
     */
    evaluatePopulation() {
        this.population.evaluate();
        
        // Guardar estadísticas
        this.fitnessHistory.push({
            generation: this.generation,
            best: this.population.getBestFitness(),
            average: this.population.getAverageFitness(),
            worst: this.population.getWorstFitness()
        });
    }

    /**
     * Selección por torneo
     * @param {number} tournamentSize - Tamaño del torneo
     * @returns {Individual} Individuo seleccionado
     */
    tournamentSelection(tournamentSize = null) {
        const size = tournamentSize || this.config.tournamentSize || 3;
        let best = null;

        for (let i = 0; i < size; i++) {
            const randomIndex = Math.floor(this.rng() * this.population.size());
            const contestant = this.population.individuals[randomIndex];
            
            if (!best || contestant.fitness > best.fitness) {
                best = contestant;
            }
        }

        return best;
    }

    /**
     * Cruzamiento de un punto entre dos individuos
     * @param {Individual} parent1 - Primer padre
     * @param {Individual} parent2 - Segundo padre
     * @returns {Array<Individual>} Dos hijos
     */
    onePointCrossover(parent1, parent2) {
        const geneLength = parent1.genes.length;
        
        // Punto de cruce aleatorio
        const crossoverPoint = Math.floor(this.rng() * geneLength);
        
        // Crear genes de los hijos
        const child1Genes = [
            ...parent1.genes.slice(0, crossoverPoint),
            ...parent2.genes.slice(crossoverPoint)
        ];
        
        const child2Genes = [
            ...parent2.genes.slice(0, crossoverPoint),
            ...parent1.genes.slice(crossoverPoint)
        ];
        
        return [
            new Individual(child1Genes, this.config),
            new Individual(child2Genes, this.config)
        ];
    }

    /**
     * Mutación gaussiana de un individuo
     * @param {Individual} individual - Individuo a mutar
     * @param {number} mutationRate - Tasa de mutación
     */
    gaussianMutation(individual, mutationRate = null) {
        const rate = mutationRate || this.config.mutationRate || 0.1;
        
        for (let i = 0; i < individual.genes.length; i++) {
            if (this.rng() < rate) {
                // Aplicar mutación gaussiana (usando Box-Muller)
                const u1 = this.rng();
                const u2 = this.rng();
                const gaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                
                // Mutación con desviación estándar de 0.3
                individual.genes[i] += gaussian * 0.3;
                
                // Mantener en rango razonable [-2, 2]
                individual.genes[i] = Math.max(-2, Math.min(2, individual.genes[i]));
            }
        }
    }

    /**
     * Ejecuta un ciclo de evolución (una generación)
     */
    evolve() {
        this.generation++;
        console.log(`\n=== Generación ${this.generation} ===`);
        
        const startGenTime = performance.now();
        let opTime = 0;
        
        // Evalua población si es necesario
        if (this.generation === 1) {
            this.evaluatePopulation();
        }
        
        // Crea nueva población
        const newPopulation = [];
        const popSize = this.config.populationSize;
        const elitismCount = this.config.elitismCount || 1;
        
        // Mide operadores geneticos
        const opStartTime = performance.now();
        
        // Elitismo, mantiene los mejores individuos
        const sortedIndividuals = [...this.population.individuals].sort((a, b) => b.fitness - a.fitness);
        for (let i = 0; i < elitismCount; i++) {
            newPopulation.push(sortedIndividuals[i].clone());
        }
        
        console.log(`Elitismo: ${elitismCount} mejores individuos preservados`);
        
        // Genera resto de población con selección, cruzamiento y mutación
        while (newPopulation.length < popSize) {
            // Selección por torneo
            const parent1 = this.tournamentSelection(this.config.tournamentSize);
            const parent2 = this.tournamentSelection(this.config.tournamentSize);
            
            // Cruzamiento usa tasa configurada
            let offspring;
            if (this.rng() < this.config.crossoverRate) {
                const [child1, child2] = this.onePointCrossover(parent1, parent2);
                offspring = [child1, child2];
            } else {
                // Sin cruzamiento, clona los padres
                offspring = [parent1.clone(), parent2.clone()];
            }

            // Mutación usando tasa configurada
            offspring.forEach(child => {
                this.gaussianMutation(child, this.config.mutationRate);
            });
            
            // Se agrega a nueva población
            offspring.forEach(child => {
                if (newPopulation.length < popSize) {
                    newPopulation.push(child);
                }
            });
        }
        
        opTime = performance.now() - opStartTime;
        console.log(`Operadores genéticos: ${opTime.toFixed(2)}ms`);
        
        // Reemplaza población
        this.population.setIndividuals(newPopulation);
        
        // Evalua nueva población
        this.evaluatePopulation();
        
        // Muestra estadísticas
        const stats = this.getCurrentStats();
        console.log(`Mejor Fitness: ${stats.bestFitness.toFixed(2)}`);
        console.log(`Fitness Promedio: ${stats.avgFitness.toFixed(2)}`);
        
        const totalGenTime = performance.now() - startGenTime;
        console.log(`Tiempo total generación: ${totalGenTime.toFixed(2)}ms`);
        
        return this.population.getBestIndividual();
    }

    /**
     * Obtiene el mejor individuo de la población actual
     * @returns {Individual} Mejor individuo
     */
    getBestIndividual() {
        return this.population.getBestIndividual();
    }

    /**
     * Obtiene las estadísticas actuales del algoritmo
     * @returns {Object} Estadísticas
     */
    getCurrentStats() {
        return {
            generation: this.generation,
            bestFitness: this.population.getBestFitness(),
            avgFitness: this.population.getAverageFitness(),
            worstFitness: this.population.getWorstFitness(),
            fitnessHistory: this.fitnessHistory
        };
    }

    /**
     * Ejecuta una demo visual del mejor individuo
     * @param {GameEngine} visualEngine - Motor con canvas para visualización
     * @returns {number} ID del requestAnimationFrame para poder cancelarlo
     */
    runDemo(visualEngine) {
        const best = this.getBestIndividual();
        if (!best) {
            console.log('No hay mejor individuo para demo');
            return null;
        }

        console.log('Ejecutando demo del mejor individuo con fitness:', best.fitness);
        
        visualEngine.resetEpisode();
        visualEngine.isRunning = true;

        let animationId;
        const demoLoop = () => {
            if (!visualEngine.isRunning) return;

            const state = visualEngine.getObservableState();
            const action = best.selectAction(state);
            const result = visualEngine.step(action);

            visualEngine.render();

            if (result.done) {
                console.log('Demo finalizada. Score:', result.score, 'Pellets:', result.pelletsEaten);
                visualEngine.isRunning = false;
                
                // Reiniciar automáticamente después de 2 segundos
                setTimeout(() => {
                    if (window.GA_Pacman_App) {
                        window.GA_Pacman_App.reset();
                    }
                }, 2000);
                return;
            }

            setTimeout(() => {
                animationId = requestAnimationFrame(demoLoop);
            }, 1000 / visualEngine.config.fps);
        };

        demoLoop();
        return animationId;
    }

    /**
     * Reinicia el algoritmo genético al estado inicial
     */
    reset() {
        console.log('Reiniciando algoritmo genético...');
        this.generation = 0;
        this.fitnessHistory = [];
        this.population = null;
        this.evaluationEngine = null;
    }
}