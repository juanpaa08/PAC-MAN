/**
 * Representación de un individuo en el algoritmo genético
 * @module Individual
 */

/**
 * Clase que representa un individuo la política del juego
 */
export class Individual {
    constructor(genes = null, config = null) {
        this.config = config;
        this.fitness = 0;
        
        // Si se pasan genes, usarlos; si no, inicializar aleatorios
        if (genes) {
            this.genes = [...genes]; // Copiar array
        } else {
            this.genes = this.initializeGenes();
        }
    }

    /**
     * Inicializa los genes del individuo
     * Los genes son pesos para puntuar cada acción basada en las features:
     * - 4 pesos para direcciones bloqueadas (UP, DOWN, LEFT, RIGHT)
     * - 3 pesos para fantasma (distGhost, dxGhost, dyGhost)
     * - 3 pesos para pellet (distPellet, dxPellet, dyPellet)
     * - 1 peso para ghostIsVulnerable
     * - 4 pesos de sesgo (bias) por acción
     * Total: 11 features × 4 acciones = 44 genes
     * @returns {Array} Genes inicializados aleatoriamente
     */
    initializeGenes() {
        const geneLength = 44; // 11 features × 4 acciones
        const genes = [];
        
        for (let i = 0; i < geneLength; i++) {
            // Inicializar pesos en rango [-1, 1]
            genes.push((Math.random() * 2) - 1);
        }
        
        return genes;
    }

    /**
     * Clona el individuo
     * @returns {Individual} Copia del individuo
     */
    clone() {
        const cloned = new Individual([...this.genes], this.config);
        cloned.fitness = this.fitness;
        return cloned;
    }

    /**
     * Selecciona la mejor acción basada en los genes y el estado observable
     * @param {Object} state - Estado observable del juego
     * @returns {string} Acción seleccionada
     */
    selectAction(state) {
        const actions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const features = [
            state.blockedUp,
            state.blockedDown,
            state.blockedLeft,
            state.blockedRight,
            state.distGhost,
            state.dxGhost,
            state.dyGhost,
            state.distPellet,
            state.dxPellet,
            state.dyPellet,
            state.ghostIsVulnerable
        ];

        let bestAction = 'STOP';
        let bestScore = -Infinity;

        // Calcular puntuación para cada acción
        for (let i = 0; i < actions.length; i++) {
            let score = 0;
            const offset = i * 11; // 11 features por acción

            // Sumar producto de features con sus pesos
            for (let j = 0; j < features.length; j++) {
                score += features[j] * this.genes[offset + j];
            }

            if (score > bestScore) {
                bestScore = score;
                bestAction = actions[i];
            }
        }

        return bestAction;
    }

    /**
     * Evalúa el fitness del individuo ejecutando episodios
     * @param {GameEngine} gameEngine - Motor del juego para simulación
     * @returns {number} Fitness calculado
     */
    evaluateFitness(gameEngine) {
        const episodesPerIndividual = this.config?.episodesPerIndividual || 1;
        let totalFitness = 0;

        // Ejecutar múltiples episodios y promediar
        for (let episode = 0; episode < episodesPerIndividual; episode++) {
            gameEngine.resetEpisode();
            let episodeFitness = 0;
            let done = false;

            while (!done) {
                // Obtener estado observable
                const state = gameEngine.getObservableState();
                
                // Seleccionar acción usando los genes
                const action = this.selectAction(state);
                
                // Ejecutar paso en el juego
                const stepResult = gameEngine.step(action);
                
                // Acumular recompensa
                episodeFitness += stepResult.reward;
                done = stepResult.done;
            }

            totalFitness += episodeFitness;
        }

        // Fitness promedio de todos los episodios
        this.fitness = totalFitness / episodesPerIndividual;
        return this.fitness;
    }

    /**
     * Obtiene el fitness del individuo
     * @returns {number} Fitness value
     */
    getFitness() {
        return this.fitness;
    }
}