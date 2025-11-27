export class Config {
    static getDefault() {
        return {
            populationSize: 20,
            generations: 50,
            selectionRate: 0.2,      
            crossoverRate: 0.6,      
            mutationRate: 0.2,       
            elitismCount: 1,
            tournamentSize: 3,
            seed: 12345,
            fps: 30,
            episodesPerIndividual: 1,
            mazeWidth: 28,
            mazeHeight: 31,
            tileSize: 20
        };
    }
}