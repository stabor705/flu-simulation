import { SimulationStatistics } from "./simulation.ts"

export class StatisticsDisplay {
    private healthyCounter: HTMLElement
    private infectedCounter: HTMLElement
    private infectedNoSymptomsCounter: HTMLElement
    private recoveredCounter: HTMLElement
    private deadCounter: HTMLElement

    constructor() {
        let healthyCounter = document.getElementById("healthy-counter")
        let infectedCounter = document.getElementById("infected-counter")
        let infectedNoSymptomsCounter = document.getElementById(
            "infected-no-symptoms-counter"
        )
        let recoveredCounter = document.getElementById("recovered-counter")
        let deadCounter = document.getElementById("dead-counter")
        if (
            healthyCounter === null ||
            infectedCounter === null ||
            infectedNoSymptomsCounter === null ||
            recoveredCounter === null ||
            deadCounter === null
        ) {
            throw new Error("StatisticsDisplay: Counter elements not found")
        }
        this.healthyCounter = healthyCounter
        this.infectedCounter = infectedCounter
        this.infectedNoSymptomsCounter = infectedNoSymptomsCounter
        this.recoveredCounter = recoveredCounter
        this.deadCounter = deadCounter
    }

    updateStatistics(statistics: SimulationStatistics) {
        this.healthyCounter.textContent = (
            statistics.healthyCount ?? 0
        ).toString()
        this.infectedCounter.textContent = (
            statistics.infectedCount ?? 0
        ).toString()
        this.infectedNoSymptomsCounter.textContent = (
            statistics.infectedWithoutSymptomsCount ?? 0
        ).toString()
        this.recoveredCounter.textContent = (
            statistics.recoverdCount ?? 0
        ).toString()
        this.deadCounter.textContent = (statistics.deadCount ?? 0).toString()
    }
}
