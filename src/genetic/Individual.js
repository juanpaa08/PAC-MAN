/**
 * Representación de un individuo en el algoritmo genético
 * @module Individual
 */

/**
 * Clase que representa un individuo la política del juego
 */
export class Individual {
    constructor(config) {
        this.config = config;
        this.fitness = 0;
        this.genes = this.initializeGenes();
        
        console.log('Nuevo individuo creado');
    }

    /**
     * Inicializa los genes del individuo
     * @returns {Array} Genes inicializados aleatoriamente
     */
    initializeGenes() {
        // Implementar luego según la representación elegida
        // Por ahora, se retorna un array vacío
        return [];
    }

    /**
     * Calcula el fitness del individuo
     */
    calculateFitness() {
        // Implementar luego una función de fitness
        // Por ahora, fitness aleatorio para pruebas
        this.fitness = Math.random() * 100;
    }

    /**
     * Obtiene el fitness del individuo
     * @returns {number} Fitness value
     */
    getFitness() {
        return this.fitness;
    }
}