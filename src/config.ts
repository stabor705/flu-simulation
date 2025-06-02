export class SimulationConfig {
    agentNum: number
    agentInfectionSpreadRadius: number
    agentRadius: number
    infectionSpreadInterval: number
    maxInitialInfected: number
    agentMovementSpeed: number
    incubationPeriod: [number, number]
    ilnessDuration: [number, number]
    chanceToRecover: number
    timeToRemoveDead: number
    timeToQuarantine: number
    chanceToQuarantine: number
    timeToReleaseFromQuarantine: number
    chanceToSurviveQuarantine: number
    isQuarantineEnabled: boolean

    constructor({
        agentNum = 10,
        agentInfectionSpreadRadius = 20,
        agentRadius = 10,
        agentMovementSpeed = 0.1,
        maxInitialInfected = 0.1,
        infectionSpreadInterval = 500,
        incubationPeriod = [2000, 4000],
        ilnessDuration = [8000, 12000],
        chanceToRecover = 0.96,
        timeToRemoveDead = 5000,
        timeToQuarantine = 1000,
        chanceToQuarantine = 0.8,
        timeToReleaseFromQuarantine = 5000,
        chanceToSurviveQuarantine = 0.96,
        isQuarantineEnabled = false,
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
        this.timeToQuarantine = timeToQuarantine
        this.chanceToQuarantine = chanceToQuarantine
        this.timeToReleaseFromQuarantine = timeToReleaseFromQuarantine
        this.chanceToSurviveQuarantine = chanceToSurviveQuarantine
        this.isQuarantineEnabled = isQuarantineEnabled
    }
}
