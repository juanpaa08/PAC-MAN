/**
 * Manejo de la población de individuos
 * @module Population
 */

import { Individual } from './Individual.js';

/**
 * Clase que gestiona una población de individuos
 */
export class Population {
    constructor(config) {
        this.config = config;
        this.individuals = [];
        this.initializePopulation();
    }

    /**
     * Inicializa la población con individuos aleatorios
     */
    initializePopulation() {
        for (let i = 0; i < this.config.populationSize; i++) {
            this.individuals.push(new Individual(this.config));
        }
        console.log(`Población inicializada con ${this.individuals.length} individuos`);
    }

    /**
     * Evalúa el fitness de todos los individuos
     */
    evaluate() {
        // Implementar luego la evaluación de fitness para cada individuo
        this.individuals.forEach(individual => {
            individual.calculateFitness();
        });
    }

    /**
     * Obtiene el mejor individuo de la población
     * @returns {Individual} Mejor individuo
     */
    getBestIndividual() {
        // Implementar luego la lógica para encontrar el mejor
        return this.individuals[0];
    }

    /**
     * Obtiene el mejor fitness de la población
     * @returns {number} Mejor fitness
     */
    getBestFitness() {
        // Implementar luego esta función
        return 0;
    }

    /**
     * Obtiene el fitness promedio de la población
     * @returns {number} Fitness promedio
     */
    getAverageFitness() {
        // Implementar luego esta función
        return 0;
    }
}