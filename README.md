# GA-PAC-MAN - Algoritmo Genético para Pac-Man

Proyecto de algoritmo genético que entrena un agente para jugar Pac-Man usando una política basada en pesos heurísticos.

## Descripción

Este proyecto implementa un algoritmo genético completo que evoluciona agentes capaces de jugar Pac-Man. Los agentes utilizan un vector de pesos (genes) que puntúan diferentes acciones basándose en características observables del juego.

## 🧬 Arquitectura del Algoritmo Genético

### Representación del Individuo
- **Genes**: Vector de 44 pesos (floats) que representan la política del agente
- **Estructura**: 11 features × 4 acciones = 44 genes
- **Features observables**:
  - Direcciones bloqueadas (UP, DOWN, LEFT, RIGHT)
  - Distancia y dirección al fantasma más cercano
  - Distancia y dirección al pellet más cercano
  - Estado vulnerable de fantasmas

### Función de Fitness
- **Recompensas positivas**: +10 por pellet comido, +0.1 por paso vivo, +5 bonus por >50% pellets
- **Penalizaciones**: -100 por muerte (colisión con fantasma)
- **Evaluación**: Promedio de múltiples episodios por individuo

### Operadores Genéticos
1. **Selección**: Torneo (tamaño configurable, default=3)
2. **Cruzamiento**: Un punto (one-point crossover)
3. **Mutación**: Gaussiana con tasa configurable
4. **Reemplazo**: Generacional con elitismo (≥1 mejor individuo)

## Cómo Usar

### Iniciar el Proyecto
1. Abre `index.html` en un navegador web moderno
2. Configura los parámetros del algoritmo genético:
   - **Población (N)**: Tamaño de la población (mínimo 20)
   - **Generaciones (G)**: Número de generaciones (mínimo 50)
   - **Semilla**: Para reproducibilidad de resultados
   - **FPS**: Velocidad de la demo visual

### Entrenar el Agente
1. Haz clic en **"Iniciar Evolución"**
2. El entrenamiento se ejecutará rápidamente sin visualización
3. Las métricas se actualizarán en tiempo real:
   - Mejor Fitness
   - Fitness Promedio
   - Generación actual
   - Gráfico de evolución

### Ver Resultados
- **Demo Best**: Visualiza al mejor individuo jugando Pac-Man
- **Exportar Mejor**: Descarga los genes del mejor individuo en JSON
- **Pausar/Reanudar**: Controla la evolución en cualquier momento
- **Reiniciar**: Resetea el entrenamiento

## Estructura del Proyecto

```
PAC-MAN-P2/
├── index.html              # Interfaz web
├── styles/
│   └── styles.css          # Estilos de la UI
├── config/
│   └── default.json        # Configuración por defecto
└── src/
    ├── main.js             # Aplicación principal
    ├── utils/
    │   └── Config.js       # Gestión de configuración
    ├── game/
    │   ├── GameEngine.js   # Motor del juego
    │   ├── Pacman.js       # Lógica de Pac-Man
    │   └── Ghost.js        # Lógica de fantasmas
    └── genetic/
        ├── GeneticAlgorithm.js  # Algoritmo genético
        ├── Population.js        # Gestión de población
        └── Individual.js        # Representación del individuo
```

## Características Implementadas

### Algoritmo Genético
Población con individuos aleatorios
Evaluación de fitness con episodios de juego
Selección por torneo
Cruzamiento de un punto
Mutación gaussiana
Elitismo
Generador de números aleatorios con semilla
Historial de fitness por generación

### Motor del Juego
Mapa clásico de Pac-Man (28×31)
Modo evaluación rápida (sin render)
Modo demo visual (con canvas)
Sistema de pellets
Detección de colisiones
4 fantasmas con movimiento aleatorio
Sistema de recompensas/penalizaciones

### Interfaz de Usuario
Panel de control con parámetros
Métricas en tiempo real
Gráfico de evolución de fitness
Visualización del juego
Exportación de resultados
Demo del mejor individuo

## Detalles Técnicos

### Parámetros Configurables
- `populationSize`: Tamaño de población (≥20)
- `generations`: Número de generaciones (≥50)
- `mutationRate`: : Porcentaje de mutación (default: 20%) 
- `selectionRate`: Porcentaje de selección (default: 20%)
- `crossoverRate`: Porcentaje de cruzamiento (default: 60%)
- `elitismCount`: Individuos élite preservados (default: 1)
- `tournamentSize`: Tamaño del torneo (default: 3)
- `seed`: Semilla aleatoria para reproducibilidad
- `episodesPerIndividual`: Episodios por evaluación (default: 1)

### Modo de Operación
**Entrenamiento** (rápido, sin visualización):
- GameEngine sin canvas
- Evaluación lógica de episodios
- Sin renderizado de frames
- Actualización solo de métricas

**Demo** (visual, con canvas):
- GameEngine con canvas
- Renderizado completo del juego
- Mejor individuo jugando
- Visualización a velocidad configurable

## Resultados Esperados

El algoritmo genético debería:
- Mejorar progresivamente el fitness a lo largo de las generaciones
- Evolucionar agentes que eviten fantasmas
- Desarrollar estrategias de recolección de pellets
- Mostrar convergencia en el gráfico de fitness

## Tecnologías

- HTML5 Canvas para renderizado
- JavaScript ES6+ con módulos
- Arquitectura orientada a objetos
- Sin dependencias externas

## Notas

- El proyecto respeta las restricciones de la especificación GA-Arcade
- Usa solo información observable por un jugador legal
- No incluye redes neuronales ni librerías de ML
- Implementa reproducibilidad mediante semillas
- Sigue buenas prácticas de diseño de software

## Autor

Proyecto académico - Análisis de Algoritmos
TEC - Semestre II 2025