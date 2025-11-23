/**
 * Manejo de la población de individuos
 * @module Population
 */

import { Individual } from './Individual.js';

/**
 * Clase que gestiona una población de individuos
 */
export class Population {
    constructor(config, gameEngine) {
        this.config = config;
        this.gameEngine = gameEngine;
        this.individuals = [];
        this.generation = 0;
        this.initializePopulation();
    }

    /**
     * Inicializa la población con individuos aleatorios
     */
    initializePopulation() {
        for (let i = 0; i < this.config.populationSize; i++) {
            this.individuals.push(new Individual(null, this.config));
        }
        console.log(`Población inicializada con ${this.individuals.length} individuos`);
    }

    /**
     * Evalúa el fitness de todos los individuos
     */
    evaluate() {
        console.log(`Evaluando población (generación ${this.generation})...`);
        
        this.individuals.forEach((individual, index) => {
            if (individual.fitness === 0) { // Solo evaluar si no tiene fitness
                individual.evaluateFitness(this.gameEngine);
            }
        });
        
        // Ordenar por fitness (de mayor a menor)
        this.individuals.sort((a, b) => b.fitness - a.fitness);
    }

    /**
     * Obtiene el mejor individuo de la población
     * @returns {Individual} Mejor individuo
     */
    getBestIndividual() {
        if (this.individuals.length === 0) return null;
        
        // Encontrar individuo con mejor fitness
        let best = this.individuals[0];
        for (let i = 1; i < this.individuals.length; i++) {
            if (this.individuals[i].fitness > best.fitness) {
                best = this.individuals[i];
            }
        }
        return best;
    }

    /**
     * Obtiene el mejor fitness de la población
     * @returns {number} Mejor fitness
     */
    getBestFitness() {
        const best = this.getBestIndividual();
        return best ? best.fitness : 0;
    }

    /**
     * Obtiene el fitness promedio de la población
     * @returns {number} Fitness promedio
     */
    getAverageFitness() {
        if (this.individuals.length === 0) return 0;
        
        const sum = this.individuals.reduce((acc, ind) => acc + ind.fitness, 0);
        return sum / this.individuals.length;
    }

    /**
     * Obtiene el peor fitness de la población
     * @returns {number} Peor fitness
     */
    getWorstFitness() {
        if (this.individuals.length === 0) return 0;
        
        let worst = this.individuals[0].fitness;
        for (let i = 1; i < this.individuals.length; i++) {
            if (this.individuals[i].fitness < worst) {
                worst = this.individuals[i].fitness;
            }
        }
        return worst;
    }

    /**
     * Reemplaza la población con una nueva
     * @param {Array<Individual>} newIndividuals - Nuevos individuos
     */
    setIndividuals(newIndividuals) {
        this.individuals = newIndividuals;
        this.generation++;
    }

    /**
     * Obtiene el tamaño de la población
     * @returns {number} Tamaño
     */
    size() {
        return this.individuals.length;
    }
}