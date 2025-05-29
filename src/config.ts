export class SimulationConfig {
    agentNum: number
    agentInfectionSpreadRadius: number
    agentRadius: number
    infectionSpreadInterval: number
    maxInitialInfected: number
    agentMovementSpeed: number
    incubationPeriod: number
    ilnessDuration: number
    chanceToRecover: number
    timeToRemoveDead: number

    constructor({
        agentNum = 10,
        agentInfectionSpreadRadius = 20,
        agentRadius = 10,
        agentMovementSpeed = 0.1,
        maxInitialInfected = 0.3,
        infectionSpreadInterval = 1000,
        incubationPeriod = 10000,
        ilnessDuration = 10000,
        chanceToRecover = 0.7,
        timeToRemoveDead = 5000,
        
    }: Partial<SimulationConfig> = {}) {
        this.agentNum = agentNum
        this.agentInfectionSpreadRadius = agentInfectionSpreadRadius
        this.agentRadius = agentRadius
        this.infectionSpreadInterval = infectionSpreadInterval
        this.maxInitialInfected = maxInitialInfected
        this.agentMovementSpeed = agentMovementSpeed
        this.incubationPeriod = incubationPeriod
        this.ilnessDuration = ilnessDuration
        this.chanceToRecover = chanceToRecover
        this.timeToRemoveDead = timeToRemoveDead
    }
}
