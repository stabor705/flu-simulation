export class SimulationConfig {
    agentNum: number
    agentInfectionSpreadRadius: number
    agentRadius: number
    infectionSpreadInterval: number
    maxInitialInfected: number
    agentMovementSpeed: number

    constructor({
        agentNum = 10,
        agentInfectionSpreadRadius = 20,
        agentRadius = 10,
        agentMovementSpeed = 0.1,
        maxInitialInfected = 0.3,
        infectionSpreadInterval = 1000,

    }: Partial<SimulationConfig> = {}) {
        this.agentNum = agentNum
        this.agentInfectionSpreadRadius = agentInfectionSpreadRadius
        this.agentRadius = agentRadius
        this.infectionSpreadInterval = infectionSpreadInterval
        this.maxInitialInfected = maxInitialInfected
        this.agentMovementSpeed = agentMovementSpeed
    }
} 