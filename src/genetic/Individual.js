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
        this.lastAction = 'STOP';
        this.consecutiveStop = 0;
        this.sameAreaTime = 0;
        
        // Si se pasan genes, usarlos; si no, inicializa aleatorios
        if (genes) {
            this.genes = [...genes]; // Copia el array
        } else {
            this.genes = this.initializeGenes();
        }
    }

    /**
     * Inicializa los genes del individuo
     * Con 24 features × 4 acciones = 96 genes
     */
    initializeGenes() {
    const geneLength = 96; // 24 features × 4 acciones = 96 genes
    const genes = [];
    
    for (let i = 0; i < geneLength; i++) {
        genes.push((Math.random() - 0.5) * 2);
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
        cloned.lastAction = this.lastAction;
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
        // Direcciones bloqueadas (0 o 1)
        state.blockedUp,
        state.blockedDown, 
        state.blockedLeft,
        state.blockedRight,
        
        // Información del fantasma más cercano
        state.distGhost > 0 ? Math.min(1, 3 / (state.distGhost + 1)) : 0,
        Math.sign(state.dxGhost) || 0,
        Math.sign(state.dyGhost) || 0,
        
        // Información del pellet más cercano
        state.distPellet > 0 ? Math.min(1, 5 / (state.distPellet + 1)) : 0,
        Math.sign(state.dxPellet) || 0, 
        Math.sign(state.dyPellet) || 0,
        
        // Información de pellets por dirección
        state.pelletsUp,
        state.pelletsDown,
        state.pelletsLeft, 
        state.pelletsRight,
        state.closestUp,
        state.closestDown,
        state.closestLeft,
        state.closestRight,
        
        // Estado vulnerable del fantasma
        state.ghostIsVulnerable,
        
        // Dirección anterior
        this.lastAction === 'UP' ? 1 : 0,
        this.lastAction === 'DOWN' ? 1 : 0, 
        this.lastAction === 'LEFT' ? 1 : 0,
        this.lastAction === 'RIGHT' ? 1 : 0,
        
        // Sesgo
        1
    ];

        let bestAction = 'STOP';
        let bestScore = -Infinity;
        let validActions = [];

        // Calcula la puntuación para cada acción
        for (let i = 0; i < actions.length; i++) {
            let score = 0;
            const offset = i * 20;

            for (let j = 0; j < features.length; j++) {
                score += features[j] * this.genes[offset + j];
            }

            const action = actions[i];
            let isValid = true;
            
            switch(action) {
                case 'UP': isValid = !state.blockedUp; break;
                case 'DOWN': isValid = !state.blockedDown; break;
                case 'LEFT': isValid = !state.blockedLeft; break;
                case 'RIGHT': isValid = !state.blockedRight; break;
            }
            
            if (isValid) {
                // Bonus por continuidad
                if (action === this.lastAction) {
                    score += 8; // Bonus fuerte por mantener dirección
                }
                
                validActions.push({ action, score });
                
                if (score > bestScore) {
                    bestScore = score;
                    bestAction = action;
                }
            }
        }

        // Exploración
        if (this.consecutiveStop > 10 && validActions.length > 0) {
            // Elige dirección que lleve a áreas menos exploradas
            const explorationAction = this.getExplorationAction(validActions, state);
            bestAction = explorationAction;
            this.consecutiveStop = 0;
        } else if (bestAction === 'STOP' && validActions.length > 0) {
            const explorationAction = this.getExplorationAction(validActions, state);
            bestAction = explorationAction;
        }

        // Fuerza exploración si está en un loop de movimiento
        if (this.sameAreaTime > 20 && validActions.length > 0) {
            const explorationAction = this.getExplorationAction(validActions, state);
            bestAction = explorationAction;
            this.sameAreaTime = 0;
        }

        // Cuenta la quietud
        if (bestAction === 'STOP') {
            this.consecutiveStop = (this.consecutiveStop || 0) + 1;
        } else {
            this.consecutiveStop = 0;
        }

        this.lastAction = bestAction;
        return bestAction;
    }


    /**
     * Elige acción que promueva exploración
     */
    getExplorationAction(validActions, state) {
        // Prioriza direcciones con más pellets y menos bloqueadas
        const scoredActions = validActions.map(({action, score}) => {
            let explorationScore = score;
            
            // Bonus por direcciones con pellets
            switch(action) {
                case 'UP': explorationScore += state.pelletsUp * 10; break;
                case 'DOWN': explorationScore += state.pelletsDown * 10; break;
                case 'LEFT': explorationScore += state.pelletsLeft * 10; break;
                case 'RIGHT': explorationScore += state.pelletsRight * 10; break;
            }
            
            // Bonus por pellets cercanos en esa dirección
            switch(action) {
                case 'UP': explorationScore += state.closestUp * 5; break;
                case 'DOWN': explorationScore += state.closestDown * 5; break;
                case 'LEFT': explorationScore += state.closestLeft * 5; break;
                case 'RIGHT': explorationScore += state.closestRight * 5; break;
            }
            
            return { action, explorationScore };
        });
        
        // Elige la mejor acción para exploración
        scoredActions.sort((a, b) => b.explorationScore - a.explorationScore);
        return scoredActions[0].action;
    }



    /**
     * Estima la cantidad de pellets en una dirección
     * Simula mirar hacia esa dirección y contar pellets
     */
    estimatePelletsInDirection(direction, state) {        
        let score = 0;
        
        switch(direction) {
            case 'UP':
                if (state.dyPellet < 0) score += 0.7; // Pellet está arriba
                if (!state.blockedUp) score += 0.3;    // Camino libre arriba
                break;
            case 'DOWN':
                if (state.dyPellet > 0) score += 0.7; // Pellet está abajo  
                if (!state.blockedDown) score += 0.3;  // Camino libre abajo
                break;
            case 'LEFT':
                if (state.dxPellet < 0) score += 0.7; // Pellet está izquierda
                if (!state.blockedLeft) score += 0.3;  // Camino libre izquierda
                break;
            case 'RIGHT':
                if (state.dxPellet > 0) score += 0.7; // Pellet está derecha
                if (!state.blockedRight) score += 0.3; // Camino libre derecha
                break;
        }
        
        return Math.min(1, score);
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