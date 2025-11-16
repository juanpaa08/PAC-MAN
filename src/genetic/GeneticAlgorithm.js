/**
 * Algoritmo Genético principal
 * @module GeneticAlgorithm
 */

import { Population } from './Population.js';

/**
 * Clase que implementa el algoritmo genético
 */
export class GeneticAlgorithm {
    constructor(config) {
        this.config = config;
        this.population = new Population(config);
        this.generation = 0;
        
        console.log('Algoritmo Genético inicializado con configuración:', config);
    }

    /**
     * Ejecuta un ciclo de evolución (una generación)
     */
    evolve() {
        this.generation++;
        
        // Implementar luego la lógica completa del AG
        console.log(`Ejecutando generación ${this.generation}`);
        
        // Evaluar población
        this.population.evaluate();
        
        // Implementar luego la selección, cruzamiento, mutación, reemplazo
        
        return this.population.getBestIndividual();
    }

    /**
     * Obtiene el mejor individuo de la población actual
     * @returns {Object} Mejor individuo
     */
    getBestIndividual() {
        return this.population.getBestIndividual();
    }
}