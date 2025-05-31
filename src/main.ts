import "./style.css"
import { Simulation, SimulationStatistics } from "./simulation"
import { AppWindow } from "./appwindow.ts"
import { SimulationConfig } from "./config.ts"
import { StatisticsDisplay } from "./statisticsdisplay.ts"

const config = new SimulationConfig({
    agentNum: 30,
    agentInfectionSpreadRadius: 20,
    agentRadius: 10,
    agentMovementSpeed: 0.1,
    maxInitialInfected: 0.3,
    infectionSpreadInterval: 1000,
    incubationPeriod: 15000,
    ilnessDuration: 15000,
    chanceToRecover: 0.7,
})

const boxHeight = 480
const boxWidth = 480

const simulations = Array.from({ length: 36 }, () => {
    const simulation = new Simulation(config, { width: boxWidth, height: boxHeight })
    return simulation
})

const simulationElement = document.getElementById("simulation-window")

const windowWidth = simulationElement?.clientWidth
const windowHeight = simulationElement?.clientHeight
const appWindow = new AppWindow(windowWidth ?? 720, windowHeight ? windowHeight - 30 : 360, simulations, [6, 6], boxHeight, boxWidth)
// const appWindow = new AppWindow(720, 360, simulations, [6, 6], boxHeight, boxWidth)

for (const simulation of simulations) {
    simulation.initWindow(appWindow)
}

const statisticsDisplay = new StatisticsDisplay()

const updateStatistics = () => {
    const currentStatistics = simulations.reduce(
        (accumulatedStatistics, simulation) => {
            const statistics = simulation.getStatistics()
            return {
                infectedCount:
                    accumulatedStatistics.infectedCount +
                    statistics.infectedCount,
                healthyCount:
                    accumulatedStatistics.healthyCount +
                    statistics.healthyCount,
                infectedWithoutSymptomsCount:
                    accumulatedStatistics.infectedWithoutSymptomsCount +
                    statistics.infectedWithoutSymptomsCount,
                recoverdCount:
                    accumulatedStatistics.recoverdCount +
                    statistics.recoverdCount,
                deadCount:
                    accumulatedStatistics.deadCount + statistics.deadCount,
            }
        },
        {
            infectedCount: 0,
            healthyCount: 0,
            infectedWithoutSymptomsCount: 0,
            recoverdCount: 0,
            deadCount: 0,
        } satisfies SimulationStatistics
    )
    statisticsDisplay.updateStatistics(currentStatistics)
}

updateStatistics()
setInterval(updateStatistics, 1000)
