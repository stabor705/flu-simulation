import './style.css'
import {Simulation, SimulationStatistics} from './simulation'
import { AppWindow } from "./appwindow.ts";
import { SimulationConfig } from './config.ts';
import {StatisticsDisplay} from "./statisticsdisplay.ts";

const config = new SimulationConfig({
    agentNum: 10,
    agentInfectionSpreadRadius: 20,
    agentRadius: 10,
    agentMovementSpeed: 0.1,
    maxInitialInfected: 0.3,
    infectionSpreadInterval: 1000
})

const simulations = Array.from({length: 10}, (_, index) => {
    const simulation = new Simulation(config, { width: 360, height: 360 })
    const window = new AppWindow(360, 360, simulation, index + 1)
    simulation.initWindow(window)
    return simulation
})

const statisticsDisplay = new StatisticsDisplay()

const updateStatistics = () => {
    const currentStatistics = simulations.reduce((accumulatedStatistics, simulation) => {
        const statistics = simulation.getStatistics()
        return {
            infectedCount: accumulatedStatistics.infectedCount + statistics.infectedCount,
            healthyCount: accumulatedStatistics.healthyCount + statistics.healthyCount
        }
    }, { infectedCount: 0, healthyCount: 0 } satisfies SimulationStatistics)
    statisticsDisplay.updateStatistics(currentStatistics)
}

updateStatistics()
setInterval(updateStatistics, 1000)