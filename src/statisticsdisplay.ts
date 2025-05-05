import { SimulationStatistics } from "./simulation.ts"

export class StatisticsDisplay {
    private healthyCounter: HTMLElement
    private infectedCounter: HTMLElement

    constructor() {
        let healthyCounter = document.getElementById("healthy-counter")
        let infectedCounter = document.getElementById("infected-counter")
        if (healthyCounter === null || infectedCounter === null) {
            throw new Error("StatisticsDisplay: Counter elements not found")
        }
        this.healthyCounter = healthyCounter
        this.infectedCounter = infectedCounter
    }

    updateStatistics(statistics: SimulationStatistics) {
        this.healthyCounter.textContent = statistics.healthyCount.toString()
        this.infectedCounter.textContent = statistics.infectedCount.toString()
    }
}
