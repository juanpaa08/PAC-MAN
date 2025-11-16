export class Config {
    static getDefault() {
        return {
            populationSize: 20,
            generations: 50,
            mutationRate: 0.1,
            crossoverRate: 0.7,
            elitismCount: 1,
            tournamentSize: 3,
            seed: 12345,
            fps: 30,
            episodesPerIndividual: 1,
            mazeWidth: 28,
            mazeHeight: 31,
            titleSize: 20
        };
    }
}